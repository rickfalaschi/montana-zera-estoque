"use client";

import { useActionState, useMemo } from "react";
import { updateStore, type AdminFormState } from "@/lib/actions/admin";
import { buttonPrimary, card, inputClass, labelClass } from "@/lib/ui";
import { formatCep, formatPhone } from "@/lib/format";

export function EditStoreForm({
  storeId,
  initial,
}: {
  storeId: number;
  initial: {
    name: string;
    cnpj: string;
    legalName: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipcode: string | null;
    phone: string | null;
  };
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
          Nome fantasia
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
        <label className={labelClass} htmlFor="legalName">
          Razão social
        </label>
        <input
          className={inputClass}
          id="legalName"
          name="legalName"
          defaultValue={initial.legalName ?? ""}
        />
        {state?.fieldErrors?.legalName && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.legalName[0]}</p>
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
      <div>
        <label className={labelClass} htmlFor="phone">
          Telefone
        </label>
        <input
          className={inputClass}
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initial.phone ? formatPhone(initial.phone) : ""}
          placeholder="(XX) 9XXXX-XXXX"
        />
        {state?.fieldErrors?.phone && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.phone[0]}</p>
        )}
      </div>
      <div className="md:col-span-2">
        <label className={labelClass} htmlFor="address">
          Endereço
        </label>
        <input
          className={inputClass}
          id="address"
          name="address"
          defaultValue={initial.address ?? ""}
          placeholder="Rua, número, complemento, bairro"
        />
        {state?.fieldErrors?.address && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.address[0]}</p>
        )}
      </div>
      <div>
        <label className={labelClass} htmlFor="city">
          Cidade
        </label>
        <input
          className={inputClass}
          id="city"
          name="city"
          defaultValue={initial.city ?? ""}
        />
        {state?.fieldErrors?.city && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.city[0]}</p>
        )}
      </div>
      <div className="grid grid-cols-[90px_1fr] gap-3">
        <div>
          <label className={labelClass} htmlFor="state">
            UF
          </label>
          <input
            className={`${inputClass} uppercase`}
            id="state"
            name="state"
            defaultValue={initial.state ?? ""}
            maxLength={2}
            placeholder="SP"
          />
          {state?.fieldErrors?.state && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.state[0]}</p>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor="zipcode">
            CEP
          </label>
          <input
            className={inputClass}
            id="zipcode"
            name="zipcode"
            defaultValue={initial.zipcode ? formatCep(initial.zipcode) : ""}
            placeholder="00000-000"
          />
          {state?.fieldErrors?.zipcode && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.zipcode[0]}</p>
          )}
        </div>
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
