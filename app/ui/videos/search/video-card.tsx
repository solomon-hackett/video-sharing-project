"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VideoCard({
  id,
  title,
  thumbnail_key,
  creator_id,
  creator_name,
  creator_image,
  tags,
  created_at,
}: {
  id: string;
  title: string;
  thumbnail_key: string;
  creator_id: string;
  creator_name: string;
  creator_image: string | null;
  created_at: string;
  tags?: string[];
}) {
  const router = useRouter();

  return (
    <div
      className="video-card"
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/discover/${id}/watch`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          router.push(`/discover/${id}/watch`);
        }
      }}
    >
      {/* THUMBNAIL */}
      <div className="video-card__thumbnail">
        <Image
          src={`/api/fetch/thumbnail?key=${encodeURIComponent(thumbnail_key)}`}
          alt={title}
          fill
          className="video-card__img"
        />

        <div className="video-card__overlay">
          <div className="video-card__play">▶</div>
        </div>
      </div>

      {/* BODY */}
      <div className="video-card__body">
        <Image
          src={
            creator_image
              ? `/api/fetch/avatar?key=${encodeURIComponent(creator_image)}`
              : "https://placehold.co/72x72/png"
          }
          alt={creator_name}
          width={36}
          height={36}
          className="avatar avatar-sm video-card__avatar"
        />

        <div className="video-card__meta">
          <p className="line-clamp-2 video-card__title">{title}</p>

          <Link
            href={`/profile/${creator_id}/view`}
            className="video-card__channel"
            onClick={(e) => e.stopPropagation()}
          >
            {creator_name}
          </Link>

          <div className="video-card__stats">{created_at}</div>

          {tags && tags.length > 0 && (
            <div className="video-card__tags">
              {tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs tag tag-ghost">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
