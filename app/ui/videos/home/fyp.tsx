"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import VideoCard from "../video-card";

import type { Video } from "@/app/lib/definitions";
export default function FYP() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const fetchInProgress = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchFYP = useCallback(async () => {
    if (fetchInProgress.current || !hasMore) return;
    fetchInProgress.current = true;
    const res = await fetch(
      `/api/fetch/fyp-feed${cursor ? `?cursor=${cursor}` : ``}`,
    );
    if (!res.ok) {
      console.error("Feed fetch failed:", res.status, await res.text());
      fetchInProgress.current = false;
      return;
    }
    const data = await res.json();
    if (!data) {
      fetchInProgress.current = false;
      return;
    }

    setVideos((prev) => {
      const existingIds = new Set(prev.map((v) => v.id));
      return [
        ...prev,
        ...data.videos.filter((v: Video) => !existingIds.has(v.id)),
      ];
    });
    setCursor(data.nextCursor);
    if (!data.nextCursor) setHasMore(false);
    fetchInProgress.current = false;
  }, [cursor, hasMore, fetchInProgress]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchFYP();
      }
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [fetchFYP]);
  return (
    <div>
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
      <div ref={sentinelRef} id="sentinel" aria-hidden></div>
    </div>
  );
}
