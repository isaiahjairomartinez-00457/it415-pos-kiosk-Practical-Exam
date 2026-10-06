import { KioskApp } from "@/components/KioskApp";
import { getProducts } from "@/lib/database";
import type { ProductDTO } from "@/types";

// Products come from data/kiosk.json on every request.
export const dynamic = "force-dynamic";

async function loadProducts(): Promise<ProductDTO[] | null> {
  try {
    return await getProducts();
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
              ? "No menu products were found in data/kiosk.json. Add products to that file and reload."
              : "Could not read data/kiosk.json. Make sure the file exists under the project data/ folder."}
          </p>
        </div>
      </main>
    );
  }

  return <KioskApp products={products} />;
}
