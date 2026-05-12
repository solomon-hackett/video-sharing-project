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
