import type { ReactNode } from "react";
import { ArrowLeftIcon, CardIcon, CashIcon, QrIcon } from "@/components/icons";
import { PAYMENT_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import type { PaymentMethod } from "@/types";

interface PaymentMethodScreenProps {
  total: number;
  onSelect: (method: PaymentMethod) => void;
  onBack: () => void;
}

const OPTIONS: { method: PaymentMethod; description: string; icon: ReactNode; tone: string }[] = [
  {
    method: "CASH",
    description: "Enter the amount you are paying. Change is computed for you.",
    icon: <CashIcon size={44} />,
    tone: "bg-[#e4f1e7] text-[#2d6a4f]",
  },
  {
    method: "QR",
    description: "Scan with a supported e-wallet or banking app.",
    icon: <QrIcon size={44} />,
    tone: "bg-[#fff1cc] text-[#5c2c06]",
  },
  {
    method: "CARD",
    description: "Tap, insert, or swipe your card at the reader.",
    icon: <CardIcon size={44} />,
    tone: "bg-[#fde4d0] text-[#e85d04]",
  },
];

export function PaymentMethodScreen({ total, onSelect, onBack }: PaymentMethodScreenProps) {
  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Payment Method</h1>
          <p className="mt-1 text-ink-muted">How would you like to pay? Tap one of the options below.</p>
        </div>
        <div className="card px-5 py-3 text-right">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Amount Due</p>
          <p className="text-4xl font-extrabold tabular-nums text-accent-dark" data-testid="amount-due">
            {formatMoney(total)}
          </p>
        </div>
      </div>

      <ul className="mt-6 grid gap-5 md:grid-cols-3">
        {OPTIONS.map(({ method, description, icon, tone }) => (
          <li key={method} className="flex">
            <button
              type="button"
              onClick={() => onSelect(method)}
              className="card flex min-h-[260px] w-full flex-col items-center justify-center gap-3 p-6 text-center transition duration-150 hover:border-accent active:scale-[0.97]"
            >
              <span className={`flex h-24 w-24 items-center justify-center rounded-full ${tone}`}>{icon}</span>
              <span className="text-2xl font-extrabold">{PAYMENT_LABELS[method]}</span>
              <span className="text-ink-muted">{description}</span>
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="btn-secondary mt-6" onClick={onBack}>
        <ArrowLeftIcon size={22} /> Back to Order
      </button>
    </div>
  );
}
