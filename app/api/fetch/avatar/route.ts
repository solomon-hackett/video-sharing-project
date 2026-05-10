import { NextRequest, NextResponse } from "next/server";

import { BUCKETS, s3 } from "@/app/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  const object = await s3.send(
    new GetObjectCommand({ Bucket: BUCKETS.avatars, Key: key }),
  );

  const buffer = await object.Body!.transformToByteArray();

  return new Response(buffer.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": object.ContentType ?? "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
