import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { administrators, clerks, stores } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export type ClerkUser = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  rg: string | null;
  phone: string | null;
  birthDate: string | null;
  pixKey: string | null;
  storeId: number;
  storeName: string;
  storeCnpj: string;
  isManager: boolean;
  isApproved: boolean;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
};

export const getCurrentClerk = cache(async (): Promise<ClerkUser | null> => {
  const session = await getSession();
  if (!session || session.kind !== "clerk") return null;

  const [row] = await db
    .select({
      id: clerks.id,
      name: clerks.name,
      email: clerks.email,
      cpf: clerks.cpf,
      rg: clerks.rg,
      phone: clerks.phone,
      birthDate: clerks.birthDate,
      pixKey: clerks.pixKey,
      storeId: clerks.storeId,
      isManager: clerks.isManager,
      isApproved: clerks.isApproved,
      storeName: stores.name,
      storeCnpj: stores.cnpj,
    })
    .from(clerks)
    .innerJoin(stores, eq(stores.id, clerks.storeId))
    .where(eq(clerks.id, session.id))
    .limit(1);

  return row ?? null;
});

export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  const session = await getSession();
  if (!session || session.kind !== "admin") return null;
  const [row] = await db
    .select({
      id: administrators.id,
      name: administrators.name,
      email: administrators.email,
    })
    .from(administrators)
    .where(eq(administrators.id, session.id))
    .limit(1);
  return row ?? null;
});

export async function requireClerk(): Promise<ClerkUser> {
  const clerk = await getCurrentClerk();
  if (!clerk) redirect("/login");
  if (!clerk.isApproved) redirect("/cadastro/pendente");
  return clerk;
}

export async function requireManager(): Promise<ClerkUser> {
  const clerk = await requireClerk();
  if (!clerk.isManager) redirect("/painel");
  return clerk;
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
