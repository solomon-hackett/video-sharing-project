export async function uploadViaPresignedUrl(
  file: File | Blob,
  type: "video" | "thumbnail" | "avatar",
  contentType: string,
  ext: string,
  onProgress?: (percent: number) => void,
): Promise<{ ok: boolean; key?: string; error?: string }> {
  let displayedProgress = 0;
  let targetProgress = 0;

  const animate = () => {
    const tick = () => {
      if (displayedProgress < targetProgress) {
        displayedProgress += 1;
        onProgress?.(displayedProgress);
      }

      requestAnimationFrame(tick);
    };

    tick();
  };

  animate();

  const setProgress = (value: number) => {
    targetProgress = Math.max(targetProgress, value);
  };

  const res = await fetch(
    `/api/upload/presign?type=${type}&contentType=${encodeURIComponent(contentType)}&ext=${ext}`,
  );

  if (!res.ok) {
    return { ok: false, error: "Failed to get upload URL." };
  }

  const { url, key } = await res.json();

  const uploadOk = await new Promise<boolean>((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        // Upload = 0 → 50
        const percent = Math.round((e.loaded / e.total) * 50);
        setProgress(percent);
      }
    };

    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });

  if (!uploadOk) {
    return { ok: false, error: "Upload failed." };
  }

  if (type === "video") {
    // Slowly creep while waiting for first transcode event
    let fakeProgress = 50;

    const creep = setInterval(() => {
      if (fakeProgress < 95) {
        fakeProgress += 1;
        setProgress(fakeProgress);
      }
    }, 500);

    const finalKey = await new Promise<string | null>((resolve) => {
      const evtSource = new EventSource(
        `/api/upload/transcode?key=${encodeURIComponent(key)}`,
      );

      evtSource.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.percent !== undefined) {
          // Real transcode progress = 50 → 100
          const percent = 50 + Math.round(data.percent / 2);
          setProgress(percent);
        }

        if (data.done) {
          clearInterval(creep);
          evtSource.close();

          setProgress(100);

          resolve(data.key);
        }

        if (data.error) {
          clearInterval(creep);
          evtSource.close();
          resolve(null);
        }
      };

      evtSource.onerror = () => {
        clearInterval(creep);
        evtSource.close();
        resolve(null);
      };
    });

    if (!finalKey) {
      return { ok: false, error: "Transcode failed." };
    }

    return { ok: true, key: finalKey };
  }

  setProgress(100);

  return { ok: true, key };
}
