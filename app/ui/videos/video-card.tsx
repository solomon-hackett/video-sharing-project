"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Comment, Video } from "@/app/lib/definitions";
import {
  ChatBubbleLeftEllipsisIcon as ChatBubbleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onActivate: (id: string | null) => void;
  hasInteracted: boolean;
}

export default function VideoCard({
  video,
  isActive,
  onActivate,
  hasInteracted,
}: VideoCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onActivate(video.id);
        } else {
          onActivate(null);
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [video.id, onActivate]);
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.muted = !hasInteracted;
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isActive, hasInteracted]);
  useEffect(() => {
    if (!isActive) {
      videoRef.current?.pause();
    }
  }, [isActive]);

  async function handleComments() {
    setIsOpen(!isOpen);
    if (!isOpen) {
      const res = await fetch(`/api/fetch/comments?id=${video.id}`);
      if (!res.ok) {
        toast.error("Failed to fetch comments.");
        return;
      }
      const data = await res.json();
      setComments(data.map((comment: Comment) => ({ ...comment })));
    } else {
      setComments([]);
    }
  }

  return (
    <div ref={cardRef} style={{ height: "90vh" }}>
      <h1>{video.title}</h1>
      <div>
        <button onClick={handleComments}>
          {isOpen ? (
            <XMarkIcon style={{ width: 10, height: "auto" }} />
          ) : (
            <ChatBubbleIcon style={{ width: 10, height: "auto" }} />
          )}
        </button>
        <div>
          {comments.map((comment) => (
            <div key={comment.id} />
          ))}
        </div>
      </div>

      <video
        ref={videoRef}
        src={isActive ? `/api/fetch/video?key=${video.key}` : undefined}
        width={720}
        controls
        preload="none"
        autoPlay
        muted
      />

      <p>{video.description}</p>
    </div>
  );
}
