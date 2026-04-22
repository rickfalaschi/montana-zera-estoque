"use client";

import { useState, useTransition } from "react";
import { deleteAdmin } from "@/lib/actions/admin";
import { buttonDanger } from "@/lib/ui";

export function DeleteAdminButton({
  adminId,
  name,
}: {
  adminId: number;
  name: string;
}) {
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
          if (!confirm(`Remover o acesso administrativo de ${name}?`)) return;
          startTransition(async () => {
            const result = await deleteAdmin(adminId);
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
