"use client";

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { generatePrettyDate } from '@/app/lib/utils';
import { InboxIcon, XMarkIcon } from '@heroicons/react/24/outline';

import type { Notification } from "@/app/lib/definitions";
export default function InboxButton({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen || notifications !== null) return;

    fetch(`/api/notifications?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch(() => setNotifications([]));
  }, [isOpen, userId, notifications]);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen((v) => !v)} className="btn btn-ghost">
        {isOpen ? <XMarkIcon width={20} /> : <InboxIcon width={20} />}
      </button>

      {isOpen && (
        <div
          className="card"
          style={{
            position: "absolute",
            top: "calc(100% + 5px)",
            right: 0,
            width: 320,
            zIndex: 500,
          }}
        >
          <h4 className="mb-2">Notifications</h4>
          <div className="divider" />

          {notifications === null ? (
            <p className="text-muted text-sm">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="text-muted text-sm">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="mb-2">
                <p className="text-muted text-xs">{n.type}</p>
                <h5>
                  <ReactMarkdown>
                    {n.payload?.title ?? "No title"}
                  </ReactMarkdown>
                </h5>
                <p className="text-sm">
                  <ReactMarkdown>{n.payload?.message ?? ""}</ReactMarkdown>
                </p>
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
