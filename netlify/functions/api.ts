import express from "express";
import serverless from "serverless-http";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import crypto from "crypto";

const app = express();

const accessCache = new Map<string, { hasAccess: boolean; expires: number }>();
const CACHE_TTL_POSITIVE = 10 * 60 * 1000;
const CACHE_TTL_NEGATIVE = 30 * 1000;

const WHOP_API_KEY = process.env.WHOP_API_KEY?.trim();
const WHOP_COMPANY_ID = process.env.WHOP_COMPANY_ID?.trim();
const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET?.trim();
const JWT_SECRET = (process.env.JWT_SECRET || "momentum-secret-key-12345").trim();

app.use(cors({
  origin: [
    "https://tracker-momentum.netlify.app", 
    "https://momentum-sale.netlify.app",
    "http://localhost:3000",
    "http://localhost:5173",
    /\.run\.app$/ 
  ],
  credentials: true
}));

app.use(express.json({
  verify: (req: any, res, buf) => {
    if (req.originalUrl.startsWith('/api/webhooks/whop')) {
      req.rawBody = buf;
    }
  }
}));

app.use(cookieParser());

// Helper to process memberships and create session
const processMemberships = (res: express.Response, memberships: any[], sanitizedEmail: string) => {
  if (!WHOP_COMPANY_ID) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  const companyIdToMatch = String(WHOP_COMPANY_ID).trim();
  const activeMembership = memberships.find((m: any) => {
    const mCompanyId = String(m.company_id || m.company?.id || m.business_id || '').trim();
    const mStatus = String(m.status || '').toLowerCase();
    const mEmail = (m.email || m.user?.email || '').toLowerCase().trim();
    
    const companyMatch = mCompanyId === companyIdToMatch;
    const emailMatch = mEmail === sanitizedEmail;
    const statusMatch = (mStatus === 'active' || mStatus === 'trialing' || mStatus === 'valid' || mStatus === 'completed' || mStatus === 'active_trial');
    
    return companyMatch && emailMatch && statusMatch;
  });
  
  if (!activeMembership) {
    return res.status(401).json({ error: "no valid membership" });
  }

  const userId = activeMembership.user_id || 
                 activeMembership.user?.id || 
                 (typeof activeMembership.user === 'string' ? activeMembership.user : null) ||
                 activeMembership.customer_id;
                 
  const membershipId = activeMembership.id;
  const userProfile = activeMembership.user || {};
  const username = userProfile.username || userProfile.name || sanitizedEmail.split('@')[0];
  const profilePic = userProfile.profile_pic_url || userProfile.image_url || '';

  if (!userId) {
    return res.status(500).json({ error: "Invalid membership data from Whop" });
  }

  accessCache.set(userId, { hasAccess: true, expires: Date.now() + CACHE_TTL_POSITIVE });

  const token = jwt.sign(
    { email: sanitizedEmail, whop_user_id: userId, whop_membership_id: membershipId, username, profile_pic: profilePic },
    JWT_SECRET,
    { expiresIn: "365d" }
  );

  res.cookie("momentum_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });

  return res.json({ success: true, user: { email: sanitizedEmail, whop_user_id: userId } });
};

app.post("/api/auth/login", async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }

  const sanitizedEmail = email.trim().toLowerCase();

  try {
    if (!WHOP_API_KEY || !WHOP_COMPANY_ID) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const endpoints = [
      `https://api.whop.com/api/v5/memberships?email=${sanitizedEmail}`,
      `https://api.whop.com/api/v2/memberships?email=${sanitizedEmail}`,
      `https://api.whop.com/api/v1/memberships?email=${sanitizedEmail}`
    ];

    let memberships: any[] = [];
    for (const url of endpoints) {
      try {
        const whopRes = await fetch(url, {
          headers: { 'Authorization': `Bearer ${WHOP_API_KEY}`, 'Accept': 'application/json' },
        });

        if (whopRes.ok) {
          const data = await whopRes.json();
          const results = data.data || data.memberships || (Array.isArray(data) ? data : []);
          if (results.length > 0) {
            memberships = results;
            break;
          }
        }
      } catch (err) {}
    }

    if (memberships.length === 0) {
      return res.status(401).json({ error: "no valid membership" });
    }

    return processMemberships(res, memberships, sanitizedEmail);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("momentum_session");
  res.json({ success: true });
});

app.get("/api/auth/me", async (req, res) => {
  const token = req.cookies.momentum_session;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.whop_user_id;

    res.json({ user: decoded });
  } catch (error) {
    res.clearCookie("momentum_session");
    res.status(401).json({ error: "Invalid session" });
  }
});

app.post("/api/webhooks/whop", async (req: any, res) => {
  res.json({ received: true });
});

export const handler = serverless(app);
