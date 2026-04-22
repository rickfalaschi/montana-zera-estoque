"use client";

import { useActionState, useMemo, useState } from "react";
import { createSale, updateSale, type SaleFormState } from "@/lib/actions/sales";
import {
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  card,
  inputClass,
  labelClass,
} from "@/lib/ui";
import { formatBRL } from "@/lib/format";

type ClerkOpt = { id: number; name: string };
type ProductOpt = { id: number; name: string; points: number };

type Item = { productId: number; quantity: number };

type CreateProps = {
  mode: "create";
  clerks: ClerkOpt[];
  products: ProductOpt[];
};

type EditProps = {
  mode: "edit";
  saleId: number;
  clerks: ClerkOpt[];
  products: ProductOpt[];
  initial: { clerkId: number; items: Item[] };
};

type Props = CreateProps | EditProps;

export function SaleForm(props: Props) {
  const { clerks, products } = props;
  const productsById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  const defaultClerk = props.mode === "edit" ? props.initial.clerkId : clerks[0]?.id ?? 0;
  const [clerkId, setClerkId] = useState<number>(defaultClerk);
  const [items, setItems] = useState<Item[]>(
    props.mode === "edit" && props.initial.items.length > 0
      ? props.initial.items
      : [{ productId: products[0]?.id ?? 0, quantity: 1 }]
  );

  const action = useMemo(() => {
    if (props.mode === "edit") return updateSale.bind(null, props.saleId);
    return createSale;
  }, [props]);

  const [state, formAction, pending] = useActionState<SaleFormState, FormData>(action, null);

  const totalPoints = items.reduce((sum, it) => {
    const p = productsById.get(it.productId);
    return sum + (p ? p.points * (Number(it.quantity) || 0) : 0);
  }, 0);

  function updateItem(index: number, patch: Partial<Item>) {
    setItems((current) =>
      current.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  }

  function addItem() {
    setItems((current) => [...current, { productId: products[0]?.id ?? 0, quantity: 1 }]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  const disabledForm = clerks.length === 0 || products.length === 0;

  return (
    <form action={formAction} className="space-y-6">
      <div className={card}>
        <div>
          <label className={labelClass} htmlFor="clerkId">
            Balconista
          </label>
          <select
            id="clerkId"
            name="clerkId"
            className={inputClass}
            value={clerkId}
            onChange={(e) => setClerkId(Number(e.target.value))}
            required
          >
            {clerks.length === 0 && <option value="">Nenhum balconista aprovado</option>}
            {clerks.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={card}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Produtos</h2>
          <button type="button" onClick={addItem} className={buttonSecondary}>
            + Adicionar item
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {items.map((it, i) => {
            const product = productsById.get(it.productId);
            const pointsLine = product
              ? `${product.points} pt x ${it.quantity || 0} = ${
                  product.points * (Number(it.quantity) || 0)
                } pts`
              : "";
            return (
              <div
                key={i}
                className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_120px_auto]"
              >
                <div>
                  <label className={labelClass}>Produto</label>
                  <select
                    name="productId"
                    className={inputClass}
                    value={it.productId}
                    onChange={(e) =>
                      updateItem(i, { productId: Number(e.target.value) })
                    }
                    required
                  >
                    {products.length === 0 && <option value="">Nenhum produto ativo</option>}
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.points} pts)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Quantidade</label>
                  <input
                    type="number"
                    name="quantity"
                    min={1}
                    className={inputClass}
                    value={it.quantity}
                    onChange={(e) =>
                      updateItem(i, { quantity: Number(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-zinc-500">{pointsLine}</p>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className={`${buttonDanger} h-10 px-3 text-xs`}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div>
            <p className="text-sm text-zinc-500">Total de pontos</p>
            <p className="text-lg font-semibold">
              {totalPoints} pts &middot; Cashback {formatBRL(totalPoints * 100)}
            </p>
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      )}
      {state?.fieldErrors?.items && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.fieldErrors.items[0]}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button type="submit" className={buttonPrimary} disabled={pending || disabledForm}>
          {pending ? "Salvando…" : props.mode === "edit" ? "Salvar alterações" : "Cadastrar venda"}
        </button>
      </div>
      {disabledForm && (
        <p className="text-xs text-red-600">
          {clerks.length === 0
            ? "Não há balconistas aprovados ainda. Aprove um cadastro antes de cadastrar vendas."
            : "Não há produtos ativos para venda."}
        </p>
      )}
    </form>
  );
}
