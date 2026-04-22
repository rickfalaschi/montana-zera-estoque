"use client";

import { useTransition } from "react";
import { markCashbackPaid, unmarkCashbackPaid } from "@/lib/actions/admin";
import { buttonPrimary, buttonSecondary } from "@/lib/ui";

export function CashbackAction({
  clerkId,
  year,
  month,
  amountCents,
  isPaid,
}: {
  clerkId: number;
  year: number;
  month: number;
  amountCents: number;
  isPaid: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex justify-end">
      {isPaid ? (
        <button
          type="button"
          disabled={pending}
          className={`${buttonSecondary} h-8 px-3 text-xs`}
          onClick={() => {
            if (!confirm("Desmarcar pagamento?")) return;
            startTransition(async () => unmarkCashbackPaid(clerkId, year, month));
          }}
        >
          {pending ? "…" : "Desmarcar"}
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          className={`${buttonPrimary} h-8 px-3 text-xs`}
          onClick={() =>
            startTransition(async () =>
              markCashbackPaid(clerkId, year, month, amountCents)
            )
          }
        >
          {pending ? "…" : "Marcar como pago"}
        </button>
      )}
    </div>
  );
}
