import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { cashbackPayments, clerks, saleItems, sales, stores } from "@/lib/db/schema";

// Taxa do bônus de gerência: 5% sobre TODAS as vendas da loja (inclusive as do próprio gerente).
// Em centavos: 5% de (points * 100) = points * 5.
export const MANAGER_BONUS_RATE = 0.05;
export const MANAGER_BONUS_CENTS_PER_POINT = 5;

export type MonthlyCashback = {
  year: number;
  month: number;
  points: number;          // pontos próprios
  ownCents: number;        // cashback dos pontos próprios
  teamPoints: number;      // pontos da equipe (balconistas não-gerentes da loja), 0 se não for gerente
  bonusCents: number;      // bônus de gerência (5% do cashback da equipe)
  amountCents: number;     // total = ownCents + bonusCents
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
  const [clerk] = await db
    .select({
      id: clerks.id,
      isManager: clerks.isManager,
      storeId: clerks.storeId,
    })
    .from(clerks)
    .where(eq(clerks.id, clerkId))
    .limit(1);
  if (!clerk) return [];

  const now = new Date();
  const cur = ymOfNow(now);

  const yearExpr = sql<number>`EXTRACT(YEAR FROM ${sales.createdAt})::int`;
  const monthExpr = sql<number>`EXTRACT(MONTH FROM ${sales.createdAt})::int`;
  const pointsExpr = sql<number>`SUM(${saleItems.quantity} * ${saleItems.pointsEach})::int`;

  const ownRows = await db
    .select({ year: yearExpr, month: monthExpr, points: pointsExpr })
    .from(sales)
    .innerJoin(saleItems, eq(saleItems.saleId, sales.id))
    .where(eq(sales.clerkId, clerkId))
    .groupBy(yearExpr, monthExpr);

  const ownByMonth = new Map<string, number>();
  for (const r of ownRows) {
    ownByMonth.set(`${r.year}-${r.month}`, r.points);
  }

  const teamByMonth = new Map<string, number>();
  if (clerk.isManager) {
    // Pool do bônus = TODAS as vendas da loja (inclusive as do próprio gerente).
    const teamRows = await db
      .select({ year: yearExpr, month: monthExpr, points: pointsExpr })
      .from(sales)
      .innerJoin(saleItems, eq(saleItems.saleId, sales.id))
      .where(eq(sales.storeId, clerk.storeId))
      .groupBy(yearExpr, monthExpr);
    for (const r of teamRows) {
      teamByMonth.set(`${r.year}-${r.month}`, r.points);
    }
  }

  const allKeys = new Set<string>([
    ...ownByMonth.keys(),
    ...teamByMonth.keys(),
  ]);

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

  const result: MonthlyCashback[] = [];
  for (const key of allKeys) {
    const [year, month] = key.split("-").map(Number);
    const ownPoints = ownByMonth.get(key) ?? 0;
    const teamPoints = teamByMonth.get(key) ?? 0;
    const ownCents = ownPoints * 100;
    const bonusCents = teamPoints * MANAGER_BONUS_CENTS_PER_POINT;
    const amountCents = ownCents + bonusCents;
    const paid = paidMap.get(key);
    const isCurrent = year === cur.year && month === cur.month;
    result.push({
      year,
      month,
      points: ownPoints,
      ownCents,
      teamPoints,
      bonusCents,
      amountCents,
      isClosed: !isCurrent && isBeforeCurrentMonth(year, month, now),
      isPaid: !!paid,
      paidAt: paid?.paidAt ?? null,
    });
  }

  result.sort((a, b) =>
    a.year !== b.year ? b.year - a.year : b.month - a.month
  );
  return result;
}

export type AdminCashback = MonthlyCashback & {
  clerkId: number;
  clerkName: string;
  clerkCpf: string;
  clerkPixKey: string | null;
  isManager: boolean;
  storeName: string;
};

