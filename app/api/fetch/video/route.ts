import { NextRequest, NextResponse } from 'next/server';

import { BUCKETS, s3 } from '@/app/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  if (process.env.VIDEO_DELIVERY === "proxy") {
    const rangeHeader = req.headers.get("range");
    const object = await s3.send(
      new GetObjectCommand({
        Bucket: BUCKETS.videos,
        Key: key,
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      }),
    );
    const stream = object.Body!.transformToWebStream();
    return new NextResponse(stream, {
      status: rangeHeader && object.ContentRange ? 206 : 200,
      headers: {
        "Content-Type": object.ContentType ?? "video/mp4",
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=300",
        ...(object.ContentLength
          ? { "Content-Length": String(object.ContentLength) }
          : {}),
        ...(object.ContentRange
          ? { "Content-Range": object.ContentRange }
          : {}),
      },
    });
  }

  // presigned
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKETS.videos, Key: key }),
    { expiresIn: 300 },
  );
  return NextResponse.redirect(url);
}
