import { NextRequest, NextResponse } from "next/server";

import { BUCKETS, s3 } from "@/app/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

const bucketMap = {
  avatar: BUCKETS.avatars,
  video: BUCKETS.videos,
  thumbnail: BUCKETS.thumbnails,
} as const;

type FileType = keyof typeof bucketMap;

export async function DELETE(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const type = req.nextUrl.searchParams.get("type") as FileType | null;

  if (!key || !type) {
    return NextResponse.json({ error: "Missing key or type" }, { status: 400 });
  }

  const bucket = bucketMap[type];

  if (!bucket) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
