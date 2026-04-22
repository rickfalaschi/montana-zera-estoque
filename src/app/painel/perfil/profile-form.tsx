"use client";

import { useActionState } from "react";
import { updateClerkProfile, type ProfileFormState } from "@/lib/actions/profile";
import { buttonPrimary, inputClass, labelClass } from "@/lib/ui";

export function ProfileForm({ initialPixKey }: { initialPixKey: string | null }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    updateClerkProfile,
    null
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="pixKey">
          Chave Pix
        </label>
        <input
          className={inputClass}
          id="pixKey"
          name="pixKey"
          defaultValue={initialPixKey ?? ""}
          placeholder="CPF, email, celular ou chave aleatória"
          maxLength={140}
        />
        <p className="mt-1 text-xs text-zinc-500">
          Deixe em branco para remover a chave cadastrada.
        </p>
        {state?.fieldErrors?.pixKey && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.pixKey[0]}</p>
        )}
      </div>

      {state?.success && (
        <p className="rounded-md border border-[#027D04]/30 bg-[#027D04]/10 px-3 py-2 text-sm text-[#015701]">
          Chave Pix atualizada.
        </p>
      )}
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <button type="submit" className={buttonPrimary} disabled={pending}>
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
