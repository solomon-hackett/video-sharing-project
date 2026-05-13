import Image from 'next/image';
import Link from 'next/link';

import { fetchSearchResults } from '@/app/lib/data';

import SearchControls from './search-controls';
import VideoCard from './video-card';

export default async function SearchResults({
  query,
  sort,
  filters,
}: {
  query: string;
  sort: string;
  filters: Array<string>;
}) {
  const { people, videos, tags } = await fetchSearchResults(
    query,
    sort,
    filters,
  );

  return (
    <div className="flex-col gap-6">
      <SearchControls tags={tags} />

      {/* People Results */}
      {people.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-accent" />
              People
            </h2>
            <span className="pill pill-ghost">{people.length}</span>
          </div>
          <div className="people-grid">
            {people.map((person) => (
              <Link
                key={person.id}
                href={`/account/profile/${person.id}/view`}
                className="channel-card"
              >
                <Image
                  src={
                    person.image
                      ? `/api/fetch/avatar?key=${encodeURIComponent(person.image)}`
                      : "https://placehold.net/avatar.png"
                  }
                  alt={person.name}
                  width={40}
                  height={40}
                  className="avatar-ring avatar avatar-md"
                />
                <div className="flex-col flex-1 gap-1 overflow-hidden">
                  <p className="truncate channel-card__name">{person.name}</p>
                  <p className="text-muted text-sm line-clamp-2">
                    {person.bio}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Video Results */}
      {videos.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-accent" />
              Videos
            </h2>
            <span className="pill pill-ghost">{videos.length}</span>
          </div>
          <div className="grid-4">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                thumbnail_key={video.thumbnail_key}
                creator_id={video.creator_id}
                creator_name={video.creator_name}
                creator_image={video.creator_image}
                tags={video.tags}
                created_at={video.created_at}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {people.length === 0 && videos.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <p className="empty-state__title">No results found</p>
          <p className="empty-state__body">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
