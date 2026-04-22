import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  legalName: text("legal_name"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipcode: text("zipcode"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const clerks = pgTable(
  "clerks",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    cpf: text("cpf").notNull().unique(),
    rg: text("rg"),
    phone: text("phone"),
    birthDate: date("birth_date", { mode: "string" }),
    passwordHash: text("password_hash").notNull(),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    isManager: boolean("is_manager").notNull().default(false),
    isApproved: boolean("is_approved").notNull().default(false),
    pixKey: text("pix_key"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("clerks_store_id_idx").on(t.storeId)]
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    points: integer("points").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [check("products_points_non_negative", sql`${t.points} >= 0`)]
);

export const sales = pgTable(
  "sales",
  {
    id: serial("id").primaryKey(),
    clerkId: integer("clerk_id")
      .notNull()
      .references(() => clerks.id, { onDelete: "cascade" }),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    createdById: integer("created_by_id")
      .notNull()
      .references(() => clerks.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("sales_clerk_id_idx").on(t.clerkId),
    index("sales_store_id_idx").on(t.storeId),
    index("sales_created_at_idx").on(t.createdAt),
  ]
);

export const saleItems = pgTable(
  "sale_items",
  {
    id: serial("id").primaryKey(),
    saleId: integer("sale_id")
      .notNull()
      .references(() => sales.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    pointsEach: integer("points_each").notNull(),
  },
  (t) => [
    index("sale_items_sale_id_idx").on(t.saleId),
    check("sale_items_quantity_positive", sql`${t.quantity} > 0`),
    check("sale_items_points_each_non_negative", sql`${t.pointsEach} >= 0`),
  ]
);

export const administrators = pgTable("administrators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const cashbackPayments = pgTable(
  "cashback_payments",
  {
    id: serial("id").primaryKey(),
    clerkId: integer("clerk_id")
      .notNull()
      .references(() => clerks.id, { onDelete: "cascade" }),
    periodYear: integer("period_year").notNull(),
    periodMonth: integer("period_month").notNull(),
    amountCents: integer("amount_cents").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("cashback_payments_clerk_period_unique").on(
      t.clerkId,
      t.periodYear,
      t.periodMonth
    ),
    index("cashback_payments_clerk_idx").on(t.clerkId),
    check(
      "cashback_payments_month_valid",
      sql`${t.periodMonth} BETWEEN 1 AND 12`
    ),
  ]
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: serial("id").primaryKey(),
    tokenHash: text("token_hash").notNull().unique(),
    userKind: text("user_kind").notNull(),
    userId: integer("user_id").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("password_reset_tokens_user_idx").on(t.userKind, t.userId),
    index("password_reset_tokens_expires_idx").on(t.expiresAt),
    check(
      "password_reset_tokens_user_kind",
      sql`${t.userKind} IN ('clerk', 'admin')`
    ),
  ]
);

// Relations (para queries com joins e eager loading)
export const storesRelations = relations(stores, ({ many }) => ({
  clerks: many(clerks),
  sales: many(sales),
}));

export const clerksRelations = relations(clerks, ({ one, many }) => ({
  store: one(stores, { fields: [clerks.storeId], references: [stores.id] }),
  sales: many(sales, { relationName: "sales_by_clerk" }),
  salesCreated: many(sales, { relationName: "sales_created_by" }),
  cashbackPayments: many(cashbackPayments),
}));

export const productsRelations = relations(products, ({ many }) => ({
  saleItems: many(saleItems),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  clerk: one(clerks, {
    fields: [sales.clerkId],
    references: [clerks.id],
    relationName: "sales_by_clerk",
  }),
  store: one(stores, { fields: [sales.storeId], references: [stores.id] }),
  createdBy: one(clerks, {
    fields: [sales.createdById],
    references: [clerks.id],
    relationName: "sales_created_by",
  }),
  items: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, { fields: [saleItems.saleId], references: [sales.id] }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));

export const cashbackPaymentsRelations = relations(
  cashbackPayments,
  ({ one }) => ({
    clerk: one(clerks, {
      fields: [cashbackPayments.clerkId],
      references: [clerks.id],
    }),
  })
);

export type Store = typeof stores.$inferSelect;
export type Clerk = typeof clerks.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type SaleItem = typeof saleItems.$inferSelect;
export type Administrator = typeof administrators.$inferSelect;
export type CashbackPayment = typeof cashbackPayments.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