export async function getAllCashbacks(): Promise<AdminCashback[]> {
  const now = new Date();
  const cur = ymOfNow(now);

  const yearExpr = sql<number>`EXTRACT(YEAR FROM ${sales.createdAt})::int`;
  const monthExpr = sql<number>`EXTRACT(MONTH FROM ${sales.createdAt})::int`;
  const pointsExpr = sql<number>`SUM(${saleItems.quantity} * ${saleItems.pointsEach})::int`;

  // Vendas próprias por balconista por mês
  const ownRows = await db
    .select({
      clerkId: sales.clerkId,
      clerkName: clerks.name,
      clerkCpf: clerks.cpf,
      clerkPixKey: clerks.pixKey,
      isManager: clerks.isManager,
      storeId: clerks.storeId,
      storeName: stores.name,
      year: yearExpr,
      month: monthExpr,
      points: pointsExpr,
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
      clerks.isManager,
      clerks.storeId,
      stores.name,
      yearExpr,
      monthExpr
    );

  // Pool do bônus por loja por mês = TODAS as vendas da loja (inclusive do próprio gerente).
  const teamPoolRows = await db
    .select({
      storeId: sales.storeId,
      year: yearExpr,
      month: monthExpr,
      points: pointsExpr,
    })
    .from(sales)
    .innerJoin(saleItems, eq(saleItems.saleId, sales.id))
    .groupBy(sales.storeId, yearExpr, monthExpr);

  const teamPool = new Map<string, number>();
  for (const r of teamPoolRows) {
    teamPool.set(`${r.storeId}-${r.year}-${r.month}`, r.points);
  }

  // Todos os gerentes (pra garantir que apareçam mesmo sem vendas próprias)
  const managers = await db
    .select({
      clerkId: clerks.id,
      clerkName: clerks.name,
      clerkCpf: clerks.cpf,
      clerkPixKey: clerks.pixKey,
      storeId: clerks.storeId,
      storeName: stores.name,
    })
    .from(clerks)
    .innerJoin(stores, eq(stores.id, clerks.storeId))
    .where(eq(clerks.isManager, true));

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

  type Row = Omit<AdminCashback, "isClosed" | "isPaid" | "paidAt" | "amountCents"> & {
    storeId: number;
  };
  const resultMap = new Map<string, Row>();

  // 1. Linhas baseadas em vendas próprias
  for (const r of ownRows) {
    const key = `${r.clerkId}-${r.year}-${r.month}`;
    resultMap.set(key, {
      clerkId: r.clerkId,
      clerkName: r.clerkName,
      clerkCpf: r.clerkCpf,
      clerkPixKey: r.clerkPixKey,
      isManager: r.isManager,
      storeId: r.storeId,
      storeName: r.storeName,
      year: r.year,
      month: r.month,
      points: r.points,
      ownCents: r.points * 100,
      teamPoints: 0,
      bonusCents: 0,
    });
  }

  // 2. Pra cada gerente, garante linha em todo mês em que a equipe vendeu
  for (const mgr of managers) {
    for (const [poolKey, teamPoints] of teamPool) {
      const parts = poolKey.split("-");
      const poolStoreId = Number(parts[0]);
      const poolYear = Number(parts[1]);
      const poolMonth = Number(parts[2]);
      if (poolStoreId !== mgr.storeId) continue;

      const key = `${mgr.clerkId}-${poolYear}-${poolMonth}`;
      const existing = resultMap.get(key);
      if (existing) {
        existing.teamPoints = teamPoints;
        existing.bonusCents = teamPoints * MANAGER_BONUS_CENTS_PER_POINT;
      } else {
        resultMap.set(key, {
          clerkId: mgr.clerkId,
          clerkName: mgr.clerkName,
          clerkCpf: mgr.clerkCpf,
          clerkPixKey: mgr.clerkPixKey,
          isManager: true,
          storeId: mgr.storeId,
          storeName: mgr.storeName,
          year: poolYear,
          month: poolMonth,
          points: 0,
          ownCents: 0,
          teamPoints,
          bonusCents: teamPoints * MANAGER_BONUS_CENTS_PER_POINT,
        });
      }
    }
  }

  const finalResult: AdminCashback[] = [];
  for (const [key, row] of resultMap) {
    const amountCents = row.ownCents + row.bonusCents;
    const paid = paidMap.get(key);
    const isCurrent = row.year === cur.year && row.month === cur.month;
    finalResult.push({
      clerkId: row.clerkId,
      clerkName: row.clerkName,
      clerkCpf: row.clerkCpf,
      clerkPixKey: row.clerkPixKey,
      isManager: row.isManager,
      storeName: row.storeName,
      year: row.year,
      month: row.month,
      points: row.points,
      ownCents: row.ownCents,
      teamPoints: row.teamPoints,
      bonusCents: row.bonusCents,
      amountCents,
      isClosed: !isCurrent && isBeforeCurrentMonth(row.year, row.month, now),
      isPaid: !!paid,
      paidAt: paid?.paidAt ?? null,
    });
  }

  finalResult.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.month !== b.month) return b.month - a.month;
    return a.clerkName.localeCompare(b.clerkName);
  });
  return finalResult;
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

// `asc` mantido pra caso outro módulo importe via re-export
void asc;
