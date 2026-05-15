import { nullable } from "better-auth";
import { notFound } from "next/navigation";

import { sql } from "./db";
import {
  Comment,
  IndividualVideo,
  Notification,
  ProfileSearchResult,
  Video,
  VideoSearchResult,
} from "./definitions";
import { generatePrettyDate } from "./utils";

const SORT_CLAUSES = {
  "date-asc": sql`ORDER BY videos.created_at ASC`,
  "date-desc": sql`ORDER BY videos.created_at DESC`,
} as const;

type SortKey = keyof typeof SORT_CLAUSES;

export async function fetchUserNotifications(userId: string) {
  return await sql<Notification[]>`
    SELECT *
    FROM notifications
    WHERE user_id = ${userId}
      AND (
        read = false
        OR (read = true AND created_at >= NOW() - INTERVAL '2 weeks')
      )
    ORDER BY created_at DESC;
  `;
}

export async function fetchSearchResults(
  query: string,
  sort: string,
  filters: string[],
) {
  const showPeople = filters.includes("people");
  const showVideos = filters.includes("videos");

  const orderBy =
    SORT_CLAUSES[sort in SORT_CLAUSES ? (sort as SortKey) : "date-desc"];

  const searchQuery = `%${query}%`;
  const sqlFilters = filters.filter((f) => f !== "people" && f !== "videos");

  const searchVideosQuery = async () =>
    sql<VideoSearchResult[]>`
      SELECT 
        videos.id,
        videos.title,
        videos.description,
        videos.thumbnail_key,
        videos.created_at,
        "user".id AS creator_id,
        "user".name AS creator_name,
        "user".image AS creator_image,
        array_agg(video_tags.tag) FILTER (WHERE video_tags.tag IS NOT NULL) AS tags
      FROM videos 
      JOIN "user" ON "user".id = videos.user_id
      LEFT JOIN video_tags ON video_tags.video_id = videos.id
      WHERE
        (
          videos.title ILIKE ${searchQuery} OR
          videos.description ILIKE ${searchQuery} OR
          "user".name ILIKE ${searchQuery} OR
          video_tags.tag ILIKE ${searchQuery}
        )
        AND public = true
        ${sqlFilters.length > 0 ? sql`AND video_tags.tag IN ${sql(sqlFilters)}` : sql``}
      GROUP BY 
        videos.id,
        videos.title,
        videos.description,
        videos.thumbnail_key,
        videos.created_at,
        "user".id,
        "user".name,
        "user".image
      ${orderBy};
    `;

  const searchPeopleQuery = async () =>
    sql<ProfileSearchResult[]>`
      SELECT 
        "user".id,
        "user".name,
        "user".image,
        profiles.bio
      FROM "user"
      LEFT JOIN profiles ON profiles.user_id = "user".id
      WHERE 
        "user".name ILIKE ${searchQuery} OR
        profiles.bio ILIKE ${searchQuery}
      LIMIT 15;
    `;
  const transformVideo = (video: VideoSearchResult) => ({
    ...video,
    created_at: generatePrettyDate(video.created_at),
  });

  if ((showPeople && showVideos) || (!showPeople && !showVideos)) {
    const people = await searchPeopleQuery();
    const videosRaw = await searchVideosQuery();

    const videos = videosRaw.map(transformVideo);

    const tags = Array.from(new Set(videos.flatMap((v) => v.tags ?? [])));

    return { people, videos, tags };
  }

  if (showPeople) {
    const people = await searchPeopleQuery();
    return { people, videos: [], tags: [] };
  }

  const videosRaw = await searchVideosQuery();
  const videos = videosRaw.map(transformVideo);

  const tags = Array.from(new Set(videos.flatMap((v) => v.tags ?? [])));

  return { people: [], videos, tags };
}

export async function fetchVideoById(
  videoId: string,
  userId: string | undefined,
) {
  try {
    const [video_data, comments_data] = await Promise.all([
      sql<IndividualVideo[]>`
      SELECT 
        videos.id,
        videos.title,
        videos.description,
        videos.video_key AS key,
        videos.created_at,
        videos.public::boolean AS "isPublic",
        "user".id AS creator_id,
        "user".name AS creator_name,
        "user".image AS creator_image,
        array_agg(video_tags.tag) FILTER (WHERE video_tags.tag IS NOT NULL) AS tags,
        COUNT(video_likes.video_id) AS "likes",
        BOOL_OR(video_likes.user_id = ${userId ?? null}) AS "isLiked"
      FROM videos
      JOIN "user" ON "user".id = videos.user_id
      LEFT JOIN video_tags ON video_tags.video_id = videos.id
      LEFT JOIN video_likes ON video_likes.video_id = videos.id
      WHERE videos.id = ${videoId}
      GROUP BY
        videos.id,
        videos.title,
        videos.description,
        videos.video_key,
        videos.created_at,
        "user".id,
        "user".name,
        "user".image;
    `,
      sql<Comment[]>`
    SELECT 
    video_comments.id,
    video_comments.content,
    video_comments.parent_comment_id,
    video_comments.created_at,
    "user".id as poster_id,
    "user".name as poster_name,
    "user".image as poster_image,
    COUNT(video_comment_likes.comment_id) AS "likes",
    BOOL_OR(video_comment_likes.user_id = ${userId ?? null}) AS "isLiked"
    FROM video_comments
    JOIN "user" ON "user".id = video_comments.user_id
    LEFT JOIN video_comment_likes ON video_comment_likes.comment_id = video_comments.id
    WHERE video_comments.video_id = ${videoId}
    GROUP BY 
    video_comments.id,
    video_comments.content,
    video_comments.parent_comment_id,
    video_comments.created_at,
    "user".id,
    "user".name,
    "user".image
    ORDER BY created_at ASC;`,
    ]);
    const vid = video_data[0];

    if (!vid) notFound();

    const isOwner = vid.creator_id === userId;
    const canView = vid.isPublic || isOwner;

    if (!canView) {
      return null;
    }
    const video = {
      ...vid,
      likes: Number(vid.likes),
      created_at: generatePrettyDate(vid.created_at),
    };
    const comments = comments_data.map((comment) => ({
      ...comment,
      created_at: generatePrettyDate(comment.created_at),
    }));
    return {
      video,
      comments,
    };
  } catch (err) {
    console.error("Database error: ", err);
    notFound();
  }
}

