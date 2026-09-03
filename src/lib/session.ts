import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
};

export type SessionData = {
  user?: SessionUser;
};

export function getSessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return {
    password,
    cookieName: "bluenex_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}

export async function getCurrentUser() {
  const session = await getSession();
  return session.user ?? null;
}

export function requireAccount() {
  return process.env.REQUIRE_CUSTOMER_ACCOUNT === "true";
}
