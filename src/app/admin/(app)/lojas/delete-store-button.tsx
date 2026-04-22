"use client";

import { useState, useTransition } from "react";
import { deleteStore } from "@/lib/actions/admin";
import { buttonDanger } from "@/lib/ui";

export function DeleteStoreButton({ storeId }: { storeId: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        className={`${buttonDanger} h-8 px-3 text-xs`}
        onClick={() => {
          setError(null);
          if (
            !confirm(
              "Excluir a loja também remove balconistas e vendas associadas. Confirma?"
            )
          )
            return;
          startTransition(async () => {
            const result = await deleteStore(storeId);
            if (result?.error) setError(result.error);
          });
        }}
      >
        {pending ? "…" : "Excluir"}
      </button>
      {error && (
        <p className="max-w-xs text-right text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
