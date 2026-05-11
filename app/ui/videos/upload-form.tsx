"use client";

import { Filter } from "bad-words";
import { useState } from "react";

import { PlayIcon } from "@heroicons/react/24/outline";

export default function UploadForm() {
  const filter = new Filter();
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
                controls
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              >
                <source src={preview} type={file?.type} />
              </video>
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

      {/* Submit */}
      <button
        type="submit"
        className="mt-2 w-full btn btn-primary btn-lg"
        disabled={!isSubmittable}
      >
        Upload
      </button>
    </form>
  );
}
