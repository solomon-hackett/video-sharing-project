"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import useSWR from 'swr';

import { useNotificationSync } from '@/app/hooks/notification-sync';
import { markAllAsRead, markAllAsUnread, markAsRead, markAsUnread } from '@/app/lib/actions';
import { fetcher } from '@/app/lib/fetcher';
import { generatePrettyDate } from '@/app/lib/utils';
import { InboxIcon, XMarkIcon } from '@heroicons/react/24/outline';

import type { Notification } from "@/app/lib/definitions";

export default function InboxButton({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  const prevUnreadRef = useRef(0);

  const { data: notifications = [], mutate } = useSWR<Notification[]>(
    `/api/notifications?userId=${userId}`,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 15000,
    },
  );

  // -----------------------------
  // DERIVED STATE (single source of truth)
  // -----------------------------
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const allRead = notifications.length > 0 && unreadCount === 0;

  // IMPORTANT: hide badge when open
  const showBadge = unreadCount > 0 && !isOpen;

  const displayCount = unreadCount > 9 ? "9+" : unreadCount;

  // -----------------------------
  // CROSS TAB SYNC
  // -----------------------------
  const { broadcastSync } = useNotificationSync(() =>
    mutate(undefined, { revalidate: true }),
  );

  // -----------------------------
  // PULSE ON NEW NOTIFICATIONS
  // -----------------------------
  useEffect(() => {
    const prev = prevUnreadRef.current;

    if (unreadCount > prev) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(t);
    }

    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  // -----------------------------
  // ACTIONS
  // -----------------------------
  async function handleMarkAll(toggleToUnread: boolean) {
    const res = toggleToUnread
      ? await markAllAsUnread(userId)
      : await markAllAsRead(userId);

    if (!res.success) return toast.error(res.error);

    toast.success(
      toggleToUnread ? "Marked all as unread" : "Marked all as read",
    );

    mutate(
      notifications.map((n) => ({
        ...n,
        read: !toggleToUnread,
      })),
      false,
    );

    broadcastSync();
  }

  async function handleToggleRead(id: string, read: boolean) {
    const res = read
      ? await markAsRead(userId, id)
      : await markAsUnread(userId, id);

    if (!res.success) return toast.error(res.error);

    toast.success(read ? "Marked as read" : "Marked as unread");

    mutate(
      notifications.map((n) => (n.id === id ? { ...n, read } : n)),
      false,
    );

    broadcastSync();
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="notification-wrapper">
      {/* BUTTON */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="btn btn-ghost notification-button"
      >
        {isOpen ? <XMarkIcon width={20} /> : <InboxIcon width={20} />}

        {showBadge && (
          <span
            className={`notification-badge ${pulse ? "animate-ping-once" : ""}`}
          >
            {displayCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="card notification-dropdown">
          {/* HEADER (STICKY) */}
          <div className="notification-header">
            <h4 className="mb-2">Notifications</h4>

            <button onClick={() => handleMarkAll(allRead)}>
              {allRead ? "Mark all as unread" : "Mark all as read"}
            </button>

            <div className="divider" />
          </div>

          {/* CONTENT */}
          {notifications.length === 0 ? (
            <p className="text-muted text-sm">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="mb-2">
                <button onClick={() => handleToggleRead(n.id, !n.read)}>
                  {n.read ? "Mark as Unread" : "Mark as Read"}
                </button>

                <p className="text-muted text-xs">{n.type}</p>

                <h5>
                  <ReactMarkdown>
                    {n.payload?.title ?? "No title"}
                  </ReactMarkdown>
                </h5>

                <div className="text-sm">
                  <ReactMarkdown>{n.payload?.message ?? ""}</ReactMarkdown>
                </div>

                <p className="text-muted text-xs">
                  {generatePrettyDate(n.created_at)}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
