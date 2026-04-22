"use client";

import { useActionState, useMemo } from "react";
import {
  resetAdminPassword,
  resetClerkPassword,
  type ResetFormState,
} from "@/lib/actions/password-reset";
import { buttonPrimary, inputClass, labelClass } from "@/lib/ui";

export function ResetPasswordForm({
  kind,
  token,
}: {
  kind: "clerk" | "admin";
  token: string;
}) {
  const action = useMemo(
    () =>
      kind === "admin"
        ? resetAdminPassword.bind(null, token)
        : resetClerkPassword.bind(null, token),
    [kind, token]
  );
  const [state, formAction, pending] = useActionState<ResetFormState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="password">
          Nova senha
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
        {state?.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>
      <div>
        <label className={labelClass} htmlFor="confirmPassword">
          Confirmar nova senha
        </label>
        <input
          className={inputClass}
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        {state?.fieldErrors?.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <button type="submit" className={`${buttonPrimary} w-full`} disabled={pending}>
        {pending ? "Salvando…" : "Salvar nova senha"}
      </button>
    </form>
  );
}
