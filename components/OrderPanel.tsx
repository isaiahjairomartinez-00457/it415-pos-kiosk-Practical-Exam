"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRightIcon, CartIcon, MinusIcon, PlusIcon, ProductIcon, TrashIcon } from "@/components/icons";
import { cartCount, cartTotal, lineSubtotal } from "@/lib/cart";
import { useAnimatedNumber, usePrefersReducedMotion, usePrevious } from "@/lib/hooks";
import { CENTAVOS_PER_PESO, formatMoney } from "@/lib/money";
import { getProductImage } from "@/lib/productImages";
import type { CartLine, ProductDTO } from "@/types";

interface OrderPanelProps {
  items: CartLine[];
  products: ProductDTO[];
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
  onRemove: (productId: number) => void;
  onProceed: () => void;
}

const EXIT_MS = 200;

export function OrderPanel({ items, products, onIncrement, onDecrement, onRemove, onProceed }: OrderPanelProps) {
  const reduced = usePrefersReducedMotion();
  const [leaving, setLeaving] = useState<number[]>([]);
  const timers = useRef(new Set<number>());

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => pendingTimers.forEach((id) => window.clearTimeout(id));
  }, []);

  /** Plays the exit animation, then performs the real removal. */
  function leaveThen(productId: number, action: (id: number) => void) {
    if (reduced) return action(productId);
    if (leaving.includes(productId)) return;
    setLeaving((ids) => [...ids, productId]);
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      action(productId);
      setLeaving((ids) => ids.filter((id) => id !== productId));
    }, EXIT_MS);
    timers.current.add(timer);
  }

  const count = cartCount(items);
  const total = cartTotal(items, products);
  const shownTotalPesos = useAnimatedNumber(Math.round(total / CENTAVOS_PER_PESO));
  const productsById = new Map(products.map((product) => [product.id, product]));

  return (
    <section aria-labelledby="order-heading" className="flex min-h-0 flex-col overflow-hidden rounded-card border border-line bg-white shadow-card lg:h-full">
      <div className="flex items-baseline justify-between border-b border-line bg-slate-50/80 px-5 pb-3 pt-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-dark">Order summary</p>
          <h2 id="order-heading" className="mt-0.5 text-2xl font-extrabold">Your Order</h2>
        </div>
        <p className="text-base font-semibold text-ink-muted" aria-live="polite">
          Items: <span className="text-ink">{count}</span>
        </p>
      </div>

      <div className="min-h-[220px] flex-1 overflow-y-auto px-5 pb-3 lg:min-h-0">
        {items.length === 0 ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line p-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-ink-muted">
              <CartIcon size={30} />
            </span>
            <p className="mt-4 text-lg font-bold">Your cart is empty.</p>
            <p className="mt-1 text-ink-muted">Add products to begin your order.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((line) => {
              const product = productsById.get(line.productId);
              if (!product) return null;
              return (
                <CartRow
                  key={line.productId}
                  product={product}
                  quantity={line.quantity}
                  leaving={leaving.includes(line.productId)}
                  onIncrement={() => onIncrement(line.productId)}
                  onDecrement={() =>
                    line.quantity === 1 ? leaveThen(line.productId, onDecrement) : onDecrement(line.productId)
                  }
                  onRemove={() => leaveThen(line.productId, onRemove)}
                />
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-dashed border-slate-300 bg-slate-50/70 px-5 pb-5 pt-4">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-lg font-bold">Total:</span>
          <span className="text-4xl font-extrabold tabular-nums" data-testid="order-total">
            {formatMoney(shownTotalPesos * CENTAVOS_PER_PESO)}
          </span>
        </div>
        <button type="button" className="btn-primary w-full" disabled={items.length === 0} onClick={onProceed}>
          Proceed to Review <ArrowRightIcon size={22} />
        </button>
      </div>
    </section>
  );
}

interface CartRowProps {
  product: ProductDTO;
  quantity: number;
  leaving: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

function CartRow({ product, quantity, leaving, onIncrement, onDecrement, onRemove }: CartRowProps) {
  const previous = usePrevious(quantity);
  const bump =
    previous === undefined ? "" : quantity > previous ? "animate-bump-up" : "animate-bump-down";
  const image = getProductImage(product.name);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <li
      className={`rounded-2xl border border-line bg-white p-3 ${leaving ? "animate-item-out" : "animate-item-in"}`}
      data-testid={`cart-item-${product.name}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#ffe8bd] text-[#5c2c06]">
            {!image || imageFailed ? (
              <ProductIcon name={product.icon} size={28} />
            ) : (
              <Image
                src={image}
                alt={`${product.name} product photo`}
                fill
                sizes="56px"
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setImageFailed(true)}
              />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-tight">{product.name}</p>
            <p className="text-sm text-ink-muted">{formatMoney(product.price)} each</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${product.name}`}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger transition active:scale-95"
        >
          <TrashIcon size={24} />
        </button>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDecrement}
            aria-label={`Decrease ${product.name} quantity`}
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-ink transition active:scale-95"
          >
            <MinusIcon size={22} />
          </button>
          <span
            key={quantity}
            className={`w-12 text-center text-2xl font-extrabold tabular-nums ${bump}`}
            aria-label={`${product.name} quantity ${quantity}`}
            role="status"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={onIncrement}
            aria-label={`Increase ${product.name} quantity`}
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-accent-dark active:scale-95"
          >
            <PlusIcon size={22} />
          </button>
        </div>
        <p className="text-xl font-extrabold tabular-nums">{formatMoney(lineSubtotal(product.price, quantity))}</p>
      </div>
    </li>
  );
}
