import { useState } from "react";
import { PRODUCT_TONES, ProductIcon } from "@/components/icons";
import { usePrevious } from "@/lib/hooks";
import { formatMoney } from "@/lib/money";
import { getProductImage } from "@/lib/productImages";
import type { ProductDTO } from "@/types";

interface ProductCardProps {
  product: ProductDTO;
  quantity: number;
  onAdd: (product: ProductDTO) => void;
}

export function ProductCard({ product, quantity, onAdd }: ProductCardProps) {
  const tone = PRODUCT_TONES[product.icon] ?? PRODUCT_TONES.cookie;
  const selected = quantity > 0;
  const previous = usePrevious(quantity);
  const bump = previous !== undefined && quantity > previous ? "animate-bump-up" : "";
  const image = getProductImage(product.name);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onAdd(product)}
      data-selected={selected}
      aria-label={`Add ${product.name}, ${formatMoney(product.price)}${
        selected ? `. ${quantity} in your order` : ""
      }`}
        className={`product-card group relative flex min-h-[56px] flex-col rounded-card border-2 bg-white p-3 text-left shadow-card transition duration-150 ease-out hover:-translate-y-1 hover:shadow-pop active:scale-[0.97] active:shadow-none ${
        selected ? "border-highlight ring-2 ring-highlight/30" : "border-line hover:border-accent"
      }`}
    >
      <span
          className={`product-art relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl ${tone.bg} ${tone.fg} transition-transform duration-200 group-hover:scale-[1.02] group-active:scale-95`}
      >
          <span className="product-art-glow" aria-hidden="true" />
          {!image || imageFailed ? (
            <ProductIcon name={product.icon} size={58} className="product-glyph relative z-10" strokeWidth={2.1} />
          ) : (
            <img
              src={image}
              alt={`${product.name} product photo`}
              loading="lazy"
              className="absolute inset-0 z-10 h-full w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          )}
      </span>

      {selected && (
        <span
          key={quantity}
          className={`absolute right-5 top-5 flex h-9 min-w-9 items-center justify-center rounded-full bg-highlight px-2 text-base font-extrabold text-ink shadow-card ${bump}`}
          aria-hidden="true"
        >
          {quantity}
        </span>
      )}

      <span className="mt-3 flex flex-col px-1">
        <span className="text-lg font-bold leading-tight">{product.name}</span>
        <span className="text-sm text-ink-muted">{product.category}</span>
        <span className="mt-1 text-xl font-extrabold text-accent">{formatMoney(product.price)}</span>
      </span>

      {selected && <span className="sr-only">Selected, quantity {quantity}</span>}
    </button>
  );
}
