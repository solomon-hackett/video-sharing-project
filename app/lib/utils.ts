type ThumbnailResult = { ok: true; blob: Blob } | { ok: false; error: string };

export async function generateThumbnail(
  file: File | null,
  seekTime = 1,
): Promise<ThumbnailResult> {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ ok: false, error: "No file provided." });
      return;
    }

    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const url = URL.createObjectURL(file);

    video.src = url;
    video.muted = true;
    video.preload = "metadata";

    video.addEventListener("loadedmetadata", () => {
      video.currentTime = Math.min(seekTime, video.duration);
    });

    video.addEventListener("seeked", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")!.drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve({ ok: true, blob });
          } else {
            resolve({ ok: false, error: "Failed to capture thumbnail." });
          }
        },
        "image/jpeg",
        0.8,
      );
    });

    video.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      resolve({ ok: false, error: "Failed to load video." });
    });

    video.load();
  });
}

export function generatePrettyDate(timestamp: string | Date | number): string {
  const date = new Date(timestamp);
  const now = new Date();

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(date.getTime())) {
    return "invalid date";
  }

  const intervals: { label: string; seconds: number }[] = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);

    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}
