import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { BUCKETS, s3 } from "@/app/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;
  const bucket = BUCKETS.avatars;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!file.type.startsWith("image/"))
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json(
      { error: "File too large (max 2MB)" },
      { status: 400 },
    );
  const ext = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    }),
  );
  const url = `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket}/${fileName}`;
  return NextResponse.json({ url });
}
