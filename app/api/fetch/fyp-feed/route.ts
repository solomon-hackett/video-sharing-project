import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/lib/auth";
import { fetchFYP } from "@/app/lib/data";
import { generatePrettyDate } from "@/app/lib/utils";

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
          created_at: lastVideo.created_at,
        }),
      )
    : null;
  return NextResponse.json({
    videos: videos.map((video) => ({
      ...video,
      created_at: generatePrettyDate(video.created_at),
    })),
    nextCursor,
  });
}
