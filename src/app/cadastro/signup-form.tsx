"use client";

import { useActionState } from "react";
import { signupClerk, type FormState } from "@/lib/actions/auth";
import { buttonPrimary, inputClass, labelClass } from "@/lib/ui";

export function SignupForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signupClerk, null);
  return (
    <form action={action} className="space-y-4">
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
        <input className={inputClass} id="email" name="email" type="email" required />
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="cpf">
            CPF
          </label>
          <input
            className={inputClass}
            id="cpf"
            name="cpf"
            placeholder="000.000.000-00"
            required
          />
          {state?.fieldErrors?.cpf && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.cpf[0]}</p>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor="rg">
            RG
          </label>
          <input
            className={inputClass}
            id="rg"
            name="rg"
            placeholder="Número do RG"
            required
          />
          {state?.fieldErrors?.rg && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.rg[0]}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div>
          <label className={labelClass} htmlFor="birthDate">
            Data de nascimento
          </label>
          <input
            className={inputClass}
            id="birthDate"
            name="birthDate"
            type="date"
            required
          />
          {state?.fieldErrors?.birthDate && (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.birthDate[0]}
            </p>
          )}
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="storeCnpj">
          CNPJ da loja
        </label>
        <input
          className={inputClass}
          id="storeCnpj"
          name="storeCnpj"
          placeholder="00.000.000/0000-00"
          required
        />
        {state?.fieldErrors?.storeCnpj && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.storeCnpj[0]}</p>
        )}
      </div>
      <div>
        <label className={labelClass} htmlFor="password">
          Senha
        </label>
        <input
          className={inputClass}
          id="password"
          name="password"
          type="password"
          minLength={6}
          required
        />
        {state?.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      )}
      <button className={`${buttonPrimary} w-full`} type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Cadastrar"}
      </button>
    </form>
  );
}
