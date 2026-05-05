import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple in-memory cache for access checks
const accessCache = new Map<string, { hasAccess: boolean; expires: number }>();
const CACHE_TTL_POSITIVE = 10 * 60 * 1000; // 10 minutes
const CACHE_TTL_NEGATIVE = 30 * 1000;      // 30 seconds

const WHOP_API_KEY = process.env.WHOP_API_KEY?.trim();
const WHOP_COMPANY_ID = process.env.WHOP_COMPANY_ID?.trim();
const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET?.trim();
const JWT_SECRET = (process.env.JWT_SECRET || "momentum-secret-key-12345").trim();

if (!WHOP_API_KEY || !WHOP_COMPANY_ID) {
  console.warn("Missing WHOP_API_KEY or WHOP_COMPANY_ID in environment variables.");
} else {
  console.log(`Whop credentials loaded. Company ID starts with: ${WHOP_COMPANY_ID.substring(0, 7)}...`);
}

async function startServer() {
  console.log("Starting server initialization...");
  try {
    const app = express();
    const PORT = 3000;

    // Trust proxy is required for rate limiting behind the AI Studio proxy
    app.set("trust proxy", 1);
    
    // CORS configuration for front-end domains
    app.use(cors({
      origin: [
        "https://tracker-momentum.netlify.app", 
        "https://momentum-sale.netlify.app",
        /\.run\.app$/ // allow AI Studio domains
      ],
      credentials: true
    }));

    // Capture raw body for webhook verification
    app.use(express.json({
      verify: (req: any, res, buf) => {
        if (req.originalUrl.startsWith('/api/webhooks/whop')) {
          req.rawBody = buf;
        }
      }
    }));
    app.use(cookieParser());

    console.log("Middleware configured. Setting up routes...");

  // Rate limit for login
  const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 attempts
    message: { error: "Too many login attempts. Please try again in a minute." },
  });

  // --- API Routes ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      config: {
        whop_api_key_set: !!WHOP_API_KEY,
        whop_company_id_set: !!WHOP_COMPANY_ID,
        whop_webhook_secret_set: !!WHOP_WEBHOOK_SECRET,
        gemini_api_key_set: !!process.env.GEMINI_API_KEY
      }
    });
  });

  // Helper to process memberships and create session
  const processMemberships = (res: express.Response, memberships: any[], sanitizedEmail: string) => {
    console.log(`[Auth] Processing ${memberships.length} potential memberships for ${sanitizedEmail}`);
    
    if (!WHOP_COMPANY_ID) {
      console.error("[Auth] WHOP_COMPANY_ID is missing during processing");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const companyIdToMatch = String(WHOP_COMPANY_ID).trim();

    // 2. Filter by company_id, status, AND email
    const activeMembership = memberships.find((m: any) => {
      const mCompanyId = String(m.company_id || m.company?.id || m.business_id || '').trim();
      const mStatus = String(m.status || '').toLowerCase();
      const mEmail = (m.email || m.user?.email || '').toLowerCase().trim();
      
      const companyMatch = mCompanyId === companyIdToMatch;
      const emailMatch = mEmail === sanitizedEmail;
      const statusMatch = (mStatus === 'active' || mStatus === 'trialing' || mStatus === 'valid' || mStatus === 'completed' || mStatus === 'active_trial');
      
      if (companyMatch && statusMatch) {
        console.log(`[Auth] Checking membership: Email=${mEmail} (Match: ${emailMatch}), Status=${mStatus}, Company=${mCompanyId} (Match: ${companyMatch})`);
      }

      return companyMatch && emailMatch && statusMatch;
    });
    
    if (!activeMembership) {
      console.log(`[Auth] ACCESS DENIED: No active membership found for company ${companyIdToMatch} and email ${sanitizedEmail}`);
      return res.status(401).json({ error: "no valid membership" });
    }

    // 3. Try multiple ways to get the user ID
    const userId = activeMembership.user_id || 
                   activeMembership.user?.id || 
                   (typeof activeMembership.user === 'string' ? activeMembership.user : null) ||
                   activeMembership.customer_id;
                   
    const membershipId = activeMembership.id;
    
    // Extract user profile if available
    const userProfile = activeMembership.user || {};
    const username = userProfile.username || userProfile.name || sanitizedEmail.split('@')[0];
    const profilePic = userProfile.profile_pic_url || userProfile.image_url || '';

    if (!userId) {
      console.error("[Auth] Membership found but user_id is missing.");
      return res.status(500).json({ 
        error: "Invalid membership data from Whop",
        details: "Found a membership but could not identify the user ID."
      });
    }

    console.log(`[Auth] ACCESS GRANTED for user ${userId} (Membership: ${membershipId})`);

    // Cache the access result
    accessCache.set(userId, {
      hasAccess: true,
      expires: Date.now() + CACHE_TTL_POSITIVE
    });

    // Create session token
    const token = jwt.sign(
      {
        email: sanitizedEmail,
        whop_user_id: userId,
        whop_membership_id: membershipId,
        username,
        profile_pic: profilePic
      },
      JWT_SECRET,
      { expiresIn: "365d" }
    );

    res.cookie("momentum_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days
    });

    return res.json({ success: true, user: { email: sanitizedEmail, whop_user_id: userId } });
  };

  // Login Route
  app.post("/api/auth/login", loginLimiter, async (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    try {
      console.log(`[Auth] Login attempt: ${sanitizedEmail}`);
      
      if (!WHOP_API_KEY || !WHOP_COMPANY_ID) {
        console.error("[Auth] Missing Whop credentials.");
        return res.status(500).json({ error: "Server configuration error" });
      }

      // 1. Try multiple Whop API endpoints
      const endpoints = [
        `https://api.whop.com/api/v5/memberships?email=${sanitizedEmail}`,
        `https://api.whop.com/api/v2/memberships?email=${sanitizedEmail}`,
        `https://api.whop.com/api/v1/memberships?email=${sanitizedEmail}`
      ];

      let memberships: any[] = [];

      for (const url of endpoints) {
        try {
          console.log(`[Auth] Fetching: ${url}`);
          const whopRes = await fetch(url, {
            headers: { 
              'Authorization': `Bearer ${WHOP_API_KEY}`,
              'Accept': 'application/json'
            },
          });

          if (whopRes.ok) {
            const data = await whopRes.json();
            const results = data.data || data.memberships || (Array.isArray(data) ? data : []);
            if (results.length > 0) {
              memberships = results;
              console.log(`[Auth] Found ${results.length} memberships at ${url}`);
              break;
            }
          }
        } catch (err: any) {
          console.warn(`[Auth] Error fetching from ${url}: ${err.message}`);
        }
      }

      if (memberships.length === 0) {
        console.log(`[Auth] ACCESS DENIED: No memberships returned from Whop for ${sanitizedEmail}`);
        return res.status(401).json({ error: "no valid membership" });
      }

      return processMemberships(res, memberships, sanitizedEmail);
    } catch (error: any) {
      console.error("[Auth] Critical error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Whop Session Route (for instant login via membershipId)

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
        const userId = decoded.whop_user_id;
        const email = decoded.email;

        // Check cache first
        const cached = accessCache.get(userId);
        if (cached && cached.expires > Date.now()) {
          if (!cached.hasAccess) {
            console.log(`[AuthMe] Cached access denied for ${email} (userId: ${userId})`);
            res.clearCookie("momentum_session");
            return res.status(401).json({ error: "Membership revoked", revoked: true });
          }
          return res.json({ user: decoded });
        }

        console.log(`[AuthMe] Re-verifying access for ${email} (userId: ${userId})...`);
        // We'll try the access endpoint first, then fallback to memberships list if needed
        let hasAccess = false;
        
        try {
          // 1. Try the access endpoint (resource check)
          const accessUrl = `https://api.whop.com/api/v1/users/${userId}/access/${WHOP_COMPANY_ID}`;
          const accessRes = await fetch(accessUrl, {
            headers: { Authorization: `Bearer ${WHOP_API_KEY}` },
          });

          if (accessRes.ok) {
            const accessData = await accessRes.json();
            hasAccess = accessData.has_access === true;
          } else if (accessRes.status === 404) {
            // 2. Fallback: Check memberships list if access endpoint returns 404
            // This is more reliable if WHOP_COMPANY_ID is a company ID rather than a resource ID
            console.log(`[Auth] Access endpoint 404 for ${userId}, falling back to memberships list...`);
            const membershipsUrl = `https://api.whop.com/api/v1/users/${userId}/memberships`;
            const memRes = await fetch(membershipsUrl, {
              headers: { Authorization: `Bearer ${WHOP_API_KEY}` },
            });

            if (memRes.ok) {
              const memData = await memRes.json();
              const results = memData.data || memData.memberships || (Array.isArray(memData) ? memData : []);
              
              hasAccess = results.some((m: any) => {
                const mCompanyId = String(m.company_id || m.company?.id || '').trim();
                const mStatus = String(m.status || '').toLowerCase();
                const mEmail = (m.email || m.user?.email || '').toLowerCase().trim();
                
                const companyMatch = mCompanyId === String(WHOP_COMPANY_ID).trim();
                const emailMatch = mEmail === email.toLowerCase().trim();
                const statusMatch = (mStatus === 'active' || mStatus === 'trialing' || mStatus === 'valid' || mStatus === 'completed');
                
                if (companyMatch && statusMatch) {
                  console.log(`[AuthMe] Found potential match: Email=${mEmail} (Match: ${emailMatch}), Status=${mStatus}, Company=${mCompanyId}`);
                }
                
                return companyMatch && emailMatch && statusMatch;
              });
            }
          }
        } catch (err) {
          console.error("[Auth] Error during background access check:", err);
          // On network error, we allow the session to continue if it's already established
          return res.json({ user: decoded });
        }

        // Update cache
        const ttl = hasAccess ? CACHE_TTL_POSITIVE : CACHE_TTL_NEGATIVE;
        accessCache.set(userId, {
          hasAccess,
          expires: Date.now() + ttl
        });

        if (!hasAccess) {
          console.log(`[AuthMe] Access denied for ${email} (userId: ${userId}) after re-verification`);
          res.clearCookie("momentum_session");
          return res.status(401).json({ error: "Membership revoked", revoked: true });
        }

        res.json({ user: decoded });
      } catch (error) {
        res.clearCookie("momentum_session");
        res.status(401).json({ error: "Invalid session" });
      }
    });

  // Webhook Route
  app.post("/api/webhooks/whop", async (req: any, res) => {
    const signature = req.headers["x-whop-signature"];
    const event = req.body;

    // Verify signature if secret is configured
    if (WHOP_WEBHOOK_SECRET) {
      if (!signature) {
        console.warn("[Webhook] Missing x-whop-signature header");
        return res.status(401).json({ error: "Missing signature" });
      }

      const hmac = crypto.createHmac("sha256", WHOP_WEBHOOK_SECRET);
      const digest = hmac.update(req.rawBody || "").digest("hex");

      if (signature !== digest) {
        console.warn("[Webhook] Invalid signature detected");
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    console.log(`[Webhook] Received Whop Event: ${event.action}`);

    if (event.action === "membership.went_invalid") {
      const userId = event.data?.user_id;
      if (userId) {
        console.log(`[Webhook] Revoking access for user: ${userId}`);
        accessCache.set(userId, { hasAccess: false, expires: Date.now() + CACHE_TTL_NEGATIVE });
      }
    } else if (event.action === "membership.went_valid") {
      const userId = event.data?.user_id;
      if (userId) {
        console.log(`[Webhook] Granting access for user: ${userId}`);
        accessCache.set(userId, { hasAccess: true, expires: Date.now() + CACHE_TTL_POSITIVE });
      }
    }

    res.json({ received: true });
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

  // Global error handler for API routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api/')) {
      console.error(`[API Error] ${req.method} ${req.path}:`, err);
      return res.status(500).json({
        error: "Internal server error",
        message: err.message,
        path: req.path
      });
    }
    next(err);
  });

  // --- Vite / Static Serving ---

  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware attached.");
  } else {
    console.log("Starting in production mode...");
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
