"use client";

import { useActionState } from "react";
import { createProduct, type AdminFormState } from "@/lib/actions/admin";
import { buttonPrimary, card, inputClass, labelClass } from "@/lib/ui";

export function NewProductForm() {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(createProduct, null);
  return (
    <form
      action={action}
      className={`${card} grid grid-cols-1 items-end gap-3 md:grid-cols-[2fr_1fr_auto]`}
    >
      <div>
        <label className={labelClass} htmlFor="name">
          Novo produto
        </label>
        <input className={inputClass} id="name" name="name" required />
        {state?.fieldErrors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
        )}
      </div>
      <div>
        <label className={labelClass} htmlFor="points">
          Pontos
        </label>
        <input
          className={inputClass}
          id="points"
          name="points"
          type="number"
          min={0}
          defaultValue={0}
          required
        />
        {state?.fieldErrors?.points && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.points[0]}</p>
        )}
      </div>
      <button type="submit" className={buttonPrimary} disabled={pending}>
        {pending ? "Salvando…" : "Adicionar"}
      </button>
      {state?.error && <p className="col-span-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
