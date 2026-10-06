# MANG INASAL-inspired – Self-Service POS Kiosk

**IT415 Practical Examination** — Touchscreen Point of Sale (POS) Kiosk System

## Developers

1. Michael Angelo Acera
2. Isaiah Jairo C. Martinez
3. Cyril Dwyne R. Pasa
4. Angela Faiht N. Misoles

Roles and individual contributions: **TBD** (see [Group Contributions](#20-group-contributions)).

---

## 1. Project Description

This is an original MANG INASAL-inspired touchscreen self-service kiosk for a grilled-food restaurant. A customer
taps large product cards, reviews the order, chooses **Cash**, **QR Payment** or **Credit/Debit Card**,
sees a *Payment Successful* confirmation with a unique transaction number, views a digital receipt, and
starts a new transaction. Completed transactions are stored in MySQL.

## 2. Objectives

- Provide the required transaction flow: Item Selection → Order Summary → Payment Method → Payment Processing → Payment Successful → Receipt → New Transaction.
- Minimise typing; use large touch targets and clear navigation.
- Compute subtotals, totals, and change automatically and **correctly** (integer centavos, never floating point).
- Validate payments (reject blank, zero, negative, invalid, and insufficient cash).
- Persist successful transactions atomically, with unique transaction numbers.

## 3. Features

- Six seeded products with inline-SVG icons, category filters (All / Drinks / Food / Snacks), selected-state and quantity badges.
- Order panel: increase / decrease / remove, quantity 1–99, live item count and total, empty state.
- Review screen (Back keeps the cart) and three payment methods.
- Cash: touchscreen keypad (Clear, Backspace), Exact / ₱200 / ₱500 / ₱1,000 quick buttons, live change, clear error messages.
- QR payment (simulated placeholder) and card payment (simulated ~2 s “Processing payment…”).
- Payment Successful screen with animated check mark, digital receipt, **Print Receipt** (print stylesheet prints only the receipt), **New Transaction** reset.
- Transaction numbers `TXN-YYYY-00001`, unique and concurrency-safe.
- Double-tap protection on the client **and** on the server (idempotency key).
- Order survives a browser refresh (session storage); toasts with `aria-live`; `prefers-reduced-motion` respected.

## 4. Technology Stack

| Area | Technology |
| ---- | ---------- |
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 3 + a small global stylesheet (animations, print) |
| Database | MySQL (local: XAMPP / MariaDB) |
| ORM | Prisma 6 (`@prisma/adapter-mariadb` driver adapter, which works with MySQL and MariaDB) |
| Hosting target | Vercel (with a publicly reachable MySQL-compatible database) |

Not used: PHP, Firebase, MongoDB, PostgreSQL, Express, Laravel, Django, jQuery, Bootstrap, Angular, Vue, animation libraries.

## 5. System Architecture

```
Browser
  ↓
Next.js (React UI)
  ↓
Route Handlers (/api/checkout, /api/transactions/[number]) and server-rendered pages
  ↓
Prisma
  ↓
MySQL through XAMPP (local)   |   a public MySQL-compatible database (Vercel)
```

The browser **never** connects to MySQL. Database credentials exist only in server-side environment
variables (`DATABASE_URL`) and are never sent to client code.

**Server trust model.** Checkout accepts only product IDs, quantities, the payment method, the cash amount,
and an idempotency token. Prices, subtotals and totals sent by a client are ignored; the server reads prices
from MySQL, recalculates everything, validates the payment, and saves the transaction and its items in a
single Prisma transaction. Any failure rolls back — a failed or insufficient payment creates no records.

## 6. Database

Database name: `it415_pos_kiosk`

| Model | Purpose |
| ----- | ------- |
| `Product` | `id, name, price, category, icon, createdAt, updatedAt` — price in integer centavos |
| `Transaction` | `id, transactionNumber (unique), totalAmount, paymentMethod, amountPaid, changeAmount, status, createdAt` (+ `idempotencyKey`, unique) |
| `TransactionItem` | `id, transactionId, productId, productName, quantity, unitPrice, subtotal` — name and unit price are **snapshots** so old receipts stay correct if prices change |
| `TransactionCounter` | one row per year; produces gap-free, concurrency-safe numbers |

Relationships: `Transaction 1 → n TransactionItem`, `Product 1 → n TransactionItem`.

**Money** is stored as integer centavos (₱45.00 = `4500`). `formatMoney(4500)` → `₱45.00` (`lib/money.ts`).

**Transaction numbers** (`TXN-2026-00001`): the next sequence is taken with
`INSERT … ON DUPLICATE KEY UPDATE` on `TransactionCounter` inside the checkout transaction. The row lock
serialises concurrent checkouts, and a unique index on `transactionNumber` is a second safety net. If the
checkout rolls back, the counter rolls back too.

Seeded products (`prisma/seed.ts`, safe to run repeatedly): Coffee ₱45 (Drinks), Sandwich ₱50 (Food),
Soft Drink ₱35 (Drinks), Cookies ₱25 (Snacks), Bottled Water ₱20 (Drinks), Chocolate ₱25 (Snacks).

## 7. XAMPP Setup

1. Install [XAMPP](https://www.apachefriends.org/) and open the **XAMPP Control Panel**.
2. Click **Start** next to **MySQL** (Apache is *not* needed except to use phpMyAdmin).
3. MySQL listens on port `3306`; the default user is `root` with an empty password.

## 8. phpMyAdmin Setup

1. Start **Apache** and **MySQL** in XAMPP, then open <http://localhost/phpmyadmin>.
2. Click **New**, enter the database name **`it415_pos_kiosk`**, choose collation `utf8mb4_unicode_ci`, and click **Create**.
3. Leave it empty — Prisma creates the tables.

(Alternative, SQL tab: `CREATE DATABASE it415_pos_kiosk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)

## 9. Prisma Setup

Prisma reads `prisma/schema.prisma`. The initial migration is in `prisma/migrations/`.

```bash
npx prisma migrate dev    # creates the tables
npx prisma db seed        # inserts the six products (safe to repeat)
```

`npx prisma studio` opens a browser view of the data. `prisma migrate dev` needs permission to create a
temporary “shadow” database, which the default XAMPP `root` user has.

## 10. Environment Variables

Copy `.env.example` to `.env`:

```
DATABASE_URL="mysql://root:@localhost:3306/it415_pos_kiosk"
```

If you set a MySQL password: `mysql://root:YOURPASSWORD@localhost:3306/it415_pos_kiosk`
(URL-encode special characters). Never commit `.env`; it is listed in `.gitignore`.
An optional `TEST_DATABASE_URL` is used only by `npm run test:db` (see [Testing](#16-testing)).

## 11. Local Development

```bash
# 1. extract the ZIP and open a terminal in the project folder
npm install

# 2. start MySQL in XAMPP, create the database it415_pos_kiosk (section 8)

# 3. configure the environment
cp .env.example .env          # Windows: copy .env.example .env

# 4. create tables and seed products
npx prisma migrate dev
npx prisma db seed

# 5. run
npm run dev
```

Open <http://localhost:3000> in the browser. For the best view use a 1024 × 768 landscape window or touchscreen.

Other commands: `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`, `npm test`.

**Troubleshooting:** *“The database could not be reached”* on the page → MySQL is not running, the database
does not exist, or `DATABASE_URL` is wrong. *“No products were found”* → run `npx prisma db seed`.

## 12. Application Flow

1. **Order** – tap products; adjust quantities in *Your Order*; **Proceed to Review**.
2. **Review** – full order and total; **Back** keeps the cart; **Continue to Payment**.
3. **Payment** – choose Cash / QR Payment / Credit-Debit Card. *Choosing a method saves nothing.*
4. **Processing** – cash is validated; QR and card are simulated. Only now is the transaction saved.
5. **Payment Successful** – transaction number, method, amount, paid, change; **View Receipt**.
6. **Receipt** – **Print Receipt** or **New Transaction** (clears the cart, payment data, receipt, and totals; saved transactions stay in MySQL).

## 13. Payment Simulation

No real payment gateway is used and no card numbers, CVV, PIN, or other credentials are ever collected or stored.

- **Cash:** change = amount paid − total. Blank, zero, invalid and insufficient amounts are rejected on the client and again on the server (`Insufficient payment. Please enter at least ₱175.00.`). Exact payment is valid with ₱0.00 change.
- **QR:** a decorative SVG placeholder (not a real payment code) and a **Confirm Payment** button. Amount paid = total; change = ₱0.00.
- **Card:** **Process Payment** shows “Processing payment...” for about 2 seconds with controls disabled, then succeeds. Amount paid = total; change = ₱0.00.

## 14. UI/UX

Dark-navy header with step indicator (current step highlighted, completed steps checked), warm-orange accent,
off-white background, white cards, large type, minimum 56 px touch targets (64 px primary buttons),
`touch-action: manipulation`. Layout: product catalogue on the left and *Your Order* on the right at
tablet/desktop widths; stacked on mobile. Micro-interactions (150–300 ms): press feedback, selected-card
badge, quantity bump, cart item enter/exit, animated total, toast slide/fade, screen transitions, cash
validation shake, card progress bar, QR confirmation state, animated success check mark, receipt entrance.

## 15. Accessibility

Semantic HTML with real `<button>`, `<table>`, `<dl>` elements; `aria-label`s on icon-only buttons
(e.g. “Increase Coffee quantity”, “Remove Coffee”); `aria-live` regions for toasts and validation errors;
`aria-pressed` on category filters; `aria-current="step"` in the step indicator; visible focus outlines;
state is never conveyed by colour alone (badges, check marks, text); `prefers-reduced-motion` disables animation.

## 16. Testing

```bash
npm run lint && npm run typecheck && npm test      # lint, types, unit tests (money, cart, validation)
npm run build
```

**Database tests** (`npm run test:db`) write transactions, so run them against a *throwaway* database:

```bash
# create database it415_pos_kiosk_test in phpMyAdmin, then:
DATABASE_URL="mysql://root:@localhost:3306/it415_pos_kiosk_test" npx prisma migrate deploy
# put TEST_DATABASE_URL in .env, then
npm run test:db
```

The tests refuse to run unless the database name ends in `_test` or `_qa`. They cover: cash change, exact
payment, insufficient payment (0 rows written), QR/card (paid = total), unknown product rollback, 20
concurrent checkouts → 20 distinct sequential numbers, double-click (same idempotency key) → one transaction,
historical price preservation, and quantity 99.

**What was verified while building** (MariaDB 10.11 stands in for XAMPP's MariaDB/MySQL; Chromium via Playwright at 1024×768 plus mobile/tablet/desktop widths):

- Unit tests (10) and database tests (9) pass; ESLint, TypeScript and `next build` are clean.
- A scripted browser run (73 checks) of the exam scenario: Coffee ×2 + Sandwich + Soft Drink = ₱175 → ₱220 → ₱175 → remove Soft Drink = ₱140; Back keeps the cart; cash ₱100 rejected (no transaction); ₱200 → change ₱60; ₱140 → change ₱0; QR and card succeed; receipts show all details; print view hides everything except the receipt; New Transaction clears everything while earlier transactions stay in MySQL; transaction numbers differ; quantity 99 allowed and 100 rejected; refresh restores the order; invalid API requests (bad JSON, empty cart, quantity 0/100/-1, bad method, unknown product, short/invalid cash, forged prices) are rejected without writing rows; no horizontal scrolling at 390/768/1024/1440 px; all buttons ≥ 56 px.

Verified in this environment: the local XAMPP/MariaDB database is reachable, seeded, and up to date with `npx prisma migrate status`; the kiosk flow was also exercised against it. Still to do on your machine: a manual touchscreen pass.

## 17. Vercel Deployment

> **Important:** a Vercel deployment **cannot** reach MySQL running on your computer. `localhost`/`127.0.0.1`
> on Vercel is Vercel's own server, not your PC, so the local XAMPP database is only for local
> development and the practical examination demo.

| Where | Connection |
| ----- | ---------- |
| Local | Next.js → Prisma → XAMPP MySQL (`mysql://root:@localhost:3306/it415_pos_kiosk`) |
| Vercel | Next.js → Prisma → a **publicly accessible MySQL-compatible database** |

The application code does not change — only `DATABASE_URL` does.

1. Create a hosted MySQL/MariaDB-compatible database (any provider that gives a public connection string; if it requires TLS, append `?ssl=true`).
2. From your computer, apply the schema and seed it: set `DATABASE_URL` to the hosted URL, then `npx prisma migrate deploy` and `npx prisma db seed`.
3. Import the repository in Vercel and add the environment variable `DATABASE_URL` (hosted URL).
4. Deploy. The build script runs `prisma generate && next build`.

Never commit the hosted credentials.

## 18. Limitations

- Payments are simulated; there is no real gateway, QR payload, or card reader.
- No login, admin screen, inventory/stock, refunds, or product management (products are managed through the seed/database).
- The in-progress order is kept in the browser tab's session storage only; it is cleared when the tab closes.
- Receipt printing uses the browser's print dialog (`window.print()`); there is no thermal-printer integration.
- Whole-peso keypad for cash (no centavo entry); amounts are still stored in centavos.
- In the environment this project was generated in, Prisma's engine download host was unreachable, so `prisma migrate dev` could not be run there. The migration SQL in `prisma/migrations/` was written to match `schema.prisma` and applied directly to MariaDB for testing. If `npx prisma migrate dev` on your machine reports that the schema is out of sync, accept the generated migration (or run `npx prisma migrate reset` on the empty local database) and tell your instructor.

## 19. Folder Structure

```
it415-pos-kiosk-Practical-Exam/
├── app/
│   ├── api/checkout/route.ts              POST: validate + save a payment
│   ├── api/transactions/[transactionNumber]/route.ts   GET: receipt lookup
│   ├── globals.css                        Tailwind layers, animations, print styles
│   ├── icon.svg  layout.tsx  page.tsx     page loads products from MySQL
├── components/                            KioskApp, Header, screens, payment views, icons, Toast
├── lib/                                   money, cart, validation, checkout, prisma client, hooks, state
├── prisma/                                schema.prisma, migrations/, seed.ts
├── public/
├── tests/                                 unit tests + db/ (database tests)
├── types/
├── docs/                                  saved AI prompt
├── AI_LOG.md  README.md  .env.example  .gitignore
└── package.json  tsconfig.json  next.config.ts  tailwind.config.ts  postcss.config.mjs
```

## 20. Group Contributions

No Git history, branches, pull requests, or individual contributions are recorded here; the team will create
and document those themselves.

| Member | Role | GitHub username | Branch(es) | Contribution |
| ------ | ---- | --------------- | ---------- | ------------ |
| Michael Angelo Acera | TBD | TBD | TBD | TBD |
| Isaiah Jairo C. Martinez | TBD | TBD | TBD | TBD |
| Cyril Dwyne R. Pasa | TBD | TBD | TBD | TBD |
| Angela Faiht N. Misoles | TBD | TBD | TBD | TBD |

AI assistance is documented in [`AI_LOG.md`](AI_LOG.md).
