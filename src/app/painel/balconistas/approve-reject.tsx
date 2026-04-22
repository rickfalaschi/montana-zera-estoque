"use client";

import { useTransition } from "react";
import { approveClerk, rejectClerk } from "@/lib/actions/clerks";
import { buttonDanger, buttonPrimary } from "@/lib/ui";

export function ApproveReject({ clerkId }: { clerkId: number }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        disabled={pending}
        className={`${buttonPrimary} h-8 px-3 text-xs`}
        onClick={() => startTransition(async () => approveClerk(clerkId))}
      >
        Aprovar
      </button>
      <button
        type="button"
        disabled={pending}
        className={`${buttonDanger} h-8 px-3 text-xs`}
        onClick={() => {
          if (!confirm("Recusar este cadastro?")) return;
          startTransition(async () => rejectClerk(clerkId));
        }}
      >
        Recusar
      </button>
    </div>
  );
}
