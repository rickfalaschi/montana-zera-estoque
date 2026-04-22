"use client";

import { useTransition } from "react";
import { toggleProductActive } from "@/lib/actions/admin";
import { buttonSecondary } from "@/lib/ui";

export function ProductActions({
  productId,
  isActive,
}: {
  productId: number;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={`${buttonSecondary} h-8 px-3 text-xs`}
      onClick={() => startTransition(async () => toggleProductActive(productId))}
    >
      {pending ? "…" : isActive ? "Desativar" : "Ativar"}
    </button>
  );
}
