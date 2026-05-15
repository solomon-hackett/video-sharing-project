"use client";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/app/lib/auth-client";
import { fetchComments } from "@/app/lib/data";
import { Comment, Video } from "@/app/lib/definitions";
import {
  ChatBubbleLeftEllipsisIcon as ChatBubbleIcon,
  HeartIcon as EmptyHeartIcon,
  PaperAirplaneIcon as SendIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function VideoCard({ video }: { video: Video }) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  async function handleComments() {
    const { data: session } = await authClient.useSession();
    setIsOpen(!isOpen);
    if (!isOpen) {
      const { data, error } = await fetchComments(session?.user.id, video.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setComments(data.map((comment) => ({ ...comment })));
    } else {
      setComments([]);
    }
  }
  return (
    <div>
      <p>{video.id}</p>
      <button onClick={handleComments}>
        {isOpen ? (
          <XMarkIcon style={{ width: 10, height: "auto" }} />
        ) : (
          <ChatBubbleIcon style={{ width: 10, height: "auto" }} />
        )}
      </button>
    </div>
  );
}
