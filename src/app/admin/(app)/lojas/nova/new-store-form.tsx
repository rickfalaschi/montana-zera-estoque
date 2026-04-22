"use client";

import { useActionState } from "react";
import { createStoreWithManager, type AdminFormState } from "@/lib/actions/admin";
import { buttonPrimary, card, inputClass, labelClass } from "@/lib/ui";

export function NewStoreForm() {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    createStoreWithManager,
    null
  );
  return (
    <form action={action} className="space-y-6">
      <div className={card}>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Dados da loja
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="name">
              Nome fantasia
            </label>
            <input className={inputClass} id="name" name="name" required />
            {state?.fieldErrors?.name && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass} htmlFor="legalName">
              Razão social
            </label>
            <input className={inputClass} id="legalName" name="legalName" required />
            {state?.fieldErrors?.legalName && (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.legalName[0]}
              </p>
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
              placeholder="(XX) 9XXXX-XXXX"
              required
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
              placeholder="Rua, número, complemento, bairro"
              required
            />
            {state?.fieldErrors?.address && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.address[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass} htmlFor="city">
              Cidade
            </label>
            <input className={inputClass} id="city" name="city" required />
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
                maxLength={2}
                placeholder="SP"
                required
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
                placeholder="00000-000"
                required
              />
              {state?.fieldErrors?.zipcode && (
                <p className="mt-1 text-xs text-red-600">
                  {state.fieldErrors.zipcode[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={card}>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Gerente da loja
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          O gerente é um balconista com permissão para aprovar colegas e cadastrar vendas.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="managerName">
              Nome
            </label>
            <input className={inputClass} id="managerName" name="managerName" required />
            {state?.fieldErrors?.managerName && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.managerName[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass} htmlFor="managerEmail">
              Email
            </label>
            <input
              className={inputClass}
              id="managerEmail"
              name="managerEmail"
              type="email"
              required
            />
            {state?.fieldErrors?.managerEmail && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.managerEmail[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass} htmlFor="managerCpf">
              CPF
            </label>
            <input
              className={inputClass}
              id="managerCpf"
              name="managerCpf"
              placeholder="000.000.000-00"
              required
            />
            {state?.fieldErrors?.managerCpf && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.managerCpf[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass} htmlFor="managerPassword">
              Senha inicial
            </label>
            <input
              className={inputClass}
              id="managerPassword"
              name="managerPassword"
              type="password"
              minLength={6}
              required
            />
            {state?.fieldErrors?.managerPassword && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.managerPassword[0]}</p>
            )}
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      )}
      <div className="flex justify-end">
        <button type="submit" className={buttonPrimary} disabled={pending}>
          {pending ? "Salvando…" : "Criar loja"}
        </button>
      </div>
    </form>
  );
}