export async function fetchFYP(
  userId: string | undefined,
  cursor: string | null,
) {
  const decoded = cursor ? JSON.parse(atob(cursor)) : null;
  const { tag_overlap, like_count, comment_count, id } = decoded ?? {};
  try {
    const videos = await sql<Video[]>`
  ${
    userId
      ? sql`
    WITH taste_profile AS (
      SELECT DISTINCT video_tags.tag
      FROM video_tags
      INNER JOIN video_likes ON video_likes.video_id = video_tags.video_id
      WHERE video_likes.user_id = ${userId}
    ),
    scored_videos AS (
      SELECT
        videos.*,
        COUNT(CASE WHEN video_tags.tag IN (SELECT tag FROM taste_profile) THEN 1 END) AS tag_overlap,
        COALESCE(likes.like_count, 0) AS like_count,
        COALESCE(comments.comment_count, 0) AS comment_count
      FROM videos
      LEFT JOIN video_tags ON video_tags.video_id = videos.id
      LEFT JOIN (
        SELECT video_id, COUNT(*) AS like_count
        FROM video_likes
        GROUP BY video_id
      ) AS likes ON likes.video_id = videos.id
      LEFT JOIN (
        SELECT video_id, COUNT(*) * 2 AS comment_count
        FROM video_comments
        GROUP BY video_id
      ) AS comments ON comments.video_id = videos.id
      GROUP BY videos.id, likes.like_count, comments.comment_count
    )
    SELECT * FROM scored_videos
    ${
      cursor
        ? sql`
      WHERE tag_overlap < ${tag_overlap}
      OR (tag_overlap = ${tag_overlap} AND like_count < ${like_count})
      OR (tag_overlap = ${tag_overlap} AND like_count = ${like_count} AND comment_count < ${comment_count})
      OR (tag_overlap = ${tag_overlap} AND like_count = ${like_count} AND comment_count = ${comment_count} AND id != ${id})
    `
        : sql``
    }
    ORDER BY tag_overlap DESC, like_count DESC, comment_count DESC, created_at DESC
    LIMIT 10
  `
      : sql`
    SELECT
      videos.*,
      COALESCE(likes.like_count, 0) AS like_count,
      COALESCE(comments.comment_count, 0) AS comment_count
    FROM videos
    LEFT JOIN (
      SELECT video_id, COUNT(*) AS like_count
      FROM video_likes
      GROUP BY video_id
    ) AS likes ON likes.video_id = videos.id
    LEFT JOIN (
      SELECT video_id, COUNT(*) * 2 AS comment_count
      FROM video_comments
      GROUP BY video_id
    ) AS comments ON comments.video_id = videos.id
    ${
      cursor
        ? sql`
      WHERE like_count < ${like_count}
      OR (like_count = ${like_count} AND comment_count < ${comment_count})
      OR (like_count = ${like_count} AND comment_count = ${comment_count} AND id != ${id})
    `
        : sql``
    }
    GROUP BY videos.id, likes.like_count, comments.comment_count
    ORDER BY like_count DESC, comment_count DESC, created_at DESC
    LIMIT 10
  `
  }
`;
    return videos;
  } catch (err) {
    console.error("Database error: ", err);
    return null;
  }
}
export async function fetchComments(
  userId: string | undefined,
  videoId: string,
) {
  try {
    const data = await sql<Comment[]>`
    SELECT 
    video_comments.id,
    video_comments.content,
    video_comments.parent_comment_id,
    video_comments.created_at,
    "user".id as poster_id,
    "user".name as poster_name,
    "user".image as poster_image,
    COUNT(video_comment_likes.comment_id) AS "likes",
    BOOL_OR(video_comment_likes.user_id = ${userId ?? null}) AS "isLiked"
    FROM video_comments
    JOIN "user" ON "user".id = video_comments.user_id
    LEFT JOIN video_comment_likes ON video_comment_likes.comment_id = video_comments.id
    WHERE video_comments.video_id = ${videoId}
    GROUP BY 
    video_comments.id,
    video_comments.content,
    video_comments.parent_comment_id,
    video_comments.created_at,
    "user".id,
    "user".name,
    "user".image
    ORDER BY created_at ASC;`;
    const comments = data.map((comment) => ({
      ...comment,
      created_at: generatePrettyDate(comment.created_at),
    }));
    return { data: comments, error: null };
  } catch (err) {
    console.error("Database error: ", err);
    return {
      data: null,
      error: { message: "Failed to fetch comments, please try again later." },
    };
  }
}
