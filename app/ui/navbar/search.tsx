"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Search() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`/search?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    doSearch(term);
  }, 300);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch.cancel();
      doSearch(inputRef.current?.value ?? "");
    }
  };

  return (
    <div className="input-group navbar__search">
      <MagnifyingGlassIcon
        className="input-group__icon"
        width={16}
        height={16}
      />
      <input
        ref={inputRef}
        className="input"
        type="text"
        name="search"
        id="search"
        placeholder="Search videos, creators…"
        defaultValue={searchParams.get("query")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
