import { AlertIcon, CheckIcon } from "@/components/icons";

export interface ToastMessage {
  id: number;
  message: string;
  kind: "success" | "error";
}

/** Single toast at a time. Polite live region for confirmations, assertive for errors. */
export function ToastRegion({ toast }: { toast: ToastMessage | null }) {
  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div aria-live="polite" role="status">
        {toast?.kind === "success" && <ToastBody toast={toast} />}
      </div>
      <div aria-live="assertive" role="alert">
        {toast?.kind === "error" && <ToastBody toast={toast} />}
      </div>
    </div>
  );
}

function ToastBody({ toast }: { toast: ToastMessage }) {
  const isError = toast.kind === "error";
  return (
    <div
      key={toast.id}
      className={`animate-toast flex items-center gap-3 rounded-full px-5 py-3.5 text-base font-semibold text-white shadow-pop ${
        isError ? "bg-danger" : "bg-[#2d6a4f]"
      }`}
    >
      {isError ? <AlertIcon size={20} /> : <CheckIcon size={20} className="text-green-400" />}
      <span>{toast.message}</span>
    </div>
  );
}
