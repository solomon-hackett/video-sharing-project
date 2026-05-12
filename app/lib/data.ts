import { sql } from './db';
import { Notification } from './definitions';
import { generatePrettyDate } from './utils';

export async function fetchUserNotifications(userId: string) {
  const data = await sql<Notification[]>`
    SELECT *
    FROM notifications
    WHERE user_id = ${userId}
      AND (
        read = false
        OR (read = true AND created_at >= NOW() - INTERVAL '2 weeks')
      )
    ORDER BY created_at DESC;
  `;

  return data;
}
