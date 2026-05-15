"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  createComment,
  deleteComment,
  deletePost,
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
  const router = useRouter();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [commentId, setCommentId] = useState("");
  const [pendingDelete, setPendingDelete] = useState(false);
  const [pendingParentDelete, setPendingParentDelete] = useState("");
  const [pendingReplyDelete, setPendingReplyDelete] = useState("");

  const parentComments: ParentComment[] = [];
  comments.forEach((c) => {
    if (c.parent_comment_id === null) {
      parentComments.push({ ...c, replies: [] });
    } else {
      const parent = parentComments.find((p) => p.id === c.parent_comment_id);
      if (parent) parent.replies.push(c);
    }
  });

  async function handleDelete() {
    if (!user) {
      toast.error("You must be logged in to delete videos.");
      return;
    }
    if (user.id !== video.creator_id) {
      toast.error("You cannot delete other people's videos.");
      return;
    }
    const { data, error } = await deletePost(
      user.id,
      video.id,
      video.key,
      video.thumbnail_key,
    );
    if (error) toast.error(error.message);
    else {
      toast.success(data.message);
      router.back();
    }
  }

  async function handleLike(isLiked: boolean) {
    if (!user) {
      toast.error("You must be logged in to like videos.");
      return;
    }
    const { error } = await (isLiked ? unlikePost : likePost)(
      user.id,
      video.id,
    );
    if (error) toast.error(error.message);
  }

  async function handleLikeComment(isLiked: boolean, id: string) {
    if (!user) {
      toast.error("You must be logged in to like comments.");
      return;
    }
    const { error } = await (isLiked ? unlikeComment : likeComment)(
      user.id,
      id,
    );
    if (error) toast.error(error.message);
  }

  async function handleDeleteComment(id: string) {
    setPendingParentDelete("");
    setPendingReplyDelete("");
    if (!user) {
      toast.error("You must be logged in to delete comments.");
      return;
    }
    const { data, error } = await deleteComment(user.id, id);
    if (error) toast.error(error.message);
    else toast.success(data.message);
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

  const replyingToName = commentId
    ? comments.find((c) => c.id === commentId)?.poster_name
    : null;

  return (
    <div className="container-md page-content">
      {/* Title + delete */}
      <div className="video-title-row">
        <h1 className="text-gradient">{video.title}</h1>
        {user?.id === video.creator_id && (
          <div className="video-delete-wrapper">
            <button
              className="btn-icon-round"
              style={{ color: "var(--danger)" }}
              onClick={() => setPendingDelete((v) => !v)}
              title="Delete video"
            >
              <TrashIcon className="controls-icon" />
            </button>
            {pendingDelete && (
              <div className="danger-confirm-popover">
                <div className="danger-confirm">
                  <p>Delete this video? This action cannot be undone.</p>
                  <div className="danger-confirm__actions">
                    <button
                      className="btn btn-sm"
                      onClick={() => setPendingDelete(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Player */}
      <div className="mb-6 player-wrapper">
        <video
          className="w-full h-full"
          src={`/api/fetch/video?key=${video.key}`}
          controls
        />
      </div>

      {/* Description */}
      <div className="description-block mb-6">
        <p className="text-base">{video.description}</p>
      </div>

      {/* Like + comment toggle */}
      <div className="video-meta">
        <div className="video-meta__left">
          <button
            className={`btn-icon-round${video.isLiked ? " liked" : ""}`}
            onClick={() => handleLike(video.isLiked)}
          >
            {video.isLiked ? (
              <HeartIcon className="controls-icon" />
            ) : (
              <EmptyHeartIcon className="controls-icon" />
            )}
          </button>
          <span className="like-count">{video.likes.toString()}</span>
        </div>
        <div className="video-meta__right">
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setCommentsOpen((v) => !v)}
          >
            {commentsOpen ? (
              <XMarkIcon className="controls-icon" />
            ) : (
              <ChatBubbleIcon className="controls-icon" />
            )}
            <span>{commentsOpen ? "Hide comments" : "Show comments"}</span>
          </button>
        </div>
      </div>

      {/* Comments */}
      {commentsOpen && (
        <div className="mb-6 comments-section">
          <div className="comments-header">
            <h3>
              Comments{" "}
              <span className="text-muted" style={{ fontWeight: 400 }}>
                {comments.length}
              </span>
            </h3>
          </div>

          <div className="comments-body">
            {parentComments.map((c) => (
              <div className="comment" key={c.id}>
                <div className="comment__header">
                  <Image
                    className="avatar avatar-sm"
                    src={`/api/fetch/avatar?key=${c.poster_image}`}
                    alt={c.poster_name}
                    width={32}
                    height={32}
                  />
                  <div className="comment__info">
                    <div className="comment__top">
                      <Link
                        href={`/profile/${c.poster_id}/view`}
                        className="comment__author"
                      >
                        {c.poster_name}
                      </Link>
                      {c.poster_id === user?.id && (
                        <button
                          className="btn btn-sm btn-ghost comment__delete-btn"
                          onClick={() => setPendingParentDelete(c.id)}
                          title="Delete comment"
                        >
                          <TrashIcon className="controls-icon-xs" />
                        </button>
                      )}
                    </div>
                    <p className="comment__text">{c.content}</p>
                    <div className="comment__actions">
                      <button
                        className={`btn-icon-round${c.isLiked ? " liked" : ""}`}
                        style={{ width: 28, height: 28 }}
                        onClick={() => handleLikeComment(c.isLiked, c.id)}
                      >
                        {c.isLiked ? (
                          <HeartIcon className="controls-icon-xs" />
                        ) : (
                          <EmptyHeartIcon className="controls-icon-xs" />
                        )}
                      </button>
                      <span className="comment__like-count">{c.likes}</span>
                      <button
                        className="btn btn-sm btn-ghost"
                        style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                        onClick={() => setCommentId(c.id)}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delete confirm — parent */}
                {pendingParentDelete === c.id && (
                  <div
                    className="mt-2 danger-confirm"
                    style={{ marginLeft: 42 }}
                  >
                    <p>Deleting this comment will also remove all replies.</p>
                    <div className="danger-confirm__actions">
                      <button
                        className="btn btn-sm"
                        onClick={() => setPendingParentDelete("")}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteComment(pendingParentDelete)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {c.replies.length > 0 && (
                  <div className="replies">
                    {c.replies.map((r) => (
                      <div className="reply" key={r.id}>
                        <div className="comment__header">
                          <Image
                            className="avatar avatar-xs"
                            src={`/api/fetch/avatar?key=${r.poster_image}`}
                            alt={r.poster_name}
                            width={26}
                            height={26}
                          />
                          <div className="comment__info">
                            <div className="comment__top">
                              <Link
                                href={`/profile/${r.poster_id}/view`}
                                className="comment__author"
                              >
                                {r.poster_name}
                              </Link>
                              {r.poster_id === user?.id && (
                                <button
                                  className="btn btn-sm btn-ghost comment__delete-btn"
                                  onClick={() => setPendingReplyDelete(r.id)}
                                  title="Delete reply"
                                >
                                  <TrashIcon className="controls-icon-xs" />
                                </button>
                              )}
                            </div>
                            <p className="comment__text">{r.content}</p>
                            <div className="comment__actions">
                              <button
                                className={`btn-icon-round${r.isLiked ? " liked" : ""}`}
                                style={{ width: 28, height: 28 }}
                                onClick={() =>
                                  handleLikeComment(r.isLiked, r.id)
                                }
                              >
                                {r.isLiked ? (
                                  <HeartIcon className="controls-icon-xs" />
                                ) : (
                                  <EmptyHeartIcon className="controls-icon-xs" />
                                )}
                              </button>
                              <span className="comment__like-count">
                                {r.likes}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delete confirm — reply */}
                        {pendingReplyDelete === r.id && (
                          <div
                            className="mt-2 danger-confirm"
                            style={{ marginLeft: 36 }}
                          >
                            <p>Delete this reply?</p>
                            <div className="danger-confirm__actions">
                              <button
                                className="btn btn-sm"
                                onClick={() => setPendingReplyDelete("")}
                              >
                                Cancel
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() =>
                                  handleDeleteComment(pendingReplyDelete)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reply banner */}
          {replyingToName && (
            <div className="reply-banner">
              <span>
                Replying to <strong>{replyingToName}</strong>
              </span>
              <button
                className="btn-icon-round"
                style={{ width: 22, height: 22 }}
                onClick={() => setCommentId("")}
              >
                <XMarkIcon className="controls-icon-xs" />
              </button>
            </div>
          )}

          {/* Comment form */}
          <form className="comment-form" onSubmit={handleComment}>
            <Image
              className="avatar avatar-sm"
              src={
                user
                  ? `/api/fetch/avatar?key=${user.image}`
                  : "/default-avatar.png"
              }
              alt="You"
              width={32}
              height={32}
            />
            <input
              className="comment-input"
              type="text"
              placeholder="Say something nice about this video..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <button type="submit" className="btn-send">
              <SendIcon className="controls-icon" />
            </button>
          </form>
        </div>
      )}

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

      <div className="mt-4 text-muted text-sm">{video.created_at}</div>
    </div>
  );
}
