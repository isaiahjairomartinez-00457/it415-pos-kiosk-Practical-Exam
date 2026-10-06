import { CheckIcon, ReceiptIcon } from "@/components/icons";
import { PAYMENT_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import type { Receipt } from "@/types";

export function SuccessScreen({ receipt, onViewReceipt }: { receipt: Receipt; onViewReceipt: () => void }) {
  const rows: [string, string, string?][] = [
    ["Transaction No.", receipt.transactionNumber, "font-mono"],
    ["Payment method", PAYMENT_LABELS[receipt.paymentMethod]],
    ["Transaction amount", formatMoney(receipt.totalAmount)],
    ["Amount paid", formatMoney(receipt.amountPaid)],
    ["Change", formatMoney(receipt.changeAmount), "text-success"],
  ];

  return (
    <div className="mx-auto w-full max-w-xl p-4 sm:p-6">
      <div className="card p-6 text-center sm:p-8">
        <div className="animate-pop mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-success text-white" aria-hidden="true">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path className="check-path" d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h1 className="mt-5 text-4xl font-extrabold text-[#2d6a4f]">Payment Successful</h1>
        <p className="mt-1 text-lg text-ink-muted">Transaction completed successfully. Thank you!</p>

        <dl className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line text-left">
          {rows.map(([label, value, extra]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-5 py-3.5 first:bg-slate-50">
              <dt className="text-ink-muted">{label}</dt>
              <dd className={`text-lg font-bold tabular-nums ${extra ?? ""}`}>{value}</dd>
            </div>
          ))}
        </dl>

        <button type="button" className="btn-primary mt-6 w-full" onClick={onViewReceipt}>
          <ReceiptIcon size={24} /> View Receipt
        </button>
        <p className="mt-3 flex items-center justify-center gap-1 text-sm text-ink-muted">
          <CheckIcon size={16} className="text-success" /> Saved to the database
        </p>
      </div>
    </div>
  );
}
