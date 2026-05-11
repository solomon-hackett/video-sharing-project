// utils/thumbnail.ts
export async function generateThumbnail(
  file: File,
  seekTime = 1,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const url = URL.createObjectURL(file);

    video.src = url;
    video.currentTime = seekTime; // seek to 1s by default
    video.muted = true;

    video.addEventListener("seeked", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")!.drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          blob ? resolve(blob) : reject(new Error("Failed to create blob"));
        },
        "image/jpeg",
        0.8,
      );
    });

    video.addEventListener("error", reject);
    video.load();
  });
}
