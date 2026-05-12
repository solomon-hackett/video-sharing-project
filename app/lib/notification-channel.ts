let channel: BroadcastChannel | null = null;

export function getNotificationChannel() {
  if (typeof window === "undefined") return null;

  if (!channel) {
    channel = new BroadcastChannel("notifications");
  }

  return channel;
}

export function closeNotificationChannel() {
  channel?.close();
  channel = null;
}
