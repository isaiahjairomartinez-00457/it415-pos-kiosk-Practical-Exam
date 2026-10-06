import { PrinterIcon, RefreshIcon } from "@/components/icons";
import { PAYMENT_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import type { Receipt } from "@/types";

interface ReceiptScreenProps {
  receipt: Receipt;
  onNewTransaction: () => void;
}

export function ReceiptScreen({ receipt, onNewTransaction }: ReceiptScreenProps) {
  const created = new Date(receipt.createdAt);
  const date = created.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const time = created.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const statusLabel = receipt.status === "SUCCESS" ? "Payment Successful" : receipt.status;

  const summary: [string, string][] = [
    ["Total", formatMoney(receipt.totalAmount)],
    ["Payment Method", PAYMENT_LABELS[receipt.paymentMethod]],
    ["Amount Paid", formatMoney(receipt.amountPaid)],
    ["Change", formatMoney(receipt.changeAmount)],
  ];

  return (
    <div className="mx-auto w-full max-w-xl p-4 sm:p-6">
      <article
        className="print-area card animate-screen bg-white p-6 sm:p-8"
        aria-labelledby="receipt-heading"
        data-testid="receipt"
      >
        <header className="border-b-2 border-dashed border-slate-300 pb-4 text-center">
          <h1 id="receipt-heading" className="text-2xl font-extrabold tracking-wide">MANG KANOR INASAL</h1>
          <p className="text-ink-muted">Official Digital Receipt</p>
        </header>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-b-2 border-dashed border-slate-300 py-4">
          <dt className="text-ink-muted">Transaction No.</dt>
          <dd className="text-right font-mono font-bold" data-testid="receipt-number">{receipt.transactionNumber}</dd>
          <dt className="text-ink-muted">Date</dt>
          <dd className="text-right font-semibold">{date}</dd>
          <dt className="text-ink-muted">Time</dt>
          <dd className="text-right font-semibold">{time}</dd>
        </dl>

        <table className="w-full border-b-2 border-dashed border-slate-300 text-left">
          <caption className="sr-only">Purchased items</caption>
          <thead className="text-sm text-ink-muted">
            <tr>
              <th scope="col" className="py-3 font-semibold">Item</th>
              <th scope="col" className="py-3 text-center font-semibold">Qty × Price</th>
              <th scope="col" className="py-3 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item) => (
              <tr key={item.productName}>
                <th scope="row" className="py-1.5 font-semibold">{item.productName}</th>
                <td className="py-1.5 text-center tabular-nums">
                  {item.quantity} × {formatMoney(item.unitPrice)}
                </td>
                <td className="py-1.5 text-right font-semibold tabular-nums">{formatMoney(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="space-y-1.5 py-4">
          {summary.map(([label, value]) => (
            <div key={label} className={`flex justify-between ${label === "Total" ? "text-2xl font-extrabold" : "text-lg"}`}>
              <dt className={label === "Total" ? "" : "text-ink-muted"}>{label}</dt>
              <dd className="font-bold tabular-nums">{value}</dd>
            </div>
          ))}
          <div className="flex justify-between pt-1 text-lg">
            <dt className="text-ink-muted">Payment Status</dt>
            <dd className="font-bold text-success">{statusLabel}</dd>
          </div>
        </dl>

        <footer className="border-t-2 border-dashed border-slate-300 pt-4 text-center font-semibold">
          Thank you for your purchase!
        </footer>
      </article>

      <div className="no-print mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" className="btn-secondary" onClick={() => window.print()}>
          <PrinterIcon size={24} /> Print Receipt
        </button>
        <button type="button" className="btn-primary" onClick={onNewTransaction}>
          <RefreshIcon size={24} /> New Transaction
        </button>
      </div>
    </div>
  );
}
