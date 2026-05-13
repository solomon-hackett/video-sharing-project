import Image from 'next/image';
import Link from 'next/link';

import type { Video } from "@/app/lib/definitions";

export default function Video({ video }: { video: Video }) {
  return (
    <div className="container-md page-content">
      {/* Title */}
      <h1 className="mb-4 text-gradient">{video.title}</h1>

      {/* Player */}
      <div className="mb-6 player-wrapper">
        <video
          className="w-full h-full"
          src={`/api/fetch/video?key=${video.key}`}
          controls
        />
      </div>

      {/* Description */}
      <p className="mb-6 text-base">{video.description}</p>

      {/* Creator card */}
      <Link
        href={`/account/profile/${video.creator_id}/view`}
        className="channel-card"
      >
        <Image
          className="avatar avatar-md"
          src={`/api/fetch/avatar?key=${video.creator_image}`}
          alt={video.creator_name}
          width={40}
          height={40}
        />

        <div className="flex flex-col">
          <span className="channel-card__name">{video.creator_name}</span>
          <span className="text-muted text-sm">View profile</span>
        </div>
      </Link>

      {/* Date */}
      <div className="mt-4 text-muted text-sm">{video.created_at}</div>
    </div>
  );
}
