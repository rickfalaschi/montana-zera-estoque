import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { cashbackPayments, clerks, saleItems, sales, stores } from "@/lib/db/schema";

export type MonthlyCashback = {
  year: number;
  month: number;
  points: number;
  amountCents: number;
  isClosed: boolean;
  isPaid: boolean;
  paidAt: Date | null;
};

function ymOfNow(now = new Date()): { year: number; month: number } {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function isBeforeCurrentMonth(
  year: number,
  month: number,
  now = new Date()
): boolean {
  const cur = ymOfNow(now);
  return year < cur.year || (year === cur.year && month < cur.month);
}

export async function getClerkCashbacks(
  clerkId: number
): Promise<MonthlyCashback[]> {
  const now = new Date();
  const cur = ymOfNow(now);

  const year = sql<number>`EXTRACT(YEAR FROM ${sales.createdAt})::int`;
  const month = sql<number>`EXTRACT(MONTH FROM ${sales.createdAt})::int`;
  const points = sql<number>`SUM(${saleItems.quantity} * ${saleItems.pointsEach})::int`;

  const saleRows = await db
    .select({ year, month, points })
    .from(sales)
    .innerJoin(saleItems, eq(saleItems.saleId, sales.id))
    .where(eq(sales.clerkId, clerkId))
    .groupBy(year, month)
    .orderBy(desc(year), desc(month));

  const payRows = await db
    .select({
      year: cashbackPayments.periodYear,
      month: cashbackPayments.periodMonth,
      amountCents: cashbackPayments.amountCents,
      paidAt: cashbackPayments.paidAt,
    })
    .from(cashbackPayments)
    .where(eq(cashbackPayments.clerkId, clerkId));

  const paidMap = new Map<string, { amountCents: number; paidAt: Date }>();
  for (const p of payRows) {
    paidMap.set(`${p.year}-${p.month}`, {
      amountCents: p.amountCents,
      paidAt: p.paidAt,
    });
  }

  return saleRows.map((r) => {
    const key = `${r.year}-${r.month}`;
    const paid = paidMap.get(key);
    const isCurrent = r.year === cur.year && r.month === cur.month;
    const amountCents = r.points * 100;
    return {
      year: r.year,
      month: r.month,
      points: r.points,
      amountCents,
      isClosed: !isCurrent && isBeforeCurrentMonth(r.year, r.month, now),
      isPaid: !!paid,
      paidAt: paid?.paidAt ?? null,
    };
  });
}

export type AdminCashback = MonthlyCashback & {
  clerkId: number;
  clerkName: string;
  clerkCpf: string;
  clerkPixKey: string | null;
  storeName: string;
};

export async function getAllCashbacks(): Promise<AdminCashback[]> {
  const now = new Date();
  const cur = ymOfNow(now);

  const year = sql<number>`EXTRACT(YEAR FROM ${sales.createdAt})::int`;
  const month = sql<number>`EXTRACT(MONTH FROM ${sales.createdAt})::int`;
  const points = sql<number>`SUM(${saleItems.quantity} * ${saleItems.pointsEach})::int`;

  const saleRows = await db
    .select({
      clerkId: sales.clerkId,
      clerkName: clerks.name,
      clerkCpf: clerks.cpf,
      clerkPixKey: clerks.pixKey,
      storeName: stores.name,
      year,
      month,
      points,
    })
    .from(sales)
    .innerJoin(saleItems, eq(saleItems.saleId, sales.id))
    .innerJoin(clerks, eq(clerks.id, sales.clerkId))
    .innerJoin(stores, eq(stores.id, clerks.storeId))
    .groupBy(
      sales.clerkId,
      clerks.name,
      clerks.cpf,
      clerks.pixKey,
      stores.name,
      year,
      month
    )
    .orderBy(desc(year), desc(month), asc(clerks.name));

  const payRows = await db
    .select({
      clerkId: cashbackPayments.clerkId,
      year: cashbackPayments.periodYear,
      month: cashbackPayments.periodMonth,
      amountCents: cashbackPayments.amountCents,
      paidAt: cashbackPayments.paidAt,
    })
    .from(cashbackPayments);

  const paidMap = new Map<string, { amountCents: number; paidAt: Date }>();
  for (const p of payRows) {
    paidMap.set(`${p.clerkId}-${p.year}-${p.month}`, {
      amountCents: p.amountCents,
      paidAt: p.paidAt,
    });
  }

  return saleRows.map((r) => {
    const key = `${r.clerkId}-${r.year}-${r.month}`;
    const paid = paidMap.get(key);
    const isCurrent = r.year === cur.year && r.month === cur.month;
    const amountCents = r.points * 100;
    return {
      clerkId: r.clerkId,
      clerkName: r.clerkName,
      clerkCpf: r.clerkCpf,
      clerkPixKey: r.clerkPixKey,
      storeName: r.storeName,
      year: r.year,
      month: r.month,
      points: r.points,
      amountCents,
      isClosed: !isCurrent && isBeforeCurrentMonth(r.year, r.month, now),
      isPaid: !!paid,
      paidAt: paid?.paidAt ?? null,
    };
  });
}

export type MonthlySummary = {
  year: number;
  month: number;
  isCurrent: boolean;
  isClosed: boolean;
  clerkCount: number;
  totalPoints: number;
  totalCents: number;
  paidCount: number;
  paidCents: number;
  pendingCount: number;
  pendingCents: number;
};

export async function getMonthlySummaries(): Promise<MonthlySummary[]> {
  const rows = await getAllCashbacks();
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  const map = new Map<string, MonthlySummary>();
  for (const r of rows) {
    const key = `${r.year}-${r.month}`;
    const existing =
      map.get(key) ??
      ({
        year: r.year,
        month: r.month,
        isCurrent: r.year === cy && r.month === cm,
        isClosed: r.isClosed,
        clerkCount: 0,
        totalPoints: 0,
        totalCents: 0,
        paidCount: 0,
        paidCents: 0,
        pendingCount: 0,
        pendingCents: 0,
      } satisfies MonthlySummary);
    existing.clerkCount += 1;
    existing.totalPoints += r.points;
    existing.totalCents += r.amountCents;
    if (r.isPaid) {
      existing.paidCount += 1;
      existing.paidCents += r.amountCents;
    } else {
      existing.pendingCount += 1;
      existing.pendingCents += r.amountCents;
    }
    map.set(key, existing);
  }
  return Array.from(map.values()).sort((a, b) =>
    a.year !== b.year ? b.year - a.year : b.month - a.month
  );
}

export async function getCashbacksForMonth(
  year: number,
  month: number
): Promise<AdminCashback[]> {
  const all = await getAllCashbacks();
  return all
    .filter((r) => r.year === year && r.month === month)
    .sort((a, b) => a.clerkName.localeCompare(b.clerkName));
}
