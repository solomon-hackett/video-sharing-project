"use client";

import { useState } from "react";

import { InboxIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function InboxButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="btn btn-ghost">
        {isOpen ? (
          <XMarkIcon style={{ width: 20, height: 20 }} strokeWidth={2} />
        ) : (
          <InboxIcon style={{ width: 20, height: 20 }} strokeWidth={2} />
        )}
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

          <p className="text-muted text-sm">No notifications yet.</p>
        </div>
      )}
    </div>
  );
}
