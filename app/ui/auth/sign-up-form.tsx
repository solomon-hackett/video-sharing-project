"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { setProfileBio, welcomeNoti } from '@/app/lib/actions';
import { authClient } from '@/app/lib/auth-client';
import { uploadViaPresignedUrl } from '@/app/lib/upload';

export default function SignUpForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailDialogue, setEmailDialogue] = useState("");

  const [name, setName] = useState("");
  const [nameDialogue, setNameDialogue] = useState("");

  const [bio, setBio] = useState("");

  const [password, setPassword] = useState("");
  const [passwordDialogue, setPasswordDialogue] = useState("");

  const [passwordRep, setPasswordRep] = useState("");
  const [passwordRepDialogue, setPasswordRepDialogue] = useState("");

  const [visibility, setVisibilty] = useState(false);
  const [repVisibility, setRepVisibilty] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageDialogue, setImageDialogue] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleEmail(value: string) {
    setEmail(value);
    if (!value) {
      setEmailDialogue("Please enter an email.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailDialogue("Please enter a valid email");
    } else {
      setEmailDialogue("");
    }
  }
  function handleName(value: string) {
    setName(value);
    if (!name) {
      setNameDialogue("Please enter a display name.");
    } else {
      setNameDialogue("");
    }
  }
  function handlePassword(value: string) {
    setPassword(value);
    if (!value) {
      setPasswordDialogue("Please enter a password.");
    } else if (value.length < 8) {
      setPasswordDialogue("Password should be 8 characters or longer.");
    } else {
      setPasswordDialogue("");
    }
  }
  function handlePasswordRep(value: string, currentPassword = password) {
    setPasswordRep(value);
    if (value !== currentPassword) {
      setPasswordRepDialogue("Passwords should match.");
    } else {
      setPasswordRepDialogue("");
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageDialogue("Please upload an image file.");
      return;
    }
    setFile(file);
    setImageDialogue("");
    setPreview(URL.createObjectURL(file));
  }
  function clearFile() {
    setFile(null);
    setPreview(null);
    setImageDialogue("");
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    let imageKey: string | undefined = undefined;
    if (file) {
      const fileExt = file.name.split(".").pop() ?? "jpg";
      const imageUpload = await uploadViaPresignedUrl(
        file,
        "avatar",
        file.type,
        fileExt,
      );
      if (!imageUpload.ok) {
        setError(imageUpload.error ?? "Image upload failed.");
        setLoading(false);
        return;
      }
      imageKey = imageUpload.key!;
    }

    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
      image: imageKey,
      callbackURL: callbackUrl,
    });

    if (error) {
      setError(error.message ?? "Something went wrong.");
      setLoading(false);
    } else {
      if (data?.user) {
        await welcomeNoti(data.user.name, data.user.id);
      }
      const bioError = await setProfileBio(data.user.id, bio);
      if (bioError) {
        setError(bioError);
        return;
      }
      toast.success("Signed up successfully!");
      router.push(callbackUrl);
    }
  }

  const hasErrors = !!(
    emailDialogue ||
    passwordDialogue ||
    passwordRepDialogue ||
    imageDialogue ||
    nameDialogue
  );
  const hasEmptyFields = !email || !name || !password || !passwordRep || !name;

  return (
    <form onSubmit={handleSubmit} className="form">
      {callbackUrl !== "/" && (
        <p className="form-error">
          You need to login before accessing this page.
        </p>
      )}

      {/* Email */}
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => handleEmail(e.target.value)}
          className={`input${emailDialogue ? " input-error" : ""}`}
          required
        />
        {emailDialogue && <p className="form-error">{emailDialogue}</p>}
      </div>

      {/* Display Name */}
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Display Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={name}
          onChange={(e) => handleName(e.target.value)}
          className={`input${nameDialogue ? " input-error" : ""}`}
          required
        />
        {nameDialogue && <p className="form-error">{nameDialogue}</p>}
      </div>
      <div className="form-group">
        <label htmlFor="bio" className="form-label">
          Add a little bit about yourself (optional)...
        </label>
        <textarea
          name="bio"
          id="bio"
          className="textarea"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        ></textarea>
      </div>

      {/* Password */}
      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div className="flex items-center gap-2">
          <input
            type={visibility ? "text" : "password"}
            name="password"
            id="password"
            value={password}
            onChange={(e) => {
              handlePassword(e.target.value);
              handlePasswordRep(passwordRep, e.target.value);
            }}
            className={`input flex-1${passwordDialogue ? " input-error" : ""}`}
            required
          />
          <label className="flex items-center gap-2 text-muted text-sm select-none pointer">
            <input
              type="checkbox"
              name="visibility"
              checked={visibility}
              onChange={() => setVisibilty(!visibility)}
              className="sr-only"
            />
            <span
              className={`toggle${visibility ? " active" : ""}`}
              aria-hidden="true"
            />
            Show
          </label>
        </div>
        {passwordDialogue && <p className="form-error">{passwordDialogue}</p>}
      </div>

      {/* Repeat Password */}
      <div className="form-group">
        <label htmlFor="passwordRep" className="form-label">
          Repeat Password
        </label>
        <div className="flex items-center gap-2">
          <input
            type={repVisibility ? "text" : "password"}
            name="passwordRep"
            id="passwordRep"
            value={passwordRep}
            onChange={(e) => handlePasswordRep(e.target.value)}
            className={`input flex-1${passwordRepDialogue ? " input-error" : ""}`}
            required
          />
          <label className="flex items-center gap-2 text-muted text-sm select-none pointer">
            <input
              type="checkbox"
              name="visibility"
              checked={repVisibility}
              onChange={() => setRepVisibilty(!repVisibility)}
              className="sr-only"
            />
            <span
              className={`toggle${repVisibility ? " active" : ""}`}
              aria-hidden="true"
            />
            Show
          </label>
        </div>
        {passwordRepDialogue && (
          <p className="form-error">{passwordRepDialogue}</p>
        )}
      </div>

      {/* Avatar upload — round */}
      <div className="form-group">
        <label className="form-label">Profile Photo (optional)</label>
        <div className="file-upload">
          <div
            className={`file-upload__preview file-upload__preview--round${preview ? " has-file" : ""}`}
          >
            {preview ? (
              <Image src={preview} width={10} height={10} alt="Preview" />
            ) : (
              <span>
                <Image
                  width={1}
                  height={1}
                  src="https://placehold.net/avatar.png"
                  alt="👤"
                />
              </span>
            )}
          </div>
          <div className="file-upload__meta">
            <label
              htmlFor="image"
              className="btn btn-cyan btn-sm file-upload__trigger"
            >
              {file ? "Change photo" : "Upload photo"}
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageUpload}
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
              <p className="form-hint">JPG, PNG or GIF</p>
            )}
            {imageDialogue && <p className="form-error">{imageDialogue}</p>}
          </div>
        </div>
      </div>

      {/* Global error */}
      {error && <p className="form-error">{error}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || hasErrors || hasEmptyFields}
        className="mt-2 w-full btn btn-primary btn-lg"
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
            Signing up…
          </>
        ) : (
          "Sign up"
        )}
      </button>

      <p className="text-muted text-sm text-center">
        Or <Link href={`/auth/login?callbackUrl=${callbackUrl}`}>Sign In</Link>
      </p>
    </form>
  );
}
