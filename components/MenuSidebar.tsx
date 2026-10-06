import {
  DessertIcon,
  DrinkIcon,
  FlameIcon,
  FriesIcon,
  HomeIcon,
    InasalLogo,
  MealIcon,
  RiceIcon,
  TagIcon,
} from "@/components/icons";

type MenuCategory = "All" | "Chicken Meals" | "Combo Meals" | "Rice Meals" | "Sides" | "Drinks" | "Desserts";

interface MenuItem {
  label: string;
  category: MenuCategory;
  primary?: boolean;
  icon: typeof HomeIcon;
}

const MENU_ITEMS: MenuItem[] = [
  { label: "Home", category: "All", primary: true, icon: HomeIcon },
  { label: "Best Sellers", category: "Chicken Meals", icon: FlameIcon },
  { label: "Chicken Meals", category: "Chicken Meals", primary: true, icon: MealIcon },
  { label: "Combo Meals", category: "Combo Meals", primary: true, icon: MealIcon },
  { label: "Rice Meals", category: "Rice Meals", primary: true, icon: RiceIcon },
  { label: "Sides", category: "Sides", primary: true, icon: FriesIcon },
  { label: "Drinks", category: "Drinks", primary: true, icon: DrinkIcon },
  { label: "Desserts", category: "Desserts", primary: true, icon: DessertIcon },
  { label: "Promos", category: "Combo Meals", icon: TagIcon },
];

interface MenuSidebarProps {
  activeCategory: string;
  onCategory: (category: MenuCategory) => void;
}

export function MenuSidebar({ activeCategory, onCategory }: MenuSidebarProps) {
  return (
    <aside className="menu-sidebar hidden min-h-0 flex-col rounded-card border border-[#cfe3d4] bg-white p-3 shadow-card lg:flex" aria-label="Menu categories">
      <div className="border-b border-line px-3 pb-4 pt-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-sm font-black text-white ring-2 ring-highlight">
          <InasalLogo size={38} />
        </div>
        <p className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-accent-dark">MANG KANOR INASAL</p>
        <p className="mt-1 text-xs font-semibold text-ink-muted">Self-Service Kiosk</p>
      </div>

      <nav className="mt-3 min-h-0 overflow-y-auto" aria-label="Restaurant menu">
        <p className="px-3 pb-2 text-[11px] font-black uppercase tracking-[0.16em] text-ink-muted">Menu</p>
        <ul className="space-y-1">
          {MENU_ITEMS.map(({ label, category, primary, icon: Icon }) => {
            const active = primary && category === activeCategory;
            return (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => onCategory(category)}
                  aria-pressed={active}
                  className={`menu-sidebar-item group flex min-h-[52px] w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition duration-150 active:scale-[0.98] ${
                    active ? "bg-accent text-white shadow-md" : "text-ink hover:bg-[#eaf7ef] hover:text-accent-dark"
                  }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-white/15" : "bg-[#eaf7ef] text-accent"}`}>
                    <Icon size={19} />
                  </span>
                  <span className="truncate">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}