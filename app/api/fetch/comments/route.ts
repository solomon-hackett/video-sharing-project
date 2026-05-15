import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/lib/auth";
import { fetchComments } from "@/app/lib/data";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const userId = (
    await auth.api.getSession({
      headers: await headers(),
    })
  )?.user.id;
  if (!id) {
    return NextResponse.json({ error: "Video ID required" }, { status: 500 });
  }
  const { data: comments, error } = await fetchComments(userId, id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(comments);
}
