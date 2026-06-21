import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  accessToken?: string;
  name?: string;
  picture?: string;
  sub?: string;
  vanityName?: string; // LinkedIn profile slug e.g. "rishika-thakur"
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "complex-password-at-least-32-characters-long!!",
  cookieName: "lingo_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
