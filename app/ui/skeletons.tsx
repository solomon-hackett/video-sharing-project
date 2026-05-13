export function SearchResultsSkeleton() {
  return (
    <div className="grid-auto">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="video-card">
          <div className="skeleton skeleton-thumb" />
          <div className="video-card__body">
            <div className="skeleton avatar avatar-sm" />
            <div
              className="video-card__meta"
              style={{ gap: "6px", display: "flex", flexDirection: "column" }}
            >
              <div
                className="skeleton skeleton-title"
                style={{ width: "85%" }}
              />
              <div
                className="skeleton skeleton-text"
                style={{ width: "55%" }}
              />
              <div
                className="skeleton skeleton-text"
                style={{ width: "40%" }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
