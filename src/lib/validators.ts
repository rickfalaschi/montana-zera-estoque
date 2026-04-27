import * as z from "zod";
import { onlyDigits } from "@/lib/format";

const cpfSchema = z
  .string()
  .transform((v) => onlyDigits(v))
  .refine((v) => v.length === 11, { message: "CPF deve ter 11 dígitos" });

const cnpjSchema = z
  .string()
  .transform((v) => onlyDigits(v))
  .refine((v) => v.length === 14, { message: "CNPJ deve ter 14 dígitos" });

const phoneSchema = z
  .string()
  .transform((v) => onlyDigits(v))
  .refine((v) => v.length === 10 || v.length === 11, {
    message: "Telefone deve ter 10 ou 11 dígitos (com DDD)",
  });

const cepSchema = z
  .string()
  .transform((v) => onlyDigits(v))
  .refine((v) => v.length === 8, { message: "CEP deve ter 8 dígitos" });

const ufSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .refine((v) => /^[A-Z]{2}$/.test(v), {
    message: "UF deve ter 2 letras (ex: SP, RJ)",
  });

const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data de nascimento")
  .refine(
    (v) => {
      const d = new Date(`${v}T00:00:00`);
      if (Number.isNaN(d.getTime())) return false;
      const now = new Date();
      if (d > now) return false;
      const ageYears =
        (now.getTime() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return ageYears >= 14 && ageYears <= 110;
    },
    { message: "Data de nascimento inválida (idade entre 14 e 110 anos)" }
  );

export const clerkSignupSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome"),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  cpf: cpfSchema,
  rg: z.string().trim().min(4, "Informe o RG").max(30, "RG muito longo"),
  phone: phoneSchema,
  birthDate: birthDateSchema,
  storeCnpj: cnpjSchema,
  password: z.string().min(6, "Senha com no mínimo 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const storeCreateSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome fantasia"),
  legalName: z.string().trim().min(2, "Informe a razão social"),
  cnpj: cnpjSchema,
  address: z.string().trim().min(5, "Informe o endereço"),
  city: z.string().trim().min(2, "Informe a cidade"),
  state: ufSchema,
  zipcode: cepSchema,
  phone: phoneSchema,
  managerName: z.string().trim().min(2, "Informe o nome do gerente"),
  managerEmail: z.string().trim().toLowerCase().email("Email inválido"),
  managerCpf: cpfSchema,
  managerPassword: z.string().min(6, "Senha com no mínimo 6 caracteres"),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome"),
  points: z.coerce
    .number()
    .min(0, "Pontos devem ser positivos")
    .refine((v) => Math.round(v * 2) === v * 2, {
      message: "Use múltiplos de 0,5 (ex: 1, 1.5, 2, 2.5)",
    }),
  active: z.coerce.boolean().optional(),
});

export const saleItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
});

export const saleSchema = z.object({
  clerkId: z.coerce.number().int().positive(),
  items: z.array(saleItemSchema).min(1, "Adicione ao menos um item"),
});

export const profileUpdateSchema = z.object({
  pixKey: z
    .string()
    .trim()
    .max(140, "Chave Pix muito longa")
    .optional()
    .or(z.literal("")),
});

export const clerkUpdateSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome"),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  cpf: cpfSchema,
  rg: z
    .string()
    .trim()
    .max(30, "RG muito longo")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  birthDate: z.string().trim().optional().or(z.literal("")),
});

export const storeUpdateSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome fantasia"),
  cnpj: cnpjSchema,
  legalName: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  state: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .optional()
    .or(z.literal("")),
  zipcode: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
});

export const adminCreateSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome"),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(6, "Senha com no mínimo 6 caracteres"),
});

export type ClerkSignupInput = z.infer<typeof clerkSignupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type StoreCreateInput = z.infer<typeof storeCreateSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ClerkUpdateInput = z.infer<typeof clerkUpdateSchema>;
export type StoreUpdateInput = z.infer<typeof storeUpdateSchema>;
export type AdminCreateInput = z.infer<typeof adminCreateSchema>;
