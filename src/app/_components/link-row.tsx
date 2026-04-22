"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function LinkRow({
  href,
  children,
  className = "",
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const router = useRouter();
  const onActivate = () => router.push(href);
  return (
    <tr
      className={`${className} cursor-pointer transition hover:bg-zinc-50 focus-within:bg-zinc-50 dark:hover:bg-zinc-900 dark:focus-within:bg-zinc-900`}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={ariaLabel}
    >
      {children}
    </tr>
  );
}
