import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

// Prices are integer centavos (₱45.00 = 4500).
const PRODUCTS = [
  { legacyName: "Coffee", name: "Chicken Inasal", price: 9900, category: "Chicken Meals", icon: "sandwich" },
  { legacyName: "Sandwich", name: "Chicken Inasal with Rice", price: 12900, category: "Combo Meals", icon: "sandwich" },
  { legacyName: "Soft Drink", name: "Pork BBQ Meal", price: 10900, category: "Combo Meals", icon: "chocolate" },
  { legacyName: "Cookies", name: "Java Rice", price: 3500, category: "Rice Meals", icon: "cookie" },
  { legacyName: "Bottled Water", name: "Iced Tea", price: 3000, category: "Drinks", icon: "soft-drink" },
  { legacyName: "Chocolate", name: "Halo-Halo", price: 6500, category: "Desserts", icon: "chocolate" },
  { legacyName: "Atchara", name: "Atchara", price: 2500, category: "Sides", icon: "cookie" },
];

async function main() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");
  const url = new URL(raw);
  const adapter = new PrismaMariaDb({
    host: url.hostname === "localhost" ? "127.0.0.1" : url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: 2,
    ssl: url.searchParams.get("ssl") === "true" ? { rejectUnauthorized: true } : undefined,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    // Reuse the original demo rows when possible so existing transaction item
    // relations remain valid while their historical snapshots stay unchanged.
    for (const product of PRODUCTS) {
      const legacy = await prisma.product.findUnique({ where: { name: product.legacyName } });
      const data = { name: product.name, price: product.price, category: product.category, icon: product.icon };
      if (legacy) {
        await prisma.product.update({ where: { id: legacy.id }, data });
      } else {
        await prisma.product.upsert({ where: { name: product.name }, update: data, create: data });
      }
    }
    console.log(`Seeded ${PRODUCTS.length} products.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
