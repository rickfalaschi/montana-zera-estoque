CREATE TABLE "administrators" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "administrators_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cashback_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" integer NOT NULL,
	"period_year" integer NOT NULL,
	"period_month" integer NOT NULL,
	"amount_cents" integer NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cashback_payments_clerk_period_unique" UNIQUE("clerk_id","period_year","period_month"),
	CONSTRAINT "cashback_payments_month_valid" CHECK ("cashback_payments"."period_month" BETWEEN 1 AND 12)
);
--> statement-breakpoint
CREATE TABLE "clerks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"cpf" text NOT NULL,
	"password_hash" text NOT NULL,
	"store_id" integer NOT NULL,
	"is_manager" boolean DEFAULT false NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"pix_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clerks_email_unique" UNIQUE("email"),
	CONSTRAINT "clerks_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"user_kind" text NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "password_reset_tokens_user_kind" CHECK ("password_reset_tokens"."user_kind" IN ('clerk', 'admin'))
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"points" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_points_non_negative" CHECK ("products"."points" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"points_each" integer NOT NULL,
	CONSTRAINT "sale_items_quantity_positive" CHECK ("sale_items"."quantity" > 0),
	CONSTRAINT "sale_items_points_each_non_negative" CHECK ("sale_items"."points_each" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" integer NOT NULL,
	"store_id" integer NOT NULL,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cnpj" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stores_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
ALTER TABLE "cashback_payments" ADD CONSTRAINT "cashback_payments_clerk_id_clerks_id_fk" FOREIGN KEY ("clerk_id") REFERENCES "public"."clerks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clerks" ADD CONSTRAINT "clerks_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_clerk_id_clerks_id_fk" FOREIGN KEY ("clerk_id") REFERENCES "public"."clerks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_created_by_id_clerks_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."clerks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cashback_payments_clerk_idx" ON "cashback_payments" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "clerks_store_id_idx" ON "clerks" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_idx" ON "password_reset_tokens" USING btree ("user_kind","user_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_expires_idx" ON "password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sale_items_sale_id_idx" ON "sale_items" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "sales_clerk_id_idx" ON "sales" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "sales_store_id_idx" ON "sales" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "sales_created_at_idx" ON "sales" USING btree ("created_at");