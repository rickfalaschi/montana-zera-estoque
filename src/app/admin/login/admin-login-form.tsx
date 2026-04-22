"use client";

import { useActionState } from "react";
import { loginAdmin, type FormState } from "@/lib/actions/auth";
import { buttonPrimary, inputClass, labelClass } from "@/lib/ui";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAdmin, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="email">
          Email
        </label>
        <input className={inputClass} id="email" name="email" type="email" required />
      </div>
      <div>
        <label className={labelClass} htmlFor="password">
          Senha
        </label>
        <input className={inputClass} id="password" name="password" type="password" required />
      </div>
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      )}
      <button className={`${buttonPrimary} w-full`} type="submit" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
