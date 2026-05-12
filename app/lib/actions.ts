"use server";
import { constrainedMemory } from 'process';

import { sql } from './db';

export async function createPost(
  creator: string,
  title: string,
  description: string,
  isPublic: boolean,
  tags: Array<string>,
  videoKey: string,
  thumbnailKey: string,
) {
  try {
    await sql.begin(async (sql) => {
      const [video] = await sql`
        INSERT INTO videos (user_id, title, description, video_key, thumbnail_key, public)
        VALUES (${creator}, ${title}, ${description}, ${videoKey}, ${thumbnailKey}, ${isPublic})
        RETURNING id
      `;
      if (tags.length > 0) {
        await sql`
          INSERT INTO video_tags (video_id, tag)
          SELECT ${video.id}, unnest(${tags}::text[])
        `;
      }
    });
    return { data: { message: "Successfully uploaded video." }, error: null };
  } catch (error) {
    console.error("Database error:", error);
    return {
      data: {},
      error: { message: "Failed to post, please try again later." },
    };
  }
}

export async function welcomeNoti(username: string, userId: string) {
  try {
    await sql`
      INSERT INTO notifications (user_id, type, payload)
      VALUES (
        ${userId},
        'Welcome',
        ${JSON.stringify({ title: `Welcome to *SoloStream*, ${username}!`, message: `We hope you enjoy your time on here! Why not try [uploading a video](/upload) to get started` })}::jsonb
      )
    `;
  } catch (error) {
    console.error("Database error:", error);
    return;
  }
}

export async function setProfileBio(user: string, text: string) {
  try {
    await sql`INSERT INTO profiles (user_id, bio) VALUES (${user}, ${text})`;
    return "";
  } catch (error) {
    console.error("Failed to add bio", error);
    return "Account created successfully but failed to add bio, please sign in and try again later.";
  }
}
