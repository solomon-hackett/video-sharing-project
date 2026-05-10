import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  endpoint: `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
  region: process.env.MINIO_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export const BUCKETS = {
  videos: "solostream-videos",
  thumbnails: "solostream-thumbnails",
  avatars: "solostream-user-images",
};
