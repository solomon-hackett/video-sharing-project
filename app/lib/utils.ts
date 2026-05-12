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

  if (isNaN(date.getTime())) {
    return "invalid date";
  }

  const diff = Math.floor((date.getTime() - Date.now()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
  });

  const intervals = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ] as const;

  for (const [unit, seconds] of intervals) {
    const value = Math.trunc(diff / seconds);

    if (Math.abs(value) >= 1) {
      return rtf.format(value, unit);
    }
  }

  return "just now";
}
