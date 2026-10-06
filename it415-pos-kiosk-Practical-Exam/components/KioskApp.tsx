"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { CardPayment } from "@/components/CardPayment";
import { CashPayment } from "@/components/CashPayment";
import { Header } from "@/components/Header";
import { OrderScreen } from "@/components/OrderScreen";
import { PaymentMethodScreen } from "@/components/PaymentMethodScreen";
import { QrPayment } from "@/components/QrPayment";
import { ReceiptScreen } from "@/components/ReceiptScreen";
import { ReviewScreen } from "@/components/ReviewScreen";
import { SuccessScreen } from "@/components/SuccessScreen";
import { ToastRegion, type ToastMessage } from "@/components/Toast";
import { addToCart, cartTotal, decrementItem, removeItem } from "@/lib/cart";
import { CARD_PROCESSING_MS } from "@/lib/constants";
import { initialState, kioskReducer, loadState, saveState, type Step } from "@/lib/kioskState";
import type { ApiResult, PaymentMethod, ProductDTO, Receipt } from "@/types";

const TOAST_MS = 2200;
const QR_CONFIRM_MS = 800;

// Header progress for each screen: [current step index | null, number of completed steps]
const PROGRESS: Record<Step, [number | null, number]> = {
  order: [0, 0],
  review: [1, 1],
  payment: [2, 2],
  success: [null, 3],
  receipt: [3, 3],
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function KioskApp({ products }: { products: ProductDTO[] }) {
  const [state, dispatch] = useReducer(kioskReducer, undefined, initialState);
  const [hydrated, setHydrated] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const toastId = useRef(0);
  const submitLock = useRef(false);

  const { step, items, category, paymentMethod, receipt, attemptKey } = state;
  const total = cartTotal(items, products);

  // Restore an in-progress order after a browser refresh.
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      // Drop cart lines whose product no longer exists.
      const valid = saved.items.filter((line) => products.some((p) => p.id === line.productId));
      dispatch({ type: "HYDRATE", state: { ...saved, items: valid, step: valid.length === 0 && saved.step !== "success" && saved.step !== "receipt" ? "order" : saved.step } });
    }
    setHydrated(true);
  }, [products]);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [hydrated, state]);

  // Warn before leaving while a payment is being processed.
  useEffect(() => {
    if (!processing) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [processing]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = useCallback((message: string, kind: ToastMessage["kind"] = "success") => {
    window.clearTimeout(toastTimer.current);
    toastId.current += 1;
    setToast({ id: toastId.current, message, kind });
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  function changeItems(result: { items: typeof items; error?: string }) {
    if (result.error) return showToast(result.error, "error");
    dispatch({ type: "SET_ITEMS", items: result.items });
  }

  function handleAdd(product: ProductDTO) {
    const result = addToCart(items, product.id);
    if (result.error) return showToast(result.error, "error");
    dispatch({ type: "SET_ITEMS", items: result.items });
    showToast(`${product.name} added to your order`);
  }

  function goTo(next: Step) {
    if (processing) return;
    dispatch({ type: "GO", step: next });
    window.scrollTo({ top: 0 });
  }

  function handleNewTransaction() {
    dispatch({ type: "RESET" });
    window.scrollTo({ top: 0 });
    showToast("New transaction started — previous order cleared");
  }

  /** Sends the order to the server. Returns an error message, or null on success. */
  async function submitPayment(method: PaymentMethod, amountPaid: number | undefined, minDurationMs: number): Promise<string | null> {
    if (submitLock.current) return null; // ignore duplicate taps while one is in flight
    submitLock.current = true;
    setProcessing(true);
    try {
      const request = fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ productId, quantity }) => ({ productId, quantity })),
          paymentMethod: method,
          amountPaid,
          idempotencyKey: attemptKey,
        }),
      }).then(async (response): Promise<ApiResult<Receipt>> => {
        try {
          return (await response.json()) as ApiResult<Receipt>;
        } catch {
          return { ok: false, error: "Unexpected response from the server.", code: "BAD_RESPONSE" };
        }
      });
      const [result] = await Promise.all([request, sleep(minDurationMs)]);
      if (!result.ok) {
        showToast(result.error, "error");
        return result.error;
      }
      dispatch({ type: "COMPLETE", receipt: result.data });
      window.scrollTo({ top: 0 });
      return null;
    } catch {
      const message = "Could not reach the server. Please check your connection and try again.";
      showToast(message, "error");
      return message;
    } finally {
      submitLock.current = false;
      setProcessing(false);
    }
  }

  const [current, completed] = PROGRESS[step];

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <Header current={current} completed={completed} />

      <main className="flex min-h-0 flex-1 flex-col lg:overflow-y-auto">
        <div key={step + (paymentMethod ?? "")} className="animate-screen flex min-h-0 flex-1 flex-col">
          {step === "order" && (
            <OrderScreen
              products={products}
              items={items}
              category={category}
              onCategory={(next) => dispatch({ type: "SET_CATEGORY", category: next })}
              onAdd={handleAdd}
              onIncrement={(id) => changeItems(addToCart(items, id))}
              onDecrement={(id) => changeItems(decrementItem(items, id))}
              onRemove={(id) => changeItems({ items: removeItem(items, id) })}
              onProceed={() => goTo("review")}
            />
          )}

          {step === "review" && (
            <ReviewScreen items={items} products={products} onBack={() => goTo("order")} onContinue={() => goTo("payment")} />
          )}

          {step === "payment" && paymentMethod === null && (
            <PaymentMethodScreen
              total={total}
              onSelect={(method) => dispatch({ type: "SELECT_METHOD", method })}
              onBack={() => goTo("order")}
            />
          )}

          {step === "payment" && paymentMethod === "CASH" && (
            <CashPayment
              total={total}
              processing={processing}
              onPay={(amountPaid) => submitPayment("CASH", amountPaid, 0)}
              onChangeMethod={() => dispatch({ type: "SELECT_METHOD", method: null })}
            />
          )}

          {step === "payment" && paymentMethod === "QR" && (
            <QrPayment
              total={total}
              processing={processing}
              onConfirm={() => void submitPayment("QR", undefined, QR_CONFIRM_MS)}
              onBack={() => dispatch({ type: "SELECT_METHOD", method: null })}
            />
          )}

          {step === "payment" && paymentMethod === "CARD" && (
            <CardPayment
              total={total}
              processing={processing}
              onProcess={() => void submitPayment("CARD", undefined, CARD_PROCESSING_MS)}
              onBack={() => dispatch({ type: "SELECT_METHOD", method: null })}
            />
          )}

          {step === "success" && receipt && <SuccessScreen receipt={receipt} onViewReceipt={() => goTo("receipt")} />}

          {step === "receipt" && receipt && <ReceiptScreen receipt={receipt} onNewTransaction={handleNewTransaction} />}
        </div>
      </main>

      <ToastRegion toast={toast} />
    </div>
  );
}
