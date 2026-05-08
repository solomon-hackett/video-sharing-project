import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Search() {
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
      />
    </div>
  );
}
