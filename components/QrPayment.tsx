import { ArrowLeftIcon, CheckIcon, SpinnerIcon } from "@/components/icons";
import { formatMoney } from "@/lib/money";

interface QrPaymentProps {
  total: number;
  processing: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

/** Decorative 21×21 QR-style placeholder built from a fixed pattern (not a real payment code). */
const SIZE = 21;
function isFinder(x: number, y: number): boolean {
  const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
  const ring = (ox: number, oy: number) => {
    const dx = x - ox;
    const dy = y - oy;
    const edge = dx === 0 || dx === 6 || dy === 0 || dy === 6;
    const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
    return edge || core;
  };
  if (inBox(0, 0)) return ring(0, 0);
  if (inBox(SIZE - 7, 0)) return ring(SIZE - 7, 0);
  if (inBox(0, SIZE - 7)) return ring(0, SIZE - 7);
  return false;
}
function isReserved(x: number, y: number): boolean {
  return (x < 8 && y < 8) || (x >= SIZE - 8 && y < 8) || (x < 8 && y >= SIZE - 8);
}
const CELLS: { x: number; y: number }[] = [];
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const filled = isReserved(x, y) ? isFinder(x, y) : (x * 7 + y * 13 + x * y * 3) % 5 < 2;
    if (filled) CELLS.push({ x, y });
  }
}

export function QrPayment({ total, processing, onConfirm, onBack }: QrPaymentProps) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 p-4 sm:p-6 md:grid-cols-2">
      <div className="card flex flex-col items-center justify-center p-6">
        <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-white p-4">
          <svg
            viewBox={`-1 -1 ${SIZE + 2} ${SIZE + 2}`}
            width={220}
            height={220}
            role="img"
            aria-label="QR code placeholder — simulated, not a real payment code"
            shapeRendering="crispEdges"
          >
            <rect x={-1} y={-1} width={SIZE + 2} height={SIZE + 2} fill="#fff" />
            {CELLS.map(({ x, y }) => (
              <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0f172a" />
            ))}
          </svg>
          {!processing && <div className="animate-scan pointer-events-none absolute inset-x-4 top-4 h-0.5 rounded bg-accent" aria-hidden="true" />}
        </div>
        <p className="mt-3 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-ink-muted">QR placeholder · simulated payment</p>
      </div>

      <section aria-labelledby="qr-heading" className="flex flex-col gap-4">
        <h1 id="qr-heading" className="text-3xl font-extrabold">QR Payment</h1>
        <div className="card flex items-center justify-between px-5 py-4">
          <span className="text-lg font-semibold text-ink-muted">Amount to Pay</span>
          <span className="text-3xl font-extrabold tabular-nums text-accent-dark" data-testid="qr-total">{formatMoney(total)}</span>
        </div>
        <ol className="list-decimal space-y-2 pl-6 text-lg">
          <li>Open your payment application.</li>
          <li>Scan the QR code.</li>
          <li>Confirm the displayed amount.</li>
        </ol>
        <p className="text-sm text-ink-muted">This is a simulated payment. No real money is moved.</p>

        <div className="mt-auto flex flex-col gap-3">
          <button type="button" className="btn-primary w-full" onClick={onConfirm} disabled={processing} aria-busy={processing}>
            {processing ? (
              <>
                <SpinnerIcon size={24} /> Confirming payment…
              </>
            ) : (
              <>
                <CheckIcon size={24} /> Confirm Payment
              </>
            )}
          </button>
          <button type="button" className="btn-secondary w-full" onClick={onBack} disabled={processing}>
            <ArrowLeftIcon size={22} /> Change payment method
          </button>
        </div>
      </section>
    </div>
  );
}
