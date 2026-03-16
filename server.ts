import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WHOP_API_KEY = process.env.WHOP_API_KEY?.trim();
const WHOP_COMPANY_ID = process.env.WHOP_COMPANY_ID?.trim();
const JWT_SECRET = (process.env.JWT_SECRET || "momentum-secret-key-12345").trim();

if (!WHOP_API_KEY || !WHOP_COMPANY_ID) {
  console.warn("Missing WHOP_API_KEY or WHOP_COMPANY_ID in environment variables.");
}

async function startServer() {
  try {
    const app = express();
    const PORT = 3000;

    // Trust proxy is required for rate limiting behind the AI Studio proxy
    app.set("trust proxy", 1);

    app.use(express.json());
    app.use(cookieParser());

  // Rate limit for login
  const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 attempts
    message: { error: "Too many login attempts. Please try again in a minute." },
  });

  // --- API Routes ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Login Route
  app.post("/api/auth/login", loginLimiter, async (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    try {
      console.log(`Attempting login for email: ${sanitizedEmail}`);
      
      if (!WHOP_API_KEY || !WHOP_COMPANY_ID) {
        console.error("Missing Whop credentials in environment variables.");
        return res.status(500).json({ error: "Server configuration error: Missing Whop credentials." });
      }

      // 1. Fetch valid memberships for this specific email
      const membershipsUrl = `https://api.whop.com/api/v5/memberships?company_id=${WHOP_COMPANY_ID}&valid=true&email=${sanitizedEmail}`;
      console.log(`Fetching memberships for email from: ${membershipsUrl}`);
      
      const membershipsRes = await fetch(membershipsUrl, {
        headers: { Authorization: `Bearer ${WHOP_API_KEY}` },
      });

      if (!membershipsRes.ok) {
        const errorText = await membershipsRes.text();
        console.error(`Whop API error (${membershipsRes.status}): ${errorText}`);
        throw new Error(`Failed to fetch memberships from Whop: ${membershipsRes.status}`);
      }

      const membershipsData = await membershipsRes.json();
      const memberships = membershipsData.data || [];
      console.log(`Found ${memberships.length} valid memberships for this email.`);

      // 2. Use the first valid membership found
      const matchedMembership = memberships[0];

      if (matchedMembership) {
        // Create session token
        const token = jwt.sign(
          {
            email: sanitizedEmail,
            whop_user_id: matchedMembership.user_id,
            whop_membership_id: matchedMembership.id,
          },
          JWT_SECRET,
          { expiresIn: "24h" }
        );

        res.cookie("momentum_session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        return res.json({ success: true });
      }

      return res.status(401).json({ error: "no valid membership" });
    } catch (error: any) {
      console.error("Auth error:", error);
      return res.status(500).json({ 
        error: "Internal server error", 
        details: error.message,
        hint: "Check if your WHOP_API_KEY and WHOP_COMPANY_ID are correctly set in the Secrets tab."
      });
    }
  });

  // Logout Route
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("momentum_session");
    res.json({ success: true });
  });

  // Auth Status Route
  app.get("/api/auth/me", async (req, res) => {
    const token = req.cookies.momentum_session;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Re-verify membership status with Whop
      const membershipRes = await fetch(`https://api.whop.com/api/v5/memberships/${decoded.whop_membership_id}`, {
        headers: { Authorization: `Bearer ${WHOP_API_KEY}` },
      });

      if (!membershipRes.ok) {
        res.clearCookie("momentum_session");
        return res.status(401).json({ error: "Membership not found or revoked" });
      }

      const membership = await membershipRes.json();
      
      // Check if membership is still valid
      if (!membership.valid) {
        res.clearCookie("momentum_session");
        return res.status(401).json({ error: "Membership revoked", revoked: true });
      }

      res.json({ user: decoded });
    } catch (error) {
      res.clearCookie("momentum_session");
      res.status(401).json({ error: "Invalid session" });
    }
  });

  // Catch-all for unmatched API routes
  app.use("/api/*", (req, res) => {
    console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
      error: "API route not found", 
      method: req.method, 
      path: req.originalUrl 
    });
  });

  // --- Vite / Static Serving ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer().catch(err => {
  console.error("Fatal server error:", err);
  process.exit(1);
});
