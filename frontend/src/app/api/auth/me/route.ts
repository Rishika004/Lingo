import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.accessToken) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({
    user: {
      name: session.name,
      picture: session.picture,
      sub: session.sub,
      vanityName: session.vanityName,
    },
  });
}
