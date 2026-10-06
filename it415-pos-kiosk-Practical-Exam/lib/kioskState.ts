import { newAttemptKey } from "@/lib/id";
import type { CartLine, PaymentMethod, Receipt } from "@/types";

export type Step = "order" | "review" | "payment" | "success" | "receipt";

export interface KioskState {
  step: Step;
  items: CartLine[];
  category: string;
  paymentMethod: PaymentMethod | null;
  receipt: Receipt | null;
  /** Idempotency token for the current checkout attempt. */
  attemptKey: string;
}

export type KioskAction =
  | { type: "HYDRATE"; state: KioskState }
  | { type: "SET_CATEGORY"; category: string }
  | { type: "SET_ITEMS"; items: CartLine[] }
  | { type: "GO"; step: Step }
  | { type: "SELECT_METHOD"; method: PaymentMethod | null }
  | { type: "COMPLETE"; receipt: Receipt }
  | { type: "RESET" };

export function initialState(): KioskState {
  return { step: "order", items: [], category: "All", paymentMethod: null, receipt: null, attemptKey: newAttemptKey() };
}

export function kioskReducer(state: KioskState, action: KioskAction): KioskState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "SET_CATEGORY":
      return { ...state, category: action.category };
    case "SET_ITEMS":
      // A changed order is a new checkout attempt.
      return { ...state, items: action.items, attemptKey: newAttemptKey() };
    case "GO":
      return { ...state, step: action.step, paymentMethod: action.step === "payment" ? state.paymentMethod : null };
    case "SELECT_METHOD":
      return { ...state, paymentMethod: action.method, attemptKey: newAttemptKey() };
    case "COMPLETE":
      return { ...state, step: "success", receipt: action.receipt };
    case "RESET":
      return initialState();
  }
}


const STORAGE_KEY = "it415-kiosk-v1";

/** Survives a browser refresh. Only order data is stored — never payment credentials. */
export function loadState(): KioskState | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<KioskState>;
    if (!parsed || !Array.isArray(parsed.items) || typeof parsed.step !== "string") return null;
    const hasReceipt = parsed.receipt != null;
    const step = (parsed.step === "success" || parsed.step === "receipt") && !hasReceipt ? "order" : parsed.step;
    return { ...initialState(), ...parsed, step } as KioskState;
  } catch {
    return null;
  }
}

export function saveState(state: KioskState): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — kiosk still works, just without refresh recovery */
  }
}
