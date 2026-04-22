import { NextResponse, type NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { getCashbacksForMonth } from "@/lib/cashback";
import { monthName } from "@/lib/format";

function escapeCsv(value: string): string {
  return /[;"\n\r]/.test(value)
    ? `"${value.replace(/"/g, '""')}"`
    : value;
}

function formatBrlNumber(cents: number): string {
  // Formato BR pra Excel: 1234.56 → "1.234,56"
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPaidAt(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string; month: string }> }
) {
  await requireAdmin();
  const { year, month } = await params;
  const y = Number(year);
  const m = Number(month);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) notFound();

  const statusParam = request.nextUrl.searchParams.get("status");
  const filter =
    statusParam === "pending" || statusParam === "paid" ? statusParam : "all";

  const all = await getCashbacksForMonth(y, m);
  const rows =
    filter === "pending"
      ? all.filter((r) => !r.isPaid)
      : filter === "paid"
        ? all.filter((r) => r.isPaid)
        : all;

  const headers = ["Nome", "Loja", "Chave Pix", "Valor total", "Status"];
  const lines: string[] = [headers.join(";")];

  for (const r of rows) {
    const nome = r.isManager ? `${r.clerkName} (gerente)` : r.clerkName;
    const status = r.isPaid
      ? `Pago${r.paidAt ? ` em ${formatPaidAt(r.paidAt)}` : ""}`
      : "Aguardando pagamento";
    lines.push(
      [
        nome,
        r.storeName,
        r.clerkPixKey ?? "",
        formatBrlNumber(r.amountCents),
        status,
      ]
        .map(escapeCsv)
        .join(";")
    );
  }

  const csv = "\uFEFF" + lines.join("\r\n") + "\r\n";

  const mName = monthName(m);
  const monthCapitalized =
    mName.charAt(0).toUpperCase() + mName.slice(1);
  const filename = `Cashback - ${monthCapitalized} ${y}.csv`;
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, "_");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
