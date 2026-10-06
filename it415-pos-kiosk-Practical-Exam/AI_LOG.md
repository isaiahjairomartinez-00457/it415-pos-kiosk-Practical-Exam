# AI Usage Log

IT415 Practical Examination — Self-Service POS Kiosk

Every use of an AI tool is recorded here. Evaluation and modification columns are completed by the
member who used the AI, based on what they actually reviewed and changed. Nothing in this log has been
filled in on a member's behalf: `TBD` means "not yet written".

| Date | Member | Prompt | AI Response Summary | My Evaluation | My Modification |
| ---- | ------ | ------ | ------------------- | ------------- | --------------- |
| 2026-10-06 | TBD (member who ran the prompt) | The prompt used to generate this project. Full text saved unmodified in [`docs/AI_PROMPT_01_build-project.txt`](docs/AI_PROMPT_01_build-project.txt). | AI was instructed to build the complete Next.js touchscreen POS kiosk using Prisma, MySQL/XAMPP, modern minimalist UI/UX, JavaScript/TypeScript animations, simulated payments, transaction management, receipts, testing, documentation, and deployment preparation. | TBD | TBD |
| 2026-10-07 | TBD (member who requested the fix) | Finish unfinished exam gaps: replace JSON file storage with Prisma/MySQL, add `.env.example`, make Vercel-ready via `DATABASE_URL`, update README / AI_LOG. | AI migrated persistence to Prisma + MySQL (`Product`, `Transaction`, `TransactionItem`, `YearCounter`), added seed + migration, rewired checkout/products APIs, removed `data/kiosk.json` usage, and documented XAMPP local vs hosted MySQL for Vercel. | TBD | TBD |
| 2026-10-07 | TBD (member who requested the fix) | Make sure the database is JSON only — do not use MySQL, Prisma, or any other database. | AI removed Prisma/MySQL (schema, seed, migrations, `lib/prisma.ts`, `DATABASE_URL` / `.env`), restored `data/kiosk.json` as the only persistence store, rewired `lib/database.ts` for file read/write with idempotency + year counters, and updated README / package scripts. | TBD | TBD |
| 2026-10-07 | Michael Angelo Acera | Implement my assigned contribution: POS Kiosk UI/UX and touchscreen experience enhancement, including Mang Kanor Inasal branding, green restaurant theme, category sidebar, touchscreen product cards, quantity controls, order summary presentation, touch feedback, accessibility, and preservation of existing POS functionality. | AI updated the existing Next.js kiosk UI without rewriting business logic: refreshed fictional branding, consolidated category navigation in the left rail, improved product card sizing and Add to order affordances, retained local product images, and preserved cart/payment/receipt flows. Typecheck, lint, tests, production build, and browser smoke check were completed successfully. | Reviewed the changed UI in the browser and verified the existing POS tests and build. | Updated the kiosk branding and UI presentation in the existing components; left product data, cart calculations, payment flows, APIs, and receipt logic unchanged. |
| TBD | Isaiah Jairo C. Martinez | TBD | TBD | TBD | TBD |
| TBD | Cyril Dwyne R. Pasa | TBD | TBD | TBD | TBD |
| TBD | Angela Faiht N. Misoles | TBD | TBD | TBD | TBD |

Add one row per AI interaction (prompt → response → what you checked → what you changed).
