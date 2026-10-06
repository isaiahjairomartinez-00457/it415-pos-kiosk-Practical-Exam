"use client";

import { useState } from "react";
import { AlertIcon, ArrowLeftIcon, BackspaceIcon, CashIcon, SpinnerIcon } from "@/components/icons";
import { MAX_CASH_PESOS } from "@/lib/constants";
import { CENTAVOS_PER_PESO, formatMoney } from "@/lib/money";

interface CashPaymentProps {
  total: number;
  processing: boolean;
  onPay: (amountPaid: number) => Promise<string | null>;
  onChangeMethod: () => void;
}

const QUICK_AMOUNTS = [200, 500, 1000];
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const keyClass =
  "flex min-h-[64px] items-center justify-center rounded-2xl border border-line bg-white text-3xl font-bold shadow-card transition duration-100 active:scale-95 active:bg-slate-100 disabled:opacity-50";

export function CashPayment({ total, processing, onPay, onChangeMethod }: CashPaymentProps) {
  // Amount paid in centavos (integer). The keypad only enters whole pesos.
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const change = Math.max(0, amount - total);
  const short = total - amount;
  const sufficient = amount >= total && amount > 0;

  function edit(next: number) {
    setAmount(next);
    setError(null);
  }

  function pressDigit(digit: string) {
    const pesos = Math.floor(amount / CENTAVOS_PER_PESO);
    const nextPesos = pesos * 10 + Number(digit);
    if (nextPesos > MAX_CASH_PESOS) return;
    edit(nextPesos * CENTAVOS_PER_PESO);
  }

  function backspace() {
    edit(Math.floor(Math.floor(amount / CENTAVOS_PER_PESO) / 10) * CENTAVOS_PER_PESO);
  }

  async function pay() {
    if (processing) return;
    let message: string | null = null;
    if (amount <= 0) {
      message = "Please enter the amount paid.";
    } else if (amount < total) {
      message = `Insufficient payment. Please enter at least ${formatMoney(total)}.`;
    }
    if (message) {
      setError(message);
      setShakeKey((k) => k + 1);
      return;
    }
    const serverError = await onPay(amount);
    if (serverError) {
      setError(serverError);
      setShakeKey((k) => k + 1);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 p-4 sm:p-6 lg:grid-cols-2">
      <section aria-labelledby="cash-heading" className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e4f1e7] text-[#2d6a4f]">
            <CashIcon size={30} />
          </span>
          <h1 id="cash-heading" className="text-3xl font-extrabold">Cash Payment</h1>
        </div>

        <div className="card flex items-center justify-between px-5 py-4">
          <span className="text-lg font-semibold text-ink-muted">Amount Due</span>
          <span className="text-3xl font-extrabold tabular-nums" data-testid="cash-total">{formatMoney(total)}</span>
        </div>

        <div>
          <p id="paid-label" className="mb-1 text-base font-bold">Amount Paid</p>
          <div
            key={shakeKey}
            aria-labelledby="paid-label"
            role="status"
            data-testid="amount-paid"
            className={`rounded-2xl border-2 bg-white px-5 py-4 text-4xl font-extrabold tabular-nums ${
              error ? "animate-shake border-danger" : "border-ink"
            }`}
          >
            {formatMoney(amount)}
          </div>
        </div>

        <div aria-live="assertive" role="alert" className="empty:hidden">
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-danger-soft p-4 text-danger" data-testid="cash-error">
              <AlertIcon size={26} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">{error}</p>
                {amount > 0 && amount < total && (
                  <p className="text-sm">You are short by {formatMoney(short)}.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-ink-muted">Quick amounts</p>
          <div className="grid grid-cols-4 gap-2">
            <button type="button" className={`${keyClass} !text-lg`} onClick={() => edit(total)} disabled={processing}>
              Exact
            </button>
            {QUICK_AMOUNTS.map((pesos) => (
              <button
                key={pesos}
                type="button"
                className={`${keyClass} !text-lg`}
                onClick={() => edit(pesos * CENTAVOS_PER_PESO)}
                disabled={processing}
              >
                {formatMoney(pesos * CENTAVOS_PER_PESO).replace(".00", "")}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`flex items-center justify-between rounded-2xl border px-5 py-4 transition-colors duration-200 ${
            sufficient ? "border-[#2d6a4f] bg-success-soft text-success" : "border-line bg-[#fbf1dd] text-ink-muted"
          }`}
        >
          <div>
            <p className="text-lg font-bold">Change</p>
            {sufficient && (
              <p className="text-sm">
                {formatMoney(amount)} − {formatMoney(total)}
              </p>
            )}
          </div>
          <p className="text-3xl font-extrabold tabular-nums" data-testid="cash-change">
            {sufficient ? formatMoney(change) : "—"}
          </p>
        </div>
      </section>

      <section aria-label="Numeric keypad" className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          {KEYS.map((digit) => (
            <button key={digit} type="button" className={`${keyClass} min-h-[72px]`} onClick={() => pressDigit(digit)} disabled={processing}>
              {digit}
            </button>
          ))}
          <button type="button" className={`${keyClass} min-h-[72px] !bg-slate-100 !text-xl`} onClick={() => edit(0)} disabled={processing}>
            Clear
          </button>
          <button type="button" className={`${keyClass} min-h-[72px]`} onClick={() => pressDigit("0")} disabled={processing}>
            0
          </button>
          <button
            type="button"
            className={`${keyClass} min-h-[72px] !bg-slate-100`}
            onClick={backspace}
            aria-label="Backspace"
            disabled={processing}
          >
            <BackspaceIcon size={30} />
          </button>
        </div>

        <button type="button" className="btn-primary mt-1 w-full" onClick={pay} disabled={processing} aria-busy={processing}>
          {processing ? (
            <>
              <SpinnerIcon size={24} /> Saving payment…
            </>
          ) : (
            "Pay Now"
          )}
        </button>
        <button type="button" className="btn-secondary w-full" onClick={onChangeMethod} disabled={processing}>
          <ArrowLeftIcon size={22} /> Change payment method
        </button>
      </section>
    </div>
  );
}
