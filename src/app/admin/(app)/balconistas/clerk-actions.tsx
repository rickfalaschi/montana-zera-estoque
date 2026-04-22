"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { adminApproveClerk, adminDeleteClerk } from "@/lib/actions/admin";
import { buttonDanger, buttonPrimary, buttonSecondary } from "@/lib/ui";

export function ClerkActions({
  clerkId,
  isApproved,
}: {
  clerkId: number;
  isApproved: boolean;
  isManager: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-end gap-2">
        {!isApproved && (
          <button
            type="button"
            disabled={pending}
            className={`${buttonPrimary} h-8 px-3 text-xs`}
            onClick={() => {
              setError(null);
              startTransition(async () => adminApproveClerk(clerkId));
            }}
          >
            Aprovar
          </button>
        )}
        <Link
          href={`/admin/balconistas/${clerkId}/editar`}
          className={`${buttonSecondary} h-8 px-3 text-xs`}
        >
          Editar
        </Link>
        <button
          type="button"
          disabled={pending}
          className={`${buttonDanger} h-8 px-3 text-xs`}
          onClick={() => {
            setError(null);
            if (
              !confirm(
                "Excluir o balconista também remove cashbacks e vendas em nome dele. Confirma?"
              )
            )
              return;
            startTransition(async () => {
              const result = await adminDeleteClerk(clerkId);
              if (result?.error) setError(result.error);
            });
          }}
        >
          {pending ? "…" : "Excluir"}
        </button>
      </div>
      {error && (
        <p className="max-w-xs text-right text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
