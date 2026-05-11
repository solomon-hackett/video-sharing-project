"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/app/lib/auth-client";

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visibility, setVisibilty] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
    });
    if (error) {
      setError(error.message ?? "Something went wrong.");
      setLoading(false);
    } else {
      toast.success("Signed in successfully!");
      router.push(callbackUrl);
    }
  }

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
        <div className="input-group">
          <svg
            className="input-group__icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <input
            className="input"
            type="email"
            name="email"
            id="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div className="input-group">
          <svg
            className="input-group__icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            className="input"
            type={visibility ? "text" : "password"}
            name="password"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ paddingRight: "44px" }}
          />
          {/* Eye toggle inside input */}
          <button
            type="button"
            onClick={() => setVisibilty(!visibility)}
            className="btn-ghost btn-icon"
            style={{
              position: "absolute",
              right: "4px",
              top: "50%",
              transform: "translateY(-50%)",
              padding: "6px",
              color: "var(--muted)",
            }}
            aria-label={visibility ? "Hide password" : "Show password"}
          >
            {visibility ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex justify-between items-center">
        <label
          htmlFor="rememberMe"
          className="flex items-center gap-2 select-none pointer"
          style={{ fontSize: "0.875rem", color: "var(--text-2)" }}
        >
          <input
            type="checkbox"
            name="rememberMe"
            id="rememberMe"
            className="sr-only"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          />
          <span
            className={`toggle${rememberMe ? " active" : ""}`}
            aria-hidden="true"
          />
          Remember me
        </label>
        <Link
          href="/auth/forgot-password"
          style={{ fontSize: "0.8rem", color: "var(--cyan)", fontWeight: 600 }}
        >
          Forgot password?
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2"
          style={{
            padding: "10px 14px",
            background: "var(--danger-dim)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--danger)"
            strokeWidth="2"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="form-error" style={{ margin: 0 }}>
            {error}
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn btn-primary btn-lg"
        style={{ marginTop: "var(--space-2)" }}
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
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>

      {/* Sign up link */}
      <p
        className="text-center"
        style={{ fontSize: "0.875rem", color: "var(--muted)" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href={`/auth/sign-up?callbackUrl=${callbackUrl}`}
          style={{ color: "var(--cyan)", fontWeight: 600 }}
        >
          Sign up
        </Link>
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}
