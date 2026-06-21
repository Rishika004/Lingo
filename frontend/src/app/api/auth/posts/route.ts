import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.accessToken || !session.sub) {
    return NextResponse.json({ posts: null, error: "not_authenticated" }, { status: 401 });
  }

  // Try r_member_social — restricted, may return 403
  const res = await fetch(
    `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn%3Ali%3Aperson%3A${session.sub})&count=5&sortBy=LAST_MODIFIED`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    }
  );

  if (!res.ok) {
    // 403 = permission not granted, return signal so UI can show manual paste
    return NextResponse.json({ posts: null, error: "permission_denied" }, { status: 200 });
  }

  const data = await res.json();
  const posts: string[] = (data.elements ?? [])
    .map((el: { specificContent?: { "com.linkedin.ugc.ShareContent"?: { shareCommentary?: { text?: string } } } }) =>
      el?.specificContent?.["com.linkedin.ugc.ShareContent"]?.shareCommentary?.text
    )
    .filter(Boolean);

  return NextResponse.json({ posts, error: null });
}
