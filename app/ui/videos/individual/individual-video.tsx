import { headers } from 'next/headers';

import { auth } from '@/app/lib/auth';
import { fetchVideoById } from '@/app/lib/data';

import Video from './video';

export default async function IndividualVideo({ id }: { id: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;
  const result = await fetchVideoById(id, userId);
  if (result === null) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔒</div>
        <div className="empty-state__title">Private Video</div>
        <div className="empty-state__body">
          This is a private post. Ask the owner to make it public if you want
          access.
        </div>
      </div>
    );
  }
  const { video, comments } = result;
  return <Video video={video} user={session?.user} comments={comments} />;
}
