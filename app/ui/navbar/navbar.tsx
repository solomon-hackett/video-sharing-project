"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserCircleIcon } from "@heroicons/react/24/outline";

import Search from "./search";

const links = [
  { name: "Home", href: "/" },
  { name: "Trending", href: "/discover" },
  { name: "Following", href: "/following" },
];

export default function NavBar() {
  const isSignedIn = false;
  const pathname = usePathname();
  return (
    <nav className="navbar">
      <Link href="/" className="navbar__logo">
        SoloStream
      </Link>
      <Search />
      <div className="navbar__nav">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx("nav-link", { active: pathname === link.href })}
          >
            {link.name}
          </Link>
        ))}
      </div>
      {isSignedIn ? (
        <div className="avatar-initials avatar-sm">
          <UserCircleIcon className="w-5 h-5" />
        </div>
      ) : (
        <Link href="/auth/login" className="">
          Login
        </Link>
      )}
    </nav>
  );
}
