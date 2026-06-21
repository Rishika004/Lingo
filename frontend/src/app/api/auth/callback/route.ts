import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?auth=error", req.url));
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI ?? "http://localhost:3000/api/auth/callback";

  // Exchange code for access token
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/?auth=error", req.url));
  }

  const { access_token } = await tokenRes.json();

  // Fetch user profile via OpenID Connect userinfo endpoint
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!profileRes.ok) {
    return NextResponse.redirect(new URL("/?auth=error", req.url));
  }

  const profile = await profileRes.json();

  // Fetch vanity name for Apify scraping
  let vanityName = "";
  const vanityRes = await fetch("https://api.linkedin.com/v2/me?projection=(vanityName)", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (vanityRes.ok) {
    const v = await vanityRes.json();
    vanityName = v.vanityName ?? "";
  }

  // Save to encrypted session cookie
  const session = await getSession();
  session.accessToken = access_token;
  session.name = profile.name;
  session.picture = profile.picture;
  session.sub = profile.sub;
  session.vanityName = vanityName;
  await session.save();

  return NextResponse.redirect(new URL("/", req.url));
}
