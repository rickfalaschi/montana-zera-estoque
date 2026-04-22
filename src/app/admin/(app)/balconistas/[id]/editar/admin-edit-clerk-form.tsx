"use client";

import { useActionState, useMemo } from "react";
import { adminUpdateClerk, type AdminFormState } from "@/lib/actions/admin";
import { buttonPrimary, card, inputClass, labelClass } from "@/lib/ui";
import { formatPhone } from "@/lib/format";

export function AdminEditClerkForm({
  clerkId,
  initial,
}: {
  clerkId: number;
  initial: {
    name: string;
    email: string;
    cpf: string;
    rg: string | null;
    phone: string | null;
    birthDate: string | null;
    pixKey: string | null;
    isManager: boolean;
    isApproved: boolean;
  };
}) {
  const action = useMemo(() => adminUpdateClerk.bind(null, clerkId), [clerkId]);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    action,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <section className={card}>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Dados cadastrais
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="name">
              Nome completo
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
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              className={inputClass}
              id="email"
              name="email"
              type="email"
              defaultValue={initial.email}
              required
            />
            {state?.fieldErrors?.email && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
            )}
          </div>
          <div>
            <label className={labelClass} htmlFor="cpf">
              CPF
            </label>
            <input
              className={inputClass}
              id="cpf"
              name="cpf"
              defaultValue={initial.cpf}
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
              defaultValue={initial.rg ?? ""}
              placeholder="Número do RG"
            />
            {state?.fieldErrors?.rg && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.rg[0]}</p>
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
          <div>
            <label className={labelClass} htmlFor="birthDate">
              Data de nascimento
            </label>
            <input
              className={inputClass}
              id="birthDate"
              name="birthDate"
              type="date"
              defaultValue={initial.birthDate ?? ""}
            />
            {state?.fieldErrors?.birthDate && (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.birthDate[0]}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="pixKey">
              Chave Pix
            </label>
            <input
              className={inputClass}
              id="pixKey"
              name="pixKey"
              defaultValue={initial.pixKey ?? ""}
              placeholder="CPF, email, celular ou chave aleatória"
              maxLength={140}
            />
            {state?.fieldErrors?.pixKey && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.pixKey[0]}</p>
            )}
          </div>
        </div>
      </section>

      <section className={card}>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">Permissões</h2>
        <div className="mt-4 space-y-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="isManager"
              defaultChecked={initial.isManager}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[#027D04] focus:ring-[#027D04]"
            />
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                Gerente da loja
              </p>
              <p className="text-xs text-zinc-500">
                Gerentes cadastram vendas e aprovam outros balconistas.
                Cada loja tem apenas 1 gerente — ao marcar esta opção, o
                gerente atual (se houver) é rebaixado automaticamente.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="isApproved"
              defaultChecked={initial.isApproved}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[#027D04] focus:ring-[#027D04]"
            />
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                Cadastro aprovado
              </p>
              <p className="text-xs text-zinc-500">
                Se desmarcar, o balconista perde o acesso até ser aprovado de novo.
              </p>
            </div>
          </label>
        </div>
      </section>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <button type="submit" className={buttonPrimary} disabled={pending}>
          {pending ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
