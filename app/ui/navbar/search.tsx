"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Search() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`/search?${params.toString()}`);
  }, 300);

  return (
    <div className="input-group navbar__search">
      <MagnifyingGlassIcon
        className="input-group__icon"
        width={16}
        height={16}
      />
      <input
        className="input"
        type="text"
        name="search"
        id="search"
        placeholder="Search videos, creators…"
        defaultValue={searchParams.get("query")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
