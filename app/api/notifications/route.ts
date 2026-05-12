import { NextResponse } from 'next/server';

import { sql } from '@/app/lib/db';

import type { Notification } from "@/app/lib/definitions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json([], { status: 400 });
  }

  const data = await sql<Notification[]>`
    SELECT *
    FROM notifications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  const notifications: Notification[] = data.map((n) => ({
    ...n,
    payload: typeof n.payload === "string" ? JSON.parse(n.payload) : n.payload,
  }));

  return NextResponse.json(notifications);
}
