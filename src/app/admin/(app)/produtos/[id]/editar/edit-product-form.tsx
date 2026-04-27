"use client";

import { useActionState, useMemo } from "react";
import { updateProduct, type AdminFormState } from "@/lib/actions/admin";
import { buttonPrimary, card, inputClass, labelClass } from "@/lib/ui";

export function EditProductForm({
  id,
  name,
  points,
}: {
  id: number;
  name: string;
  points: number;
}) {
  const action = useMemo(() => updateProduct.bind(null, id), [id]);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(action, null);
  return (
    <form action={formAction} className={`${card} grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]`}>
      <div>
        <label className={labelClass} htmlFor="name">
          Nome
        </label>
        <input
          className={inputClass}
          id="name"
          name="name"
          defaultValue={name}
          required
        />
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
          step={0.5}
          defaultValue={points}
          required
        />
        <p className="mt-1 text-xs text-zinc-500">Aceita meio ponto (ex: 0.5, 1, 1.5)</p>
        {state?.fieldErrors?.points && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.points[0]}</p>
        )}
      </div>
      {state?.error && (
        <p className="col-span-full text-xs text-red-600">{state.error}</p>
      )}
      <div className="col-span-full flex justify-end">
        <button type="submit" className={buttonPrimary} disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
