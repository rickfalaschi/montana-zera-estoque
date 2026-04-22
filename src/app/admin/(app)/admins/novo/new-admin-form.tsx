"use client";

import { useActionState } from "react";
import { createAdmin, type AdminFormState } from "@/lib/actions/admin";
import { buttonPrimary, card, inputClass, labelClass } from "@/lib/ui";

export function NewAdminForm() {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    createAdmin,
    null
  );

  return (
    <form action={action} className={`${card} grid grid-cols-1 gap-4 md:grid-cols-2`}>
      <div>
        <label className={labelClass} htmlFor="name">
          Nome completo
        </label>
        <input className={inputClass} id="name" name="name" required />
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
          autoComplete="off"
          required
        />
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>
      <div className="md:col-span-2">
        <label className={labelClass} htmlFor="password">
          Senha inicial
        </label>
        <input
          className={inputClass}
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <p className="mt-1 text-xs text-zinc-500">
          O admin pode trocar a senha depois via &quot;Esqueci minha senha&quot;.
        </p>
        {state?.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      {state?.error && (
        <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="md:col-span-2 flex justify-end">
        <button type="submit" className={buttonPrimary} disabled={pending}>
          {pending ? "Salvando…" : "Criar admin"}
        </button>
      </div>
    </form>
  );
}
