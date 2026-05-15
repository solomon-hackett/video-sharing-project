"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/app/lib/auth-client";
import InboxButton from "@/app/ui/navbar/inbox-button";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

import Search from "./search";

const PLACEHOLDER_IMAGE = "https://placehold.net/avatar.png";

const links = [
  { name: "Home", href: "/" },
  { name: "Trending", href: "/discover" },
  { name: "Following", href: "/following" },
  {
    name: "Create",
    href: "/upload",
    icon: (
      <PlusCircleIcon
        style={{
          width: 20,
          height: 20,
          display: "block",
          flexShrink: 0,
          transform: "translateY(0.5px)",
        }}
      />
    ),
  },
];

function SignedInSection({
  session,
}: {
  session: NonNullable<ReturnType<typeof authClient.useSession>["data"]>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const accountLinks = [
    { name: "View Profile", href: `/profile/${session.user.id}/view` },
    { name: "Settings", href: "/account/settings" },
  ];

  const avatarKey =
    session.user.image && session.user.image !== PLACEHOLDER_IMAGE
      ? session.user.image
      : null;
  const avatarSrc = avatarKey
    ? `/api/fetch/avatar?key=${encodeURIComponent(avatarKey)}`
    : "https://placehold.net/avatar.png";

  async function signOut() {
    setIsOpen(false);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out successfully.");
          router.push("/");
        },
        onError: () => {
          toast.error("Failed to sign you out.");
        },
      },
    });
  }

  return (
    <div className="flex" style={{ gap: "10px", alignItems: "center" }}>
      <div className="dropdown" ref={wrapperRef}>
        <button className="avatar-button" onClick={() => setIsOpen(!isOpen)}>
          <img
            src={avatarSrc}
            alt={session.user.name ?? "User avatar"}
            width={32}
            height={32}
            className="rounded-full object-cover avatar-sm"
          />
        </button>
        {isOpen && (
          <div className="dropdown-menu" style={{ minWidth: 180 }}>
            {accountLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="dropdown-menu__item"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="dropdown-menu__divider" />
            <button
              onClick={signOut}
              className="w-full dropdown-menu__item danger"
              style={{
                border: "none",
                background: "none",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
      <InboxButton userId={session?.user.id} />
    </div>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = !!session;

  return (
    <nav className="navbar">
      <Link href="/" className="navbar__logo">
        SoloStream
      </Link>
      <Suspense fallback={<div className="skeleton">Loading...</div>}>
        <Search />
      </Suspense>
      <div className="flex justify-end items-center gap-4">
        <div className="navbar__nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex justify-center items-center gap-1 nav-link",
                { active: pathname === link.href },
              )}
              style={{ lineHeight: "1" }}
            >
              <span className="flex items-center">{link.icon}</span>
              <span style={{ lineHeight: "1" }}>{link.name}</span>
            </Link>
          ))}
        </div>
        {isPending ? (
          <div className="flex" style={{ gap: "10px", alignItems: "center" }}>
            <div className="rounded-full avatar-button skeleton" />
            <div
              className="rounded-md skeleton"
              style={{ width: 42, height: 42 }}
            />
          </div>
        ) : isSignedIn && session ? (
          <SignedInSection key={session.user.id} session={session} />
        ) : (
          <Link href="/auth/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
