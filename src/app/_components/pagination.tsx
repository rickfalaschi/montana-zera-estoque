import Link from "next/link";

export const DEFAULT_PAGE_SIZE = 25;

type Props = {
  page: number;
  totalItems: number;
  pageSize?: number;
  baseHref: string;
  params?: Record<string, string | undefined>;
};

/**
 * Uso:
 *   const { page, pageSize, offset, totalPages } = resolvePagination(rawPage, totalItems);
 *   const rows = await sql`... LIMIT ${pageSize} OFFSET ${offset}`;
 *   <Pagination page={page} totalItems={totalItems} baseHref="/admin/lojas" />
 */
export function resolvePagination(
  rawPage: string | number | undefined,
  totalItems: number,
  pageSize: number = DEFAULT_PAGE_SIZE
) {
  const parsed = Math.max(1, Math.floor(Number(rawPage) || 1));
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(parsed, totalPages);
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset, totalPages };
}

export function Pagination({
  page,
  totalItems,
  pageSize = DEFAULT_PAGE_SIZE,
  baseHref,
  params,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  function hrefFor(p: number) {
    const sp = new URLSearchParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v.length > 0) sp.set(k, v);
      }
    }
    if (p > 1) sp.set("page", String(p));
    const query = sp.toString();
    return query ? `${baseHref}?${query}` : baseHref;
  }

  const btn =
    "inline-flex h-8 items-center justify-center rounded-md border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";
  const btnDisabled =
    "inline-flex h-8 cursor-not-allowed items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 px-3 text-xs font-semibold text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-600";

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
      <p className="text-xs text-zinc-500">
        Mostrando{" "}
        <span className="font-semibold text-zinc-700 dark:text-zinc-200">
          {first}–{last}
        </span>{" "}
        de{" "}
        <span className="font-semibold text-zinc-700 dark:text-zinc-200">
          {totalItems}
        </span>
      </p>
      <nav
        aria-label="Paginação"
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {prevDisabled ? (
          <>
            <span aria-disabled className={btnDisabled}>
              « Primeira
            </span>
            <span aria-disabled className={btnDisabled}>
              ← Anterior
            </span>
          </>
        ) : (
          <>
            <Link href={hrefFor(1)} className={btn}>
              « Primeira
            </Link>
            <Link href={hrefFor(page - 1)} className={btn}>
              ← Anterior
            </Link>
          </>
        )}
        <span className="px-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
          Página {page} de {totalPages}
        </span>
        {nextDisabled ? (
          <>
            <span aria-disabled className={btnDisabled}>
              Próxima →
            </span>
            <span aria-disabled className={btnDisabled}>
              Última »
            </span>
          </>
        ) : (
          <>
            <Link href={hrefFor(page + 1)} className={btn}>
              Próxima →
            </Link>
            <Link href={hrefFor(totalPages)} className={btn}>
              Última »
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}
