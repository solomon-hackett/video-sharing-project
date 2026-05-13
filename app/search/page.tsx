import { Suspense } from 'react';

import { SearchResultsSkeleton } from '@/app/ui/skeletons';
import SearchResults from '@/app/ui/videos/search/search-results';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    sort?: string;
    filter?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const sort = searchParams?.sort || "";
  const filter = Array.isArray(searchParams?.filter)
    ? searchParams.filter
    : searchParams?.filter
      ? [searchParams.filter]
      : [];

  return (
    <main className="page-content">
      <div className="container">
        {query && (
          <div className="search-page-header">
            <h2>
              Results for{" "}
              <span className="text-gradient">&quot;{query}&quot;</span>
            </h2>
          </div>
        )}
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults query={query} sort={sort} filters={filter} />
        </Suspense>
      </div>
    </main>
  );
}
