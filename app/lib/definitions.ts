type NotificationPayload = {
  title: string;
  message: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  payload: NotificationPayload;
  read: boolean;
  created_at: string;
};
