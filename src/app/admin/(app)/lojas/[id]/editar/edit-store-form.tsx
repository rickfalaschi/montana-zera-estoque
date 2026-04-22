"use client";

import { useActionState, useMemo } from "react";
import { updateStore, type AdminFormState } from "@/lib/actions/admin";
import { buttonPrimary, card, inputClass, labelClass } from "@/lib/ui";

export function EditStoreForm({
  storeId,
  initial,
}: {
  storeId: number;
  initial: { name: string; cnpj: string };
}) {
  const action = useMemo(() => updateStore.bind(null, storeId), [storeId]);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    action,
    null
  );

  return (
    <form action={formAction} className={`${card} grid grid-cols-1 gap-4 md:grid-cols-2`}>
      <div>
        <label className={labelClass} htmlFor="name">
          Nome da loja
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
        <label className={labelClass} htmlFor="cnpj">
          CNPJ
        </label>
        <input
          className={inputClass}
          id="cnpj"
          name="cnpj"
          defaultValue={initial.cnpj}
          placeholder="00.000.000/0000-00"
          required
        />
        {state?.fieldErrors?.cnpj && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.cnpj[0]}</p>
        )}
      </div>
      {state?.error && (
        <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {state.error}
        </p>
      )}
      <div className="md:col-span-2 flex justify-end">
        <button type="submit" className={buttonPrimary} disabled={pending}>
          {pending ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
