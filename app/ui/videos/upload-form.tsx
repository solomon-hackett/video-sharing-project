"use client";

import { Filter } from 'bad-words';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { createPost } from '@/app/lib/actions';
import { authClient } from '@/app/lib/auth-client';
import { generateThumbnail } from '@/app/lib/utils';
import { PlayIcon } from '@heroicons/react/24/outline';

export default function UploadForm() {
  const router = useRouter();
  const filter = new Filter();
  const { data: session } = authClient.useSession();

  const [title, setTitle] = useState("");
  const [titleDialogue, setTitleDialogue] = useState("");

  const [desc, setDesc] = useState("");
  const [descDialogue, setDescDialogue] = useState("");

  const [isPublic, setIsPublic] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tagDialogue, setTagDialogue] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [vidDialogue, setVidDialogue] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleInput(field: string, value: string) {
    switch (field) {
      case "title":
        setTitle(value);
        setTitleDialogue(
          filter.isProfane(value)
            ? "Profanity is not acceptable, please change the title"
            : "",
        );
        return;
      case "desc":
        setDesc(value);
        setDescDialogue(
          filter.isProfane(value)
            ? "Profanity is not acceptable, please change the description"
            : "",
        );
        return;
    }
  }

  function handleTagInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/,$/, "");
      if (!trimmed) return;
      if (filter.isProfane(trimmed)) {
        setTagDialogue("Profanity is not allowed in tags");
        return;
      }
      if (tags.includes(trimmed)) {
        setTagDialogue(`"${trimmed}" is already added`);
        return;
      }
      setTags([...tags, trimmed]);
      setTagDialogue("");
      setTagInput("");
    } else if (e.key === "Backspace" && tagInput === "") {
      setTags(tags.slice(0, -1));
    } else {
      setTagDialogue("");
    }
  }

  function removeTag(index: number) {
    setTags(tags.filter((_, i) => i !== index));
  }

  function handleVidUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setVidDialogue("You must upload a video.");
      return;
    }
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(selectedFile);
    video.preload = "metadata";
    video.src = objectUrl;
    video.onloadedmetadata = () => {
      if (video.duration > 30) {
        URL.revokeObjectURL(objectUrl);
        setVidDialogue("Video must be 30 seconds or less.");
        setFile(null);
        setPreview(null);
        return;
      }
      setFile(selectedFile);
      setPreview(objectUrl);
      setVidDialogue("");
    };
    video.onerror = () => {
      setVidDialogue("Invalid video file.");
      URL.revokeObjectURL(objectUrl);
    };
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setVidDialogue("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    if (!file) {
      setVidDialogue("You must upload a video.");
      setLoading(false);
      return;
    }

    const video = file;

    const result = await generateThumbnail(video);
    if (!result.ok) {
      setVidDialogue(result.error);
      setLoading(false);
      return;
    }

    const thumbnail = result.blob;

    let formData = new FormData();
    formData.append("video", video);
    let res = await fetch("/api/upload/video", {
      method: "POST",
      body: formData,
    });
    let upload = await res.json();
    if (!res.ok) {
      setVidDialogue(
        res.status === 413
          ? "Video is too large to upload."
          : (upload.error ?? "Video upload failed."),
      );
      setLoading(false);
      return;
    }
    const videoKey = upload.key;

    const userId = session?.user.id;
    if (!userId) {
      router.push("/auth/login?callbackUrl=/upload");
      return;
    }
    formData = new FormData();
    formData.append("thumbnail", thumbnail);
    res = await fetch("/api/upload/thumbnail", {
      method: "POST",
      body: formData,
    });
    upload = await res.json();
    if (!res.ok) {
      setVidDialogue(upload.error ?? "Video upload failed.");
      setLoading(false);
      return;
    }
    const thumbnailKey = upload.key;

    const { error } = await createPost(
      userId,
      title,
      desc,
      isPublic,
      tags,
      videoKey,
      thumbnailKey,
    );

    if (error) {
      setError(error.message ?? "Something went wrong.");
      setLoading(false);
    } else {
      toast.success("Video uploaded successfully!");
      router.push("/");
    }
  }

  const hasErrors = !!(
    titleDialogue ||
    descDialogue ||
    tagDialogue ||
    vidDialogue
  );
  const isSubmittable = !hasErrors && !!title.trim() && !!file;
  return (
    <form onSubmit={handleSubmit} className="form">
      {/* Title */}
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Pick a cool sounding title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={title}
          required
          onChange={(e) => handleInput("title", e.target.value)}
          className={`input${titleDialogue ? " input-error" : ""}`}
        />
        {titleDialogue && <p className="form-error">{titleDialogue}</p>}
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="desc" className="form-label">
          Add a description (optional)
        </label>
        <textarea
          name="desc"
          id="desc"
          value={desc}
          onChange={(e) => handleInput("desc", e.target.value)}
          className={`textarea${descDialogue ? " input-error" : ""}`}
        />
        {descDialogue && <p className="form-error">{descDialogue}</p>}
      </div>

      {/* Visibility */}
      <div className="form-group">
        <label className="form-label">Visibility</label>
        <div className="dropdown">
          <button
            type="button"
            className="select btn"
            style={{ width: "160px", textAlign: "left" }}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isPublic ? "Public" : "Private"}
          </button>
          {isOpen && (
            <div
              className="dropdown-menu"
              role="listbox"
              style={{ left: 0, right: "auto", minWidth: "160px" }}
            >
              <button
                type="button"
                className="dropdown-menu__item"
                role="option"
                aria-selected={isPublic}
                onClick={() => {
                  setIsPublic(true);
                  setIsOpen(false);
                }}
              >
                Public
              </button>
              <button
                type="button"
                className="dropdown-menu__item"
                role="option"
                aria-selected={!isPublic}
                onClick={() => {
                  setIsPublic(false);
                  setIsOpen(false);
                }}
              >
                Private
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="form-group">
        <label htmlFor="tag-input" className="form-label">
          Add some tags so people know what your video is about...
        </label>
        <div
          className="tag-input-wrapper"
          onClick={() => document.getElementById("tag-input")?.focus()}
        >
          {tags.map((tag, i) => (
            <span key={i} className="tag">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            id="tag-input"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInput}
            placeholder={tags.length === 0 ? "Add tags..." : ""}
          />
        </div>
        {tagDialogue && <p className="form-error">{tagDialogue}</p>}
        {!tagDialogue && tags.length > 0 && (
          <p className="form-hint">
            {tags.length} tag{tags.length > 1 ? "s" : ""} added
          </p>
        )}
      </div>

      {/* Video upload */}
      <div className="form-group">
        <label className="form-label">
          Upload your video (max duration: 30 seconds)
        </label>
        <div className="file-upload" style={{ flexDirection: "column" }}>
          <div
            className={`file-upload__preview file-upload__preview--lg${preview ? " has-file" : ""}`}
            style={{ maxHeight: "480px" }}
          >
            {preview ? (
              <video
                key={preview}
                src={preview}
                controls
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <PlayIcon style={{ width: "10rem", height: "auto" }} />
            )}
          </div>
          <div className="file-upload__meta">
            <label
              htmlFor="vid"
              className="btn btn-cyan btn-sm file-upload__trigger"
            >
              {file ? "Change video" : "Upload video"}
            </label>
            <input
              type="file"
              id="vid"
              name="vid"
              accept="video/*"
              onChange={handleVidUpload}
              className="file-upload__input"
            />
            {file ? (
              <span className="file-upload__name">
                {file.name}{" "}
                <button
                  type="button"
                  onClick={clearFile}
                  aria-label="Remove file"
                >
                  ×
                </button>
              </span>
            ) : (
              <p className="form-hint">MP4, WebM or MOV</p>
            )}
            {vidDialogue && <p className="form-error">{vidDialogue}</p>}
          </div>
        </div>
      </div>

      {/* Global error */}
      {error && <p className="form-error">{error}</p>}

      {/* Submit */}
      <button
        type="submit"
        className="mt-2 w-full btn btn-primary btn-lg"
        disabled={!isSubmittable || loading}
      >
        {loading ? (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Uploading...
          </>
        ) : (
          "Upload video"
        )}
      </button>
    </form>
  );
}
