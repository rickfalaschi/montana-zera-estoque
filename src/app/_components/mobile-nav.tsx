"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export type MobileNavLink = { href: string; label: string };

export function MobileNav({
  links,
  userName,
  userSubtitle,
  panelBg,
  maxWidthClass = "max-w-6xl",
}: {
  links: MobileNavLink[];
  userName: string;
  userSubtitle?: string;
  panelBg: string;
  maxWidthClass?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white transition hover:bg-white/10"
      >
        {open ? (
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        ) : (
          <svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 6h18" />
            <path d="M3 12h18" />
            <path d="M3 18h18" />
          </svg>
        )}
      </button>

      {open && (
        <div
          className="absolute inset-x-0 top-full z-30 border-t border-white/10 shadow-2xl shadow-black/40"
          style={{ backgroundColor: panelBg }}
        >
          <div className={`mx-auto ${maxWidthClass} px-6 py-4`}>
            <nav className="flex flex-col">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-sm font-semibold text-white">{userName}</p>
              {userSubtitle && (
                <p className="mt-0.5 text-xs text-white/60">{userSubtitle}</p>
              )}
              <form action={logout} className="mt-3">
                <button
                  type="submit"
                  className="w-full rounded-lg border border-white/30 bg-transparent px-4 py-2 text-xs font-semibold text-white/90 transition hover:border-white/50 hover:bg-white/10 hover:text-white"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
