"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { createComment, likePost, unlikePost } from '@/app/lib/actions';
import {
    ChatBubbleLeftEllipsisIcon as ChatBubbleIcon, HeartIcon as EmptyHeartIcon,
    PaperAirplaneIcon as SendIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

import type { User } from "better-auth";

import type { Video, Comment } from "@/app/lib/definitions";
export default function Video({
  video,
  user,
  comments,
}: {
  video: Video;
  user: User | undefined;
  comments: Comment[];
}) {
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [likes, setLikes] = useState(video.likes);
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [commentId, setCommentId] = useState("");
  async function handleLike(isLiked: boolean) {
    if (!user) {
      toast.error("You must be logged in to like videos.");
      return;
    }
    if (isLiked) {
      const { error } = await unlikePost(user.id, video.id);
      if (error) {
        toast.error(error.message);
        return;
      } else {
        setIsLiked(false);
        setLikes(likes - 1);
      }
    } else {
      const { error } = await likePost(user.id, video.id);
      if (error) {
        toast.error(error.message);
        return;
      } else {
        setIsLiked(true);
        setLikes(likes + 1);
      }
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to comment.");
      return;
    }
    const { error } = await createComment(
      video.id,
      user.id,
      comment,
      commentId,
    );
    if (error) {
      toast.error(error.message);
      return;
    }
  }
  return (
    <div className="container-md page-content">
      {/* Title */}
      <h1 className="mb-4 text-gradient">{video.title}</h1>

      {/* Player */}
      <div className="mb-6 player-wrapper">
        <video
          className="w-full h-full"
          src={`/api/fetch/video?key=${video.key}`}
          controls
        />
      </div>

      {/* Description */}
      <p className="mb-6 text-base">{video.description}</p>
      <div>
        {isLiked ? (
          <button onClick={() => handleLike(true)}>
            <HeartIcon style={{ width: 10, height: "auto" }} />
          </button>
        ) : (
          <button onClick={() => handleLike(false)}>
            <EmptyHeartIcon style={{ width: 10, height: "auto" }} />
          </button>
        )}
        <p>{likes.toString()}</p>
      </div>
      <div>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <XMarkIcon style={{ width: 10, height: "auto" }} />
          ) : (
            <ChatBubbleIcon style={{ width: 10, height: "auto" }} />
          )}
        </button>
        {isOpen && (
          <div>
            {comments.map((comment) => (
              <div key={comment.id}>
                <Image
                  src={`/api/fetch/avatar?key=${comment.poster_image}`}
                  alt={comment.poster_name}
                  width={32}
                  height={32}
                />
                <h3>{comment.poster_name}</h3>
                <p>{comment.content}</p>
                <button onClick={() => setCommentId(comment.id)}>Reply</button>
              </div>
            ))}
            <form onSubmit={handleComment}>
              {commentId && (
                <div>
                  <p>
                    Replying to{" "}
                    {comments.find((c) => c.id === commentId)?.poster_name}
                  </p>
                  <button onClick={() => setCommentId("")}>
                    <XMarkIcon style={{ width: 10, height: "auto" }} />
                  </button>
                </div>
              )}
              <input
                type="text"
                name="comment"
                id="comment"
                placeholder="Say something nice about this vieo..."
                onChange={(e) => setComment(e.target.value)}
                required
              />
              <button type="submit">
                <SendIcon style={{ width: 10, height: "auto" }} />
              </button>
            </form>
          </div>
        )}
      </div>
      {/* Creator card */}
      <Link
        href={`/account/profile/${video.creator_id}/view`}
        className="channel-card"
      >
        <Image
          className="avatar avatar-md"
          src={`/api/fetch/avatar?key=${video.creator_image}`}
          alt={video.creator_name}
          width={40}
          height={40}
        />

        <div className="flex flex-col">
          <span className="channel-card__name">{video.creator_name}</span>
          <span className="text-muted text-sm">View profile</span>
        </div>
      </Link>

      {/* Date */}
      <div className="mt-4 text-muted text-sm">{video.created_at}</div>
    </div>
  );
}
