import { NextRequest, NextResponse } from "next/server";

import { betterFetch } from "@better-fetch/fetch";

type SessionResponse = {
  data: unknown | null;
};

async function getSession(cookie: string): Promise<SessionResponse> {
  return betterFetch("/api/auth/get-session", {
    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    headers: {
      cookie,
    },
  });
}

export async function proxy(request: NextRequest) {
  const cookie = request.headers.get("cookie") ?? "";

  let session: unknown = null;

  try {
    const { data } = await getSession(cookie);
    session = data;
  } catch (err) {
    console.error("Auth session fetch failed:", err);
    session = null;
  }

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute =
    pathname.startsWith("/account") ||
    pathname.startsWith("/following") ||
    pathname.startsWith("/upload") ||
    pathname.startsWith("/auth/signout");

  const isAuthenticated = !!session;

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/following", "/upload/:path*", "/auth/signout"],
};
