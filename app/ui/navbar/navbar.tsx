"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { authClient } from "@/app/lib/auth-client";

import Search from "./search";

const links = [
  { name: "Home", href: "/" },
  { name: "Trending", href: "/discover" },
  { name: "Following", href: "/following" },
];

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = !!session;
  const avatarKey = session?.user.image
    ? new URL(session.user.image).pathname.split("/").pop()
    : null;

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
      {isPending ? (
        <div className="bg-gray-300 rounded-full animate-pulse avatar-sm" />
      ) : isSignedIn && session ? (
        <div className="bg-gray-300 rounded-full overflow-hidden animate-pulse avatar-sm">
          <Link href="/account">
            <img
              src={
                avatarKey
                  ? `/api/fetch/avatar?key=${encodeURIComponent(avatarKey)}`
                  : "/default-avatar.png"
              }
              alt={session.user.name ?? "User avatar"}
              width={32}
              height={32}
              className="opacity-0 rounded-full object-cover transition-opacity duration-200 avatar-sm"
              onLoad={(e) => {
                e.currentTarget.classList.remove("opacity-0");
              }}
            />
          </Link>
        </div>
      ) : (
        <Link href="/auth/login">Login</Link>
      )}
    </nav>
  );
}
