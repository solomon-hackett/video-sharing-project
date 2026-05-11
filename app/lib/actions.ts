"use server";
import { sql } from "./db";

export async function createPost() {}

export async function welcomeNoti(username: string, userId: string) {
  try {
    await sql`
      INSERT INTO notifications (user_id, type, payload)
      VALUES (
        ${userId},
        'Welcome',
        ${JSON.stringify({ message: `Welcome to the SoloStream, ${username}!` })}::jsonb
      )
    `;
  } catch (error) {
    console.log("Database error:", error);
    return;
  }
}
