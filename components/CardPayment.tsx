"use client";

import { useEffect, useState } from "react";
import { ArrowLeftIcon, CardIcon, SpinnerIcon } from "@/components/icons";
import { CARD_PROCESSING_MS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

interface CardPaymentProps {
  total: number;
  processing: boolean;
  onProcess: () => void;
  onBack: () => void;
}

export function CardPayment({ total, processing, onProcess, onBack }: CardPaymentProps) {
  const [progress, setProgress] = useState(0);

  // Drives the ~2 second progress bar while the payment is processing.
  useEffect(() => {
    if (!processing) {
      setProgress(0);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      setProgress(Math.min(1, (now - start) / CARD_PROCESSING_MS));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [processing]);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 p-4 sm:p-6 md:grid-cols-2">
      <div className="card flex items-center justify-center p-8" aria-hidden="true">
        <div className="relative h-64 w-44 rounded-[28px] bg-[#5c2c06] p-4 shadow-pop">
          <div className="rounded-xl bg-[#1f1b18] p-3 text-xs text-[#f3e9d2]">
            <p>PAY</p>
            <p className="text-lg font-bold text-white">{formatMoney(total)}</p>
          </div>
          <div className={`mx-auto mt-8 flex h-12 w-12 items-center justify-center rounded-full text-sky-300 ${processing ? "animate-pulse-ring" : ""}`}>
            <CardIcon size={32} />
          </div>
          <div className="absolute -right-10 top-28 h-24 w-36 rotate-[10deg] rounded-xl bg-accent p-3 shadow-pop">
            <div className="h-5 w-7 rounded bg-highlight" />
            <p className="mt-6 text-[10px] tracking-widest text-[#fff8e7]">•••• •••• •••• ••••</p>
          </div>
        </div>
      </div>

      <section aria-labelledby="card-heading" className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fde4d0] text-accent">
            <CardIcon size={30} />
          </span>
          <h1 id="card-heading" className="text-3xl font-extrabold">Credit / Debit Card</h1>
        </div>

        <div className="card flex items-center justify-between px-5 py-4">
          <span className="text-lg font-semibold text-ink-muted">Amount Due</span>
          <span className="text-3xl font-extrabold tabular-nums text-accent-dark" data-testid="card-total">{formatMoney(total)}</span>
        </div>

        <p className="text-xl font-bold">Please tap, insert, or swipe your card.</p>
        <p className="text-sm text-ink-muted">This is a simulated payment. No card details are collected or stored.</p>

        <div aria-live="polite" role="status">
          {processing && (
            <div className="animate-screen rounded-2xl border border-[#f2c49e] bg-[#fff0d6] p-4 text-[#5c2c06]" data-testid="card-processing">
              <p className="flex items-center gap-2 text-lg font-bold">
                <SpinnerIcon size={22} /> Processing payment...
              </p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#f2c49e]" aria-hidden="true">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <p className="mt-2 text-sm">Please do not remove your card until the payment is complete.</p>
            </div>
          )}
        </div>

        <div className="mt-auto grid grid-cols-[auto_1fr] gap-3">
          <button type="button" className="btn-secondary" onClick={onBack} disabled={processing}>
            <ArrowLeftIcon size={22} /> Back
          </button>
          <button type="button" className="btn-primary" onClick={onProcess} disabled={processing} aria-busy={processing}>
            Process Payment
          </button>
        </div>
      </section>
    </div>
  );
}
