import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { auth } from '@/app/lib/auth';
import { BUCKETS, s3 } from '@/app/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ─── Config ───────────────────────────────────────────────────────────────────

const UPLOAD_CONFIG = {
  video: {
    bucket: BUCKETS.videos,
    mimePattern: /^video\//,
    maxBytes: 500_000_000, // 500 MB — enforce via S3 bucket policy
    public: false,
  },
  thumbnail: {
    bucket: BUCKETS.thumbnails,
    mimePattern: /^image\//,
    maxBytes: 5_000_000, // 5 MB — enforce via S3 bucket policy
    public: false,
  },
  avatar: {
    bucket: BUCKETS.avatars,
    mimePattern: /^image\//,
    maxBytes: 2_000_000, // 2 MB — enforce via S3 bucket policy
    public: true,
  },
} as const;

type UploadType = keyof typeof UPLOAD_CONFIG;

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // 1. Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse + validate params
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as UploadType | null;
  const contentType = searchParams.get("contentType");
  const ext = (searchParams.get("ext") ?? "bin").replace(/[^a-z0-9]/gi, "");

  if (!type || !(type in UPLOAD_CONFIG)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const config = UPLOAD_CONFIG[type];

  if (!contentType || !config.mimePattern.test(contentType)) {
    return NextResponse.json(
      { error: "Invalid contentType for upload type" },
      { status: 400 },
    );
  }

  // 3. User-scoped key
  const key = `${session.user.id}/${uuidv4()}.${ext}`;

  // 4. Build the presigned PUT URL
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ContentType: contentType,
      ...(config.public && { ACL: "public-read" }),
    }),
    {
      expiresIn: 300,
      signableHeaders: new Set(["content-type"]),
      unhoistableHeaders: new Set(["content-length"]),
    },
  );

  // 5. Permanent public URL for avatars, undefined for private types
  const publicUrl = config.public
    ? `https://${config.bucket}.s3.amazonaws.com/${key}`
    : undefined;

  // 6. Return maxBytes so the client can validate before uploading
  return NextResponse.json({ url, key, publicUrl, maxBytes: config.maxBytes });
}
