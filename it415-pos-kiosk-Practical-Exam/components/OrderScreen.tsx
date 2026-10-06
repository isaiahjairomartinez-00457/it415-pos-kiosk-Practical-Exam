import { OrderPanel } from "@/components/OrderPanel";
import { MenuSidebar } from "@/components/MenuSidebar";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/constants";
import type { CartLine, ProductDTO } from "@/types";

interface OrderScreenProps {
  products: ProductDTO[];
  items: CartLine[];
  category: string;
  onCategory: (category: string) => void;
  onAdd: (product: ProductDTO) => void;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
  onRemove: (productId: number) => void;
  onProceed: () => void;
}

export function OrderScreen({ products, items, category, onCategory, onAdd, ...panel }: OrderScreenProps) {
  const visible = category === "All" ? products : products.filter((p) => p.category === category);
  const quantities = new Map(items.map((line) => [line.productId, line.quantity]));

  return (
    <div className="surface-grid mx-auto grid w-full max-w-[1500px] flex-1 gap-5 p-4 sm:p-6 lg:min-h-0 lg:grid-cols-[190px_minmax(0,1fr)_360px] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
      <MenuSidebar activeCategory={category} onCategory={onCategory} />
      <section aria-labelledby="catalog-heading" className="flex min-h-0 flex-col lg:overflow-y-auto lg:pr-1">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1 text-sm font-bold uppercase tracking-[0.16em] text-accent-dark">MANG INASAL MENU</p>
            <h1 id="catalog-heading" className="text-3xl font-extrabold tracking-tight">Choose your favorites</h1>
          </div>
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            {CATEGORIES.map((name) => {
              const active = name === category;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onCategory(name)}
                  aria-pressed={active}
                  className={`min-h-[56px] rounded-full border-2 px-6 text-base font-bold transition duration-150 active:scale-95 ${
                    active ? "border-highlight bg-highlight text-ink shadow-md" : "border-line bg-cream text-ink shadow-sm hover:border-accent hover:bg-[#fff1d0]"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <ul className="product-grid grid grid-cols-2 gap-4 pb-2 md:grid-cols-3" data-testid="product-grid">
          {visible.map((product) => (
            <li key={product.id} className="flex">
              <div className="flex w-full flex-col [&>button]:flex-1">
                <ProductCard
                  product={product}
                  quantity={quantities.get(product.id) ?? 0}
                  onAdd={onAdd}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <OrderPanel items={items} products={products} {...panel} />
    </div>
  );
}
