import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.accessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const vanityName = session.vanityName;
  if (!vanityName) {
    return NextResponse.json({ error: "no_profile_url" }, { status: 400 });
  }

  const apifyToken = process.env.APIFY_TOKEN;
  if (!apifyToken) {
    return NextResponse.json({ error: "no_apify_token" }, { status: 500 });
  }

  const profileUrl = `https://www.linkedin.com/in/${vanityName}/`;

  // Run Apify LinkedIn profile scraper and wait for results
  const res = await fetch(
    `https://api.apify.com/v2/acts/harvestapi~linkedin-profile-posts/run-sync-get-dataset-items?token=${apifyToken}&timeout=60`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetUrls: [profileUrl],
        maxPosts: 8,
        includeQuotePosts: false,
        includeReposts: false,
        scrapeComments: false,
        scrapeReactions: false,
      }),
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "apify_failed", posts: [] }, { status: 200 });
  }

  const items = await res.json();

  // Each item is one post — text is in the `content` field
  const posts: string[] = items
    .map((item: { content?: string }) => (item.content ?? "").trim())
    .filter((text: string) => text.length > 40);

  return NextResponse.json({ posts, profileUrl });
}
