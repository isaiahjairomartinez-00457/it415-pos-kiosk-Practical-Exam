import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { cartCount, cartTotal, lineSubtotal } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import type { CartLine, ProductDTO } from "@/types";

interface ReviewScreenProps {
  items: CartLine[];
  products: ProductDTO[];
  onBack: () => void;
  onContinue: () => void;
}

export function ReviewScreen({ items, products, onBack, onContinue }: ReviewScreenProps) {
  const total = cartTotal(items, products);
  const count = cartCount(items);

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
      <h1 className="text-3xl font-extrabold">Review Your Order</h1>
      <p className="mt-1 text-ink-muted">Check your items before paying. Tap Back to make changes — your items stay in the cart.</p>

      <div className="card mt-5 overflow-hidden">
        <table className="w-full text-left">
          <caption className="sr-only">Order summary</caption>
          <thead className="bg-slate-50 text-sm uppercase tracking-wide text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-3 sm:px-6">Product</th>
              <th scope="col" className="px-2 py-3 text-center sm:px-4">Quantity</th>
              <th scope="col" className="px-2 py-3 text-right sm:px-4">Unit Price</th>
              <th scope="col" className="px-4 py-3 text-right sm:px-6">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-lg">
            {items.map((line) => {
              const product = products.find((p) => p.id === line.productId);
              if (!product) return null;
              return (
                <tr key={line.productId}>
                  <th scope="row" className="px-4 py-4 font-bold sm:px-6">{product.name}</th>
                  <td className="px-2 py-4 text-center tabular-nums sm:px-4">{line.quantity}</td>
                  <td className="px-2 py-4 text-right tabular-nums sm:px-4">{formatMoney(product.price)}</td>
                  <td className="px-4 py-4 text-right font-bold tabular-nums sm:px-6">
                    {formatMoney(lineSubtotal(product.price, line.quantity))}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-ink bg-slate-50">
              <th scope="row" colSpan={3} className="px-4 py-5 text-lg sm:px-6">
                Total Amount <span className="ml-2 text-base font-normal text-ink-muted">{count} {count === 1 ? "item" : "items"}</span>
              </th>
              <td className="px-4 py-5 text-right text-3xl font-extrabold tabular-nums sm:px-6" data-testid="review-total">
                {formatMoney(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" className="btn-secondary sm:min-w-[200px]" onClick={onBack}>
          <ArrowLeftIcon size={22} /> Back
        </button>
        <button type="button" className="btn-primary sm:min-w-[300px]" onClick={onContinue} disabled={items.length === 0}>
          Continue to Payment <ArrowRightIcon size={22} />
        </button>
      </div>
    </div>
  );
}
