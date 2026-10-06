import type { ReactNode, SVGProps } from "react";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  size?: number;
}

function Svg({ size = 24, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ---------- Product icons (inline SVG, no external images) ---------- */

const PRODUCT_ICONS: Record<string, (props: IconProps) => ReactNode> = {
  coffee: (p) => (
    <Svg {...p}>
      <path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9z" />
      <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 3.5v2M11.5 3.5v2" />
    </Svg>
  ),
  sandwich: (p) => (
    <Svg {...p}>
      <path d="M3 18 12 6l9 12z" />
      <path d="M6.5 13.5h11M5 16h14" />
    </Svg>
  ),
  "soft-drink": (p) => (
    <Svg {...p}>
      <path d="M7 8h10l-1.2 11.2a1 1 0 0 1-1 .8H9.2a1 1 0 0 1-1-.8L7 8z" />
      <path d="M6 8h12M13 8l1-5h3" />
    </Svg>
  ),
  cookie: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="9.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="8.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="13.5" r="1" fill="currentColor" />
      <circle cx="10" cy="15" r="1" fill="currentColor" />
    </Svg>
  ),
  bottle: (p) => (
    <Svg {...p}>
      <path d="M10 3h4v3l1.5 2.5V20a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 8.5 20V8.5L10 6V3z" />
      <path d="M8.5 12.5h7M8.5 16.5h7" />
    </Svg>
  ),
  chocolate: (p) => (
    <Svg {...p}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M12 3v18M5 12h14" />
    </Svg>
  ),
};

export function ProductIcon({ name, ...props }: IconProps & { name: string }) {
  const render = PRODUCT_ICONS[name] ?? PRODUCT_ICONS.cookie;
  return <>{render(props)}</>;
}

/** Warm product tile backgrounds and food-forward icon colours. */
export const PRODUCT_TONES: Record<string, { bg: string; fg: string }> = {
  coffee: { bg: "bg-[#f3e9d2]", fg: "text-[#5c2c06]" },
  sandwich: { bg: "bg-[#ffe8bd]", fg: "text-[#5c2c06]" },
  "soft-drink": { bg: "bg-[#fde4d0]", fg: "text-[#c2410c]" },
  cookie: { bg: "bg-[#f3e9d2]", fg: "text-[#8a4b1f]" },
  bottle: { bg: "bg-[#e4f1e7]", fg: "text-[#2d6a4f]" },
  chocolate: { bg: "bg-[#ead8c8]", fg: "text-[#5c2c06]" },
};

/* ---------- UI icons ---------- */

export const HomeIcon = (p: IconProps) => (
  <Svg {...p}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10zM9 21v-6h6v6" /></Svg>
);
export const FlameIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-9-2 2-3 4-3 6-1-1-2-2-2-4-2 2-4 4-4 7a7 7 0 0 0 7 6z" /></Svg>
);
export const MealIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 11h16M5 11l1 9h12l1-9M8 7a4 4 0 0 1 8 0v4H8V7zM3 20h18" /></Svg>
);
export const RiceIcon = (p: IconProps) => (
  <Svg {...p}><path d="M5 12h14l-1 8H6l-1-8zM7 12a5 5 0 0 1 10 0M8 8c1-2 2-3 4-3s3 1 4 3" /></Svg>
);
export const FriesIcon = (p: IconProps) => (
  <Svg {...p}><path d="m6 8 2 12h8l2-12M7 8h10M9 5v3M12 3v5M15 5v3M4 8h16" /></Svg>
);
export const DrinkIcon = (p: IconProps) => (
  <Svg {...p}><path d="M6 5h12l-1 16H7L6 5zM8 2h8M9 10h6M10 14h4" /></Svg>
);
export const DessertIcon = (p: IconProps) => (
  <Svg {...p}><path d="M5 12h14l-2 8H7l-2-8zM7 12a5 5 0 0 1 10 0M9 8c0-2 1-3 3-3s3 1 3 3" /></Svg>
);
export const TagIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 5v6l9 9 7-7-9-9H4zM8 8h.01" /></Svg>
);
export function InasalLogo({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="MANG INASAL original chicken logo"
    >
      <circle cx="32" cy="32" r="29" fill="currentColor" opacity=".14" />
      <path d="M18 38c0-9 7-16 16-16 6 0 11 3 14 8-4 1-7 4-9 8-4 7-13 9-21 4z" fill="#F4C542" />
      <path d="M44 29c4-2 8-1 11 2-4 1-6 3-8 6" fill="#E85D04" />
      <path d="M20 34c-3-3-3-7-1-10 3 2 5 5 5 8" fill="#E85D04" />
      <circle cx="42" cy="29" r="2" fill="#172018" />
      <path d="M25 45c-2 4-5 6-9 7M34 45c1 4 3 6 7 7" stroke="#F4C542" strokeWidth="3" strokeLinecap="round" />
      <path d="M11 48c7-1 12 1 16 6-7 1-12-1-16-6z" fill="#2D6A4F" />
    </svg>
  );
}

export const CheckIcon = (p: IconProps) => (
  <Svg strokeWidth={2.6} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);
export const TrashIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </Svg>
);
export const MinusIcon = (p: IconProps) => (
  <Svg strokeWidth={2.6} {...p}>
    <path d="M6 12h12" />
  </Svg>
);
export const PlusIcon = (p: IconProps) => (
  <Svg strokeWidth={2.6} {...p}>
    <path d="M12 6v12M6 12h12" />
  </Svg>
);
export const ArrowLeftIcon = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);
export const ArrowRightIcon = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const BackspaceIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7 6-7zM12 9.5l5 5M17 9.5l-5 5" />
  </Svg>
);
export const CashIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 9.5v.01M18 14.5v.01" strokeWidth={2.6} />
  </Svg>
);
export const QrIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
    <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
    <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
    <path d="M14 14h3v3h-3zM20.5 14v.01M14 20.5v.01M17.5 20.5h3v-3" />
  </Svg>
);
export const CardIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="M2.5 10h19M6 15h4" />
  </Svg>
);
export const ReceiptIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6" />
  </Svg>
);
export const PrinterIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 9V3h10v6M7 17H4.5A1.5 1.5 0 0 1 3 15.5v-5A1.5 1.5 0 0 1 4.5 9h15a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H17" />
    <rect x="7" y="14" width="10" height="7" rx="1" />
  </Svg>
);
export const CartIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 4h2.5l2 11h10l2-8H7" />
    <circle cx="9" cy="19" r="1.3" />
    <circle cx="17" cy="19" r="1.3" />
  </Svg>
);
export const AlertIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.5v.01" strokeWidth={2.4} />
  </Svg>
);
export const SpinnerIcon = (p: IconProps) => (
  <Svg strokeWidth={2.6} className={`animate-spin-slow ${p.className ?? ""}`} {...p}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </Svg>
);
export const RefreshIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4" />
  </Svg>
);
