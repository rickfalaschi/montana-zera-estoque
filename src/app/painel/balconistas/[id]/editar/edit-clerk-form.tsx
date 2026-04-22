"use client";

import { useActionState, useMemo } from "react";
import {
  updateClerkByManager,
  type ClerkUpdateFormState,
} from "@/lib/actions/clerks";
import { buttonPrimary, inputClass, labelClass } from "@/lib/ui";

export function EditClerkForm({
  clerkId,
  initial,
}: {
  clerkId: number;
  initial: { name: string; email: string; cpf: string };
}) {
  const action = useMemo(
    () => updateClerkByManager.bind(null, clerkId),
    [clerkId]
  );
  const [state, formAction, pending] = useActionState<ClerkUpdateFormState, FormData>(
    action,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className={labelClass} htmlFor="name">
          Nome completo
        </label>
        <input
          className={inputClass}
          id="name"
          name="name"
          defaultValue={initial.name}
          required
        />
        {state?.fieldErrors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="email">
          Email
        </label>
        <input
          className={inputClass}
          id="email"
          name="email"
          type="email"
          defaultValue={initial.email}
          required
        />
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="cpf">
          CPF
        </label>
        <input
          className={inputClass}
          id="cpf"
          name="cpf"
          defaultValue={initial.cpf}
          placeholder="000.000.000-00"
          required
        />
        {state?.fieldErrors?.cpf && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.cpf[0]}</p>
        )}
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <button type="submit" className={buttonPrimary} disabled={pending}>
          {pending ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
