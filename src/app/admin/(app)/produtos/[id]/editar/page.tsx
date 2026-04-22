import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { buttonSecondary, eyebrow } from "@/lib/ui";
import { EditProductForm } from "./edit-product-form";

export const metadata = { title: "Editar produto — Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();
  const [product] = await db
    .select({ id: products.id, name: products.name, points: products.points })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className={eyebrow}>Edição</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Editar produto
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{product.name}</p>
        </div>
        <Link href="/admin/produtos" className={buttonSecondary}>
          Cancelar
        </Link>
      </div>
      <EditProductForm id={product.id} name={product.name} points={product.points} />
    </div>
  );
}
