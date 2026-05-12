export async function uploadViaPresignedUrl(
  file: File | Blob,
  type: "video" | "thumbnail" | "avatar",
  contentType: string,
  ext: string,
  onProgress?: (percent: number) => void,
): Promise<{ ok: boolean; key?: string; error?: string }> {
  const res = await fetch(
    `/api/upload/presign?type=${type}&contentType=${encodeURIComponent(contentType)}&ext=${ext}`,
  );
  if (!res.ok) return { ok: false, error: "Failed to get upload URL." };
  const { url, key } = await res.json();

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ ok: true, key });
      } else {
        resolve({ ok: false, error: "Upload failed." });
      }
    };

    xhr.onerror = () => resolve({ ok: false, error: "Upload failed." });

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
}
