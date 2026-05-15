"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  createComment,
  deleteComment,
  deleteVideo,
  likeComment,
  likePost,
  unlikeComment,
  unlikePost,
} from "@/app/lib/actions";
import {
  ChatBubbleLeftEllipsisIcon as ChatBubbleIcon,
  HeartIcon as EmptyHeartIcon,
  PaperAirplaneIcon as SendIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";

import type { User } from "better-auth";

import type {
  IndividualVideo,
  Comment,
  ParentComment,
} from "@/app/lib/definitions";
export default function Video({
  video,
  user,
  comments,
}: {
  video: IndividualVideo;
  user: User | undefined;
  comments: Comment[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [commentId, setCommentId] = useState("");
  const [pendingDelete, setPendingDelete] = useState(false);
  const [pendingParentDelete, setPendingParentDelete] = useState("");
  const [pendingReplyDelete, setPendingReplyDelete] = useState("");
  const parentComments: ParentComment[] = [];

  comments.forEach((comment) => {
    if (comment.parent_comment_id === null) {
      parentComments.push({ ...comment, replies: [] });
    } else {
      const parent = parentComments.find(
        (c) => c.id === comment.parent_comment_id,
      );
      if (parent) {
        parent.replies.push(comment);
      }
    }
  });

  async function handleDelete() {
    if (!user) {
      toast.error("You must be logged in to delete videos.");
      return;
    } else if (user.id !== video.creator_id) {
      toast.error("You cannot delete other people's videos.");
      return;
    }
    const { data, error } = await deleteVideo(user.id, video.id);
    if (error) {
      toast.error(error.message);
      return;
    } else {
      toast.success(data.message);
      return;
    }
  }

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
      }
    } else {
      const { error } = await likePost(user.id, video.id);
      if (error) {
        toast.error(error.message);
        return;
      }
    }
  }
  async function handleLikeComment(isLiked: boolean, commentId: string) {
    if (!user) {
      toast.error("You must be logged in to like videos.");
      return;
    }
    if (isLiked) {
      const { error } = await unlikeComment(user.id, commentId);
      if (error) {
        toast.error(error.message);
        return;
      }
    } else {
      const { error } = await likeComment(user.id, commentId);
      if (error) {
        toast.error(error.message);
        return;
      }
    }
  }

  async function handleDeleteComment(commentId: string) {
    setPendingParentDelete("");
    setPendingReplyDelete("");

    if (!user) {
      toast.error("You must be logged in to delete comments.");
      return;
    }
    const { data, error } = await deleteComment(user.id, commentId);
    if (error) {
      toast.error(error.message);
      return;
    } else {
      toast.success(data.message);
      return;
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
    setComment("");
    setCommentId("");
  }

  return (
    <div className="container-md page-content">
      {/* Title */}
      <h1 className="mb-4 text-gradient">{video.title}</h1>
      {user?.id === video.creator_id && (
        <div>
          {pendingDelete && (
            <div>
              <p>Are you sure you want to delete this video?</p>
              <button onClick={() => setPendingDelete(false)}>Cancel</button>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
          <button onClick={() => setPendingDelete(true)}>
            <TrashIcon style={{ width: 10, height: "auto" }} />
          </button>
        </div>
      )}
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
        {video.isLiked ? (
          <button onClick={() => handleLike(true)}>
            <HeartIcon style={{ width: 10, height: "auto" }} />
          </button>
        ) : (
          <button onClick={() => handleLike(false)}>
            <EmptyHeartIcon style={{ width: 10, height: "auto" }} />
          </button>
        )}
        <p>{video.likes.toString()}</p>
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
            {parentComments.map((comment) => (
              <div key={comment.id}>
                {comment.poster_id === user?.id && (
                  <button onClick={() => setPendingParentDelete(comment.id)}>
                    <TrashIcon style={{ width: 10, height: "auto" }} />
                  </button>
                )}
                {pendingParentDelete && (
                  <div>
                    <p>
                      Are you sure you want to delete this comment? Deleting
                      this comment will also delete all replies.
                    </p>
                    <button onClick={() => setPendingParentDelete("")}>
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteComment(pendingParentDelete)}
                    >
                      Delete
                    </button>
                  </div>
                )}
                {comment.isLiked ? (
                  <button onClick={() => handleLikeComment(true, comment.id)}>
                    <HeartIcon style={{ width: 10, height: "auto" }} />
                  </button>
                ) : (
                  <button onClick={() => handleLikeComment(false, comment.id)}>
                    <EmptyHeartIcon style={{ width: 10, height: "auto" }} />
                  </button>
                )}
                <p>{comment.likes}</p>
                <Image
                  src={`/api/fetch/avatar?key=${comment.poster_image}`}
                  alt={comment.poster_name}
                  width={32}
                  height={32}
                />
                <h3>
                  <Link href={`/profile/${comment.poster_id}/view`}>
                    {comment.poster_name}
                  </Link>
                </h3>
                <p>{comment.content}</p>
                <button onClick={() => setCommentId(comment.id)}>Reply</button>
                {comment.replies.map((comment) => (
                  <div key={comment.id}>
                    {comment.poster_id === user?.id && (
                      <button onClick={() => setPendingReplyDelete(comment.id)}>
                        <TrashIcon style={{ width: 10, height: "auto" }} />
                      </button>
                    )}
                    {pendingReplyDelete &&
                      pendingReplyDelete === comment.id && (
                        <div>
                          <p>Are you sure you want to delete this comment?</p>
                          <button onClick={() => setPendingReplyDelete("")}>
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteComment(pendingReplyDelete)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    {comment.isLiked ? (
                      <button
                        onClick={() => handleLikeComment(true, comment.id)}
                      >
                        <HeartIcon style={{ width: 10, height: "auto" }} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLikeComment(false, comment.id)}
                      >
                        <EmptyHeartIcon style={{ width: 10, height: "auto" }} />
                      </button>
                    )}
                    <p>{comment.likes}</p>
                    <Image
                      src={`/api/fetch/avatar?key=${comment.poster_image}`}
                      alt={comment.poster_name}
                      width={32}
                      height={32}
                    />
                    <h3>
                      <Link href={`/profile/${comment.poster_id}/view`}>
                        {comment.poster_name}
                      </Link>
                    </h3>
                    <p>{comment.content}</p>
                  </div>
                ))}
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
                value={comment}
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
      <Link href={`/profile/${video.creator_id}/view`} className="channel-card">
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
