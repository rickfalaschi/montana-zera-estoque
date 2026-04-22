"use client";

import { useTransition } from "react";
import { deleteSale } from "@/lib/actions/sales";
import { buttonDanger } from "@/lib/ui";

export function DeleteSaleButton({ saleId }: { saleId: number }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={`${buttonDanger} h-8 px-3 text-xs`}
      onClick={() => {
        if (!confirm("Excluir esta venda?")) return;
        startTransition(async () => {
          await deleteSale(saleId);
        });
      }}
    >
      {pending ? "…" : "Excluir"}
    </button>
  );
}
