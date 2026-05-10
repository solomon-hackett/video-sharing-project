import { NextRequest, NextResponse } from "next/server";

import { BUCKETS, s3 } from "@/app/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKETS.avatars, Key: key }),
    { expiresIn: 60 * 60 },
  );

  return NextResponse.redirect(url);
}
