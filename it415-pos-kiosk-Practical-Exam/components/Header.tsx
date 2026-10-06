import { CheckIcon, InasalLogo } from "@/components/icons";

export const STEPS = ["Order", "Review", "Payment", "Receipt"] as const;

interface HeaderProps {
  /** Index of the step being worked on, or null when the step just finished (payment success). */
  current: number | null;
  /** Steps with an index lower than this show a check mark. */
  completed: number;
}

export function Header({ current, completed }: HeaderProps) {
  const label =
    current === null ? "Payment complete" : `Step ${current + 1} of ${STEPS.length} · ${STEPS[current]}`;

  return (
    <header className="no-print border-b border-white/10 bg-navy-900 text-white shadow-[0_6px_22px_rgba(16,42,67,.16)]">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-black/20 ring-2 ring-highlight/80">
            <InasalLogo size={42} />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-extrabold tracking-tight">MANG INASAL</p>
            <p className="text-sm text-slate-300">Grilled favorites, ready to order</p>
          </div>
        </div>

        <p className="text-sm font-semibold text-slate-300 md:hidden" aria-hidden="true">
          {label}
        </p>

        <nav aria-label="Progress" className="w-full md:w-auto">
          <ol className="flex flex-wrap items-center justify-between gap-2 md:justify-end">
            {STEPS.map((name, index) => {
              const done = index < completed && index !== current;
              const active = index === current;
              const tone = active
                ? "border-white bg-white text-navy-900"
                : done
                  ? "border-navy-700 bg-navy-700 text-white"
                  : "border-navy-700 bg-transparent text-slate-400";
              return (
                <li
                  key={name}
                  className={`step-pill ${tone}`}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <CheckIcon size={16} /> : <span aria-hidden="true">{index + 1}</span>}
                  <span>{name}</span>
                  <span className="sr-only">{done ? "(completed)" : active ? "(current step)" : "(upcoming)"}</span>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </header>
  );
}
