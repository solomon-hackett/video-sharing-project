"use server";

import { revalidatePath } from 'next/cache';

import { sql } from './db';

export async function createPost(
  creatorId: string,
  creatorName: string,
  creatorImage: string,
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
        VALUES (${creatorId}, ${title}, ${description}, ${videoKey}, ${thumbnailKey}, ${isPublic})
        RETURNING id, title
      `;
      if (tags.length > 0) {
        await sql`
          INSERT INTO video_tags (video_id, tag)
          SELECT ${video.id}, unnest(${tags}::text[])
        `;
      }
      if (isPublic) {
        const payload = {
          title: `**${creatorName}** posted a new video!`,
          message: `${creatorName} posted *${video.title}*. [Watch it now!](/discover/${video.id}/watch)`,
          creator_image: `${creatorImage}`,
        };
        await sql` INSERT INTO notifications (user_id, type, payload)
          SELECT subscriber_id, 'New Post', ${JSON.stringify(payload)}::jsonb
          FROM subscriptions
          WHERE creator_id = ${creatorId}
          AND notifications = true;`;
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
export async function deleteVideo(userId: string, videoId: string) {
  try {
    await sql`DELETE FROM video_comments WHERE user_id = ${userId} AND id = ${videoId};`;
    revalidatePath("/", "layout");
    return {
      data: { message: "Video deleted successfully." },
      error: null,
    };
  } catch (err) {
    console.error("Database error: ", err);
    return {
      data: {},
      error: { message: "Failed to delete video, please try again later." },
    };
  }
}
export async function likePost(userId: string, videoId: string) {
  try {
    await sql`INSERT INTO video_likes (user_id, video_id) VALUES (${userId}, ${videoId});`;
    revalidatePath("/", "layout");
    return {
      data: { message: "Video liked successfully." },
      error: null,
    };
  } catch (err) {
    console.error("Database error: ", err);
    return {
      data: {},
      error: { message: "Failed to like video, please try again later." },
    };
  }
}
export async function unlikePost(userId: string, videoId: string) {
  try {
    await sql`DELETE FROM video_likes WHERE user_id = ${userId} AND video_id = ${videoId};`;
    revalidatePath("/", "layout");
    return {
      data: { message: "Video unliked successfully." },
      error: null,
    };
  } catch (err) {
    console.error("Database error: ", err);
    return {
      data: {},
      error: { message: "Failed to unlike video, please try again later." },
    };
  }
}
export async function createComment(
  videoId: string,
  userId: string,
  content: string,
  parentCommentId: string | undefined | null,
) {
  try {
    if (!parentCommentId) {
      parentCommentId = null;
    }
    await sql`INSERT INTO video_comments(video_id, user_id, content, parent_comment_id) VALUES (${videoId}, ${userId}, ${content}, ${parentCommentId});`;
    revalidatePath("/", "layout");
    return {
      data: { message: "Comment posted successfully." },
      error: null,
    };
  } catch (err) {
    console.error("Database error: ", err);
    return {
      data: {},
      error: { message: "Failed to post comment, please try again later." },
    };
  }
}
export async function deleteComment(userId: string, commentId: string) {
  try {
    await sql`DELETE FROM video_comments WHERE user_id = ${userId} AND id = ${commentId};`;
    revalidatePath("/", "layout");
    return {
      data: { message: "Comment deleted successfully." },
      error: null,
    };
  } catch (err) {
    console.error("Database error: ", err);
    return {
      data: {},
      error: { message: "Failed to delete comment, please try again later." },
    };
  }
}
export async function likeComment(userId: string, commentId: string) {
  try {
    await sql`INSERT INTO video_comment_likes (user_id, comment_id) VALUES (${userId}, ${commentId});`;
    revalidatePath("/", "layout");
    return {
      data: { message: "Comment liked successfully." },
      error: null,
    };
  } catch (err) {
    console.error("Database error: ", err);
    return {
      data: {},
      error: { message: "Failed to like comment, please try again later." },
    };
  }
}
export async function unlikeComment(userId: string, commentId: string) {
  try {
    await sql`DELETE FROM video_comment_likes WHERE user_id = ${userId} AND comment_id = ${commentId};`;
    revalidatePath("/", "layout");
    return {
      data: { message: "Comment unliked successfully." },
      error: null,
    };
  } catch (err) {
    console.error("Database error: ", err);
    return {
      data: {},
      error: { message: "Failed to like comment, please try again later." },
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

export async function markAllAsRead(userId: string) {
  try {
    await sql`
      UPDATE notifications
      SET read = true
      WHERE user_id = ${userId};
    `;

    return { success: true };
  } catch (error) {
    console.error("Database error: ", error);
    return { success: false, error: "Failed to clear notifications." };
  }
}
export async function markAllAsUnread(userId: string) {
  try {
    await sql`
      UPDATE notifications
      SET read = false
      WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '2 weeks';
    `;
    return { success: true };
  } catch (error) {
    console.error("Database error: ", error);
    return { success: false, error: "Failed to mark as unread." };
  }
}
export async function markAsRead(userId: string, notificationId: string) {
  try {
    await sql`
      UPDATE notifications
      SET read = true
      WHERE user_id = ${userId}
      AND id = ${notificationId};
    `;

    return { success: true };
  } catch (error) {
    console.error("Database error: ", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}
export async function markAsUnread(userId: string, notificationId: string) {
  try {
    await sql`
      UPDATE notifications
      SET read = false
      WHERE user_id = ${userId}
      AND id = ${notificationId};
    `;

    return { success: true };
  } catch (error) {
    console.error("Database error: ", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}
