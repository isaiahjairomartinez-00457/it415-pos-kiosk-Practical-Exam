import { KioskApp } from "@/components/KioskApp";
import { prisma } from "@/lib/prisma";
import type { ProductDTO } from "@/types";

// Products come from MySQL on every request, so price changes show up immediately.
export const dynamic = "force-dynamic";

async function loadProducts(): Promise<ProductDTO[] | null> {
  try {
    const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
    return products.map(({ id, name, price, category, icon }) => ({ id, name, price, category, icon }));
  } catch (error) {
    console.error("Could not load products:", error);
    return null;
  }
}

export default async function HomePage() {
  const products = await loadProducts();

  if (!products || products.length === 0) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6">
        <div className="card max-w-lg p-8 text-center" role="alert">
          <h1 className="text-2xl font-extrabold">Kiosk is not ready</h1>
          <p className="mt-3 text-ink-muted">
            {products
              ? "No products were found. Run `npx prisma db seed` to add them."
              : "The database could not be reached. Start MySQL in XAMPP, check DATABASE_URL in .env, then run `npx prisma migrate dev` and `npx prisma db seed`."}
          </p>
        </div>
      </main>
    );
  }

  return <KioskApp products={products} />;
}
