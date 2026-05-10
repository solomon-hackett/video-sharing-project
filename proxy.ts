import { NextRequest, NextResponse } from "next/server";

import { betterFetch } from "@better-fetch/fetch";

export async function proxy(request: NextRequest) {
  const { data: session } = await betterFetch("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: { cookie: request.headers.get("cookie") ?? "" },
  });
  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/account/:path*", "/following"],
};
