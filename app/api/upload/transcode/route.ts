export const maxDuration = 300;
export const dynamic = "force-dynamic";

import { execFile } from "child_process";
import ffmpegBin from "ffmpeg-static";
import { createReadStream, createWriteStream, unlink } from "fs";
import { stat } from "fs/promises";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import { join } from "path";
import { Readable } from "stream";
import { promisify } from "util";

import { auth } from "@/app/lib/auth";
import { BUCKETS, s3 } from "@/app/lib/s3";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import type { ReadableStream as NodeReadableStream } from "stream/web";
const unlinkAsync = promisify(unlink);

const FFMPEG =
  process.platform === "win32"
    ? "C:\\Users\\Sol Hackett\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-full_build\\bin\\ffmpeg.exe"
    : (ffmpegBin ?? "ffmpeg");

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const key = req.nextUrl.searchParams.get("key");
  if (!key || !key.startsWith(`${session.user.id}/`)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  const send = (data: object) =>
    encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

  const stream = new ReadableStream({
    async start(controller) {
      const tmpIn = join(tmpdir(), `${crypto.randomUUID()}-in`);
      const tmpOut = join(tmpdir(), `${crypto.randomUUID()}-out.mp4`);
      try {
        const object = await s3.send(
          new GetObjectCommand({ Bucket: BUCKETS.videos, Key: key }),
        );
        await streamToFile(object.Body!.transformToWebStream(), tmpIn);

        // 2. Get duration for progress
        const duration = await getVideoDuration(tmpIn);
        await transcodeWithProgress(tmpIn, tmpOut, duration, (percent) => {
          controller.enqueue(send({ percent }));
        });

        // 4. Verify output
        const { size } = await stat(tmpOut);
        if (size === 0) throw new Error("Transcoded file is empty");

        // 5. Upload MP4 back to MinIO
        const newKey = key.replace(/\.[^.]+$/, ".mp4");
        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKETS.videos,
            Key: newKey,
            Body: createReadStream(tmpOut),
            ContentType: "video/mp4",
            ContentLength: size,
          }),
        );

        // 6. Delete original
        await s3.send(
          new DeleteObjectCommand({ Bucket: BUCKETS.videos, Key: key }),
        );

        controller.enqueue(send({ done: true, key: newKey }));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Transcode error:", message);
        controller.enqueue(send({ error: true }));
      } finally {
        await unlinkAsync(tmpIn).catch(() => {});
        await unlinkAsync(tmpOut).catch(() => {});
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function streamToFile(stream: ReadableStream, path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const writer = createWriteStream(path);
    Readable.fromWeb(stream as unknown as NodeReadableStream).pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

function getVideoDuration(input: string): Promise<number> {
  return new Promise((resolve) => {
    execFile(FFMPEG, ["-i", input], (_err, _stdout, stderr) => {
      const match = stderr.match(/Duration:\s(\d+):(\d+):([\d.]+)/);
      if (match) {
        const h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const s = parseFloat(match[3]);
        resolve(h * 3600 + m * 60 + s);
      } else {
        resolve(0);
      }
    });
  });
}

function transcodeWithProgress(
  input: string,
  output: string,
  duration: number,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = execFile(FFMPEG, [
      "-i",
      input,
      "-c:v",
      "libx264",
      "-profile:v",
      "baseline",
      "-level",
      "3.0",
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      "-ar",
      "44100",
      "-movflags",
      "faststart",
      "-preset",
      "fast",
      "-crf",
      "23",
      "-pix_fmt",
      "yuv420p",
      "-y",
      output,
    ]);

    proc.stderr?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      const match = text.match(/out_time_ms=(\d+)/);
      if (match && duration > 0) {
        const ms = parseInt(match[1]);
        const percent = Math.min(
          Math.round((ms / 1_000_000 / duration) * 100),
          99,
        );
        onProgress(percent);
      }
    });

    proc.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)),
    );
  });
}
