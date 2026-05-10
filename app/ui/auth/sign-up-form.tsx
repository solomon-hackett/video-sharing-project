"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/app/lib/auth-client";

export default function SignUpForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailDialogue, setEmailDialogue] = useState("");
  const [name, setName] = useState("");
  const [nameDialogue, setNameDialogue] = useState("");
  const [password, setPassword] = useState("");
  const [passwordDialogue, setPasswordDialogue] = useState("");
  const [passwordRep, setPasswordRep] = useState("");
  const [passwordRepDialogue, setPasswordRepDialogue] = useState("");
  const [visibility, setVisibilty] = useState(false);
  const [file, setFile] = useState<File | null>(null);
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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    let imageUploadUrl = "https://placehold.net/avatar.png";
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setImageDialogue(data.error ?? "Image upload failed.");
        setLoading(false);
        return;
      }
      imageUploadUrl = data.url;
    }

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
      image: imageUploadUrl,
      callbackURL: callbackUrl,
    });

    if (error) {
      setError(error.message ?? "Something went wrong.");
      setLoading(false);
    } else {
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
    <form onSubmit={handleSubmit} className="form-group">
      {callbackUrl !== "/" && (
        <p className="form-error">
          You need to login before accessing this page.
        </p>
      )}
      <div>
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => handleEmail(e.target.value)}
          required
        />
        {emailDialogue && <p className="form-error">{emailDialogue}</p>}
      </div>
      <div>
        <label htmlFor="name" className="form-label">
          Display Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={name}
          onChange={(e) => handleName(e.target.value)}
          required
        />
        {nameDialogue && <p className="form-error">{nameDialogue}</p>}
      </div>
      <div>
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div>
          <input
            type={visibility ? "text" : "password"}
            name="password"
            id="password"
            value={password}
            onChange={(e) => {
              handlePassword(e.target.value);
              handlePasswordRep(passwordRep, e.target.value);
            }}
            required
          />
          <input
            type="checkbox"
            name="visibility"
            checked={visibility}
            onChange={() => setVisibilty(!visibility)}
          />
        </div>
        {passwordDialogue && <p className="form-error">{passwordDialogue}</p>}
      </div>
      <div>
        <label htmlFor="passwordRep" className="form-label">
          Repeat Password
        </label>
        <div>
          <input
            type={visibility ? "text" : "password"}
            name="passwordRep"
            id="passwordRep"
            value={passwordRep}
            onChange={(e) => handlePasswordRep(e.target.value)}
            required
          />
          <input
            type="checkbox"
            name="visibility"
            checked={visibility}
            onChange={() => setVisibilty(!visibility)}
          />
        </div>
        {passwordRepDialogue && (
          <p className="form-error">{passwordRepDialogue}</p>
        )}
      </div>
      <div>
        <label htmlFor="image" className="form-label">
          Profile Photo
        </label>
        <input
          type="file"
          name="image"
          id="image"
          accept="image/*"
          onChange={handleImageUpload}
        />
        {imageDialogue && <p className="form-error">{imageDialogue}</p>}
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={loading || hasErrors || hasEmptyFields}>
        {loading ? "Signing up..." : "Sign up"}
      </button>
      <p>
        Or <Link href={`/auth/login?callbackUrl=${callbackUrl}`}>Sign In</Link>
      </p>
    </form>
  );
}
