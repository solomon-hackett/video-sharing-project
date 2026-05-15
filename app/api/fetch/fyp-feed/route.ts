import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/lib/auth";
import { fetchFYP } from "@/app/lib/data";

export async function GET(req: NextRequest) {
  const cursorParam = req.nextUrl.searchParams.get("cursor");
  const userId = (await auth.api.getSession({ headers: await headers() }))?.user
    .id;
  const videos = await fetchFYP(userId, cursorParam);
  if (!videos) {
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 },
    );
  }
  const lastVideo = videos[videos.length - 1];
  const nextCursor = lastVideo
    ? btoa(
        JSON.stringify({
          tag_overlap: lastVideo.tag_overlap,
          like_count: lastVideo.like_count,
          comment_count: lastVideo.comment_count,
          id: lastVideo.id,
        }),
      )
    : null;
  return NextResponse.json({ videos, nextCursor });
}
