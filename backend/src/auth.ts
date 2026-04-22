import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const JWT_EXPIRES_IN = "30d";

const TEST_USER_EMAILS = new Set(
  (process.env.TEST_USER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

function isTestEmail(email: string): boolean {
  return TEST_USER_EMAILS.has(email.toLowerCase());
}

if (!GOOGLE_CLIENT_ID) {
  console.warn(
    "⚠️  GOOGLE_CLIENT_ID not set — Google sign-in will fail. Set it in your env.",
  );
}
if (JWT_SECRET === "dev-secret-change-me" && process.env.NODE_ENV === "production") {
  console.warn("⚠️  JWT_SECRET is unset in production — using insecure default.");
}

const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface SessionUser {
  userId: string;
  email: string;
  name?: string;
  picture?: string;
  isTestUser: boolean;
}

export async function verifyGoogleIdToken(idToken: string): Promise<SessionUser> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID not configured on server");
  }
  const ticket = await oauthClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new Error("Google token missing sub/email");
  }
  return {
    userId: `g_${payload.sub}`,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    isTestUser: isTestEmail(payload.email),
  };
}

export function signSessionToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifySessionToken(token: string): SessionUser {
  const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & SessionUser;
  return {
    userId: decoded.userId,
    email: decoded.email,
    name: decoded.name,
    picture: decoded.picture,
    isTestUser: isTestEmail(decoded.email),
  };
}

export function requireTestUser(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user?.isTestUser) {
    return res.status(403).json({ error: "test-user only" });
  }
  next();
}

export interface AuthedRequest extends Request {
  user?: SessionUser;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ error: "missing bearer token" });
  }
  try {
    req.user = verifySessionToken(match[1]);
    next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
}
