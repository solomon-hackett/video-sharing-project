type NotificationPayload = {
  title: string;
  message: string;
  creator_image: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  payload: NotificationPayload;
  read: boolean;
  created_at: string;
};

export type ProfileSearchResult = {
  id: string;
  name: string;
  image: string;
  bio: string;
};

export type VideoSearchResult = {
  id: string;
  title: string;
  description: string;
  thumbnail_key: string;
  created_at: string;
  creator_id: string;
  creator_name: string;
  creator_image: string;
  tags: Array<string>;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  key: string;
  created_at: string;
  isPublic: boolean;
  creator_id: string;
  creator_name: string;
  creator_image: string;
  tags: Array<string>;
  isLiked: boolean;
  likes: number;
};

export type Comment = {
  id: string;
  content: string;
  poster_id: string;
  poster_name: string;
  poster_image: string;
  parent_comment_id: string | null;
  created_at: string;
  isLiked: boolean;
  likes: number;
};

export type ParentComment = {
  id: string;
  content: string;
  poster_id: string;
  poster_name: string;
  poster_image: string;
  parent_comment_id: string | null;
  created_at: string;
  isLiked: boolean;
  likes: number;
  replies: Comment[];
};
