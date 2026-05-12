import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { BUCKETS, s3 } from '@/app/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET_MAP: Record<string, string> = {
  video: BUCKETS.videos,
  thumbnail: BUCKETS.thumbnails,
  avatar: BUCKETS.avatars,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const contentType =
    searchParams.get("contentType") ?? "application/octet-stream";
  const ext = searchParams.get("ext") ?? "bin";

  if (!type || !BUCKET_MAP[type]) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const bucket = BUCKET_MAP[type];
  const key = `${uuidv4()}.${ext}`;

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ChecksumAlgorithm: undefined,
    }),
    { expiresIn: 300 },
  );

  return NextResponse.json({ url, key });
}
