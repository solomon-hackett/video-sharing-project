"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
    ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon, PlusIcon, XMarkIcon
} from '@heroicons/react/24/outline';

export default function SearchControls({ tags }: { tags: Array<string> }) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const [sortIsOpen, setSortIsOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const currentSort = searchParams.get("sort");
  const isAsc = currentSort?.endsWith("-asc") ?? false;

  const [filterIsOpen, setFilterIsOpen] = useState(false);
  const [tagsIsOpen, setTagsIsOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const currentFilters = searchParams.getAll("filter");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSort(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      const newDirection = isAsc ? "desc" : "asc";
      params.set("sort", `${value}-${newDirection}`);
    } else {
      params.delete("sort");
    }
    replace(`${pathname}?${params.toString()}`);
  }

  function handleFilter(value: string, checked: boolean) {
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.append("filter", value);
    } else {
      params.delete("filter");
      currentFilters.forEach((filter) => {
        if (filter !== value) params.append("filter", filter);
      });
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="search-controls">
      {/* Sort dropdown */}
      <div className="dropdown" ref={sortRef}>
        <button
          className={`btn btn-sm ${currentSort ? "btn-cyan" : ""}`}
          onClick={() => setSortIsOpen(!sortIsOpen)}
        >
          {currentSort ?? "Sort By"}
          {!currentSort ? (
            <ChevronUpDownIcon className="controls-icon" />
          ) : isAsc ? (
            <ChevronUpIcon className="controls-icon" />
          ) : (
            <ChevronDownIcon className="controls-icon" />
          )}
        </button>

        {sortIsOpen && (
          <div className="dropdown-menu">
            <button
              className="dropdown-menu__item"
              onClick={() => handleSort("date")}
            >
              Date
              {isAsc ? (
                <ChevronUpIcon className="controls-icon" />
              ) : (
                <ChevronDownIcon className="controls-icon" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Filter dropdown */}
      <div className="dropdown" ref={filterRef}>
        <button
          className={`btn btn-sm ${filterIsOpen || currentFilters.length > 0 ? "btn-cyan" : ""}`}
          onClick={() => setFilterIsOpen(!filterIsOpen)}
        >
          Filters
          {currentFilters.length > 0 && (
            <span className="badge badge-cyan">{currentFilters.length}</span>
          )}
          <ChevronDownIcon className="controls-icon" />
        </button>

        {filterIsOpen && (
          <div className="dropdown-menu">
            {/* People filter */}
            <label className="filter-check-item">
              <span className="dropdown-menu__item">People</span>
              <input
                type="checkbox"
                name="people"
                className="filter-check-input"
                checked={currentFilters.includes("people")}
                onChange={(e) => handleFilter(e.target.name, e.target.checked)}
              />
            </label>

            {/* Videos filter */}
            <label className="filter-check-item">
              <span className="dropdown-menu__item">Videos</span>
              <input
                type="checkbox"
                name="videos"
                className="filter-check-input"
                checked={currentFilters.includes("videos")}
                onChange={(e) => handleFilter(e.target.name, e.target.checked)}
              />
            </label>

            <div className="dropdown-menu__divider" />

            {/* Tags sub-section */}
            <button
              className="dropdown-menu__item"
              onClick={() => setTagsIsOpen(!tagsIsOpen)}
            >
              Tags
              {tagsIsOpen ? (
                <XMarkIcon className="controls-icon" />
              ) : (
                <PlusIcon className="controls-icon" />
              )}
            </button>

            {tagsIsOpen && (
              <div className="filter-tags-list">
                {tags.map((tag) => (
                  <label key={tag} className="filter-check-item">
                    <span className="dropdown-menu__item">{tag}</span>
                    <input
                      type="checkbox"
                      name={tag}
                      className="filter-check-input"
                      checked={currentFilters.includes(tag)}
                      onChange={(e) =>
                        handleFilter(e.target.name, e.target.checked)
                      }
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active filter pills */}
      {currentFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentFilters.map((filter) => (
            <span key={filter} className="tag tag-ghost">
              {filter}
              <button onClick={() => handleFilter(filter, false)}>
                <XMarkIcon className="controls-icon-xs" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
