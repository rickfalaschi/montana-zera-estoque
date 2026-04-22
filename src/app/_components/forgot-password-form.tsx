"use client";

import { useActionState } from "react";
import {
  requestAdminPasswordReset,
  requestClerkPasswordReset,
  type RequestFormState,
} from "@/lib/actions/password-reset";
import { buttonPrimary, inputClass, labelClass } from "@/lib/ui";

export function ForgotPasswordForm({ kind }: { kind: "clerk" | "admin" }) {
  const action = kind === "admin" ? requestAdminPasswordReset : requestClerkPasswordReset;
  const [state, formAction, pending] = useActionState<RequestFormState, FormData>(action, null);

  if (state?.sent) {
    return (
      <div className="rounded-lg border border-[#027D04]/30 bg-[#027D04]/10 p-4 text-sm text-[#015701]">
        Se o email informado estiver cadastrado, enviamos um link para redefinir
        a senha. Confira sua caixa de entrada (e spam). O link expira em 1 hora.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="email">
          Email
        </label>
        <input
          className={inputClass}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <button type="submit" className={`${buttonPrimary} w-full`} disabled={pending}>
        {pending ? "Enviando…" : "Enviar link de redefinição"}
      </button>
    </form>
  );
}
