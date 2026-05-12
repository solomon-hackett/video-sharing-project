"use client";

import { useEffect } from 'react';

import { getNotificationChannel } from '@/app/lib/notification-channel';

export function useNotificationSync(onSync: () => void) {
  useEffect(() => {
    const channel = getNotificationChannel();
    if (!channel) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "SYNC") {
        onSync();
      }
    };

    channel.addEventListener("message", handler);

    return () => {
      channel.removeEventListener("message", handler);
    };
  }, [onSync]);

  const broadcastSync = () => {
    const channel = getNotificationChannel();
    channel?.postMessage({ type: "SYNC" });
  };

  return { broadcastSync };
}
