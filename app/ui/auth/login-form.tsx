"use client";
import Link from "next/link";
import { useState } from "react";

import { authClient } from "@/app/lib/auth-client";

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visibility, setVisibilty] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: callbackUrl,
      rememberMe: rememberMe,
    });

    if (error) {
      setError(error.message ?? "Something went wrong.");
      setLoading(false);
    }
  }

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
          onChange={(e) => setEmail(e.target.value)}
          required
        />
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
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="checkbox"
            name="visibility"
            id="visibility"
            onChange={() => setVisibilty(!visibility)}
          />
        </div>
        <div>
          <label htmlFor="rememberMe" className="form-label">
            Remember Me
          </label>
          <input
            type="checkbox"
            name="rememberMe"
            id="rememberMe"
            onChange={() => setRememberMe(!rememberMe)}
          />
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p>
        Or{" "}
        <Link href={`/auth/sign-up?callbackUrl=${callbackUrl}`}>Sign Up</Link>
      </p>
    </form>
  );
}
