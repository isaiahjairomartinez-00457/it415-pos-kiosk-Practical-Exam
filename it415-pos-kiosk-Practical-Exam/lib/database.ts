import { promises as fs } from "fs";
import path from "path";
import type { CheckoutRequest, PaymentMethod, ProductDTO, Receipt } from "@/types";

const IS_VERCEL = process.env.VERCEL === "1";
const DATA_PATH = IS_VERCEL
  ? path.join("/tmp", "kiosk.json")
  : path.join(process.cwd(), "data", "kiosk.json");
const INITIAL_DATA_PATH = path.join(process.cwd(), "data", "kiosk.json");

interface StoredProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  icon: string;
}

interface StoredTransactionItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface StoredTransaction {
  id: number;
  transactionNumber: string;
  idempotencyKey: string;
  totalAmount: number;
  paymentMethod: string;
  amountPaid: number;
  changeAmount: number;
  status: string;
  createdAt: string;
  items: StoredTransactionItem[];
}

interface KioskDatabase {
  products: StoredProduct[];
  transactions: StoredTransaction[];
  yearCounters: Record<string, number>;
}

interface CheckoutLine {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/** Serializes read-modify-write so concurrent checkouts do not corrupt the JSON file. */
let writeChain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readDatabase(): Promise<KioskDatabase> {
  let raw: string;
  try {
    raw = await fs.readFile(DATA_PATH, "utf8");
  } catch (error: any) {
    if (error.code === "ENOENT" && IS_VERCEL) {
      raw = await fs.readFile(INITIAL_DATA_PATH, "utf8");
    } else {
      throw error;
    }
  }
  
  const parsed = JSON.parse(raw) as KioskDatabase;
  return {
    products: Array.isArray(parsed.products) ? parsed.products : [],
    transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
    yearCounters: parsed.yearCounters && typeof parsed.yearCounters === "object" ? parsed.yearCounters : {},
  };
}

async function writeDatabase(db: KioskDatabase): Promise<void> {
  const payload = `${JSON.stringify(db, null, 2)}\n`;
  const tempPath = `${DATA_PATH}.tmp`;
  await fs.writeFile(tempPath, payload, "utf8");
  await fs.rename(tempPath, DATA_PATH);
}

function toProductDTO(product: StoredProduct): ProductDTO {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    icon: product.icon,
  };
}

function toReceipt(transaction: StoredTransaction): Receipt {
  return {
    transactionNumber: transaction.transactionNumber,
    createdAt: transaction.createdAt,
    items: transaction.items
      .slice()
      .sort((a, b) => a.id - b.id)
      .map(({ productName, quantity, unitPrice, subtotal }) => ({
        productName,
        quantity,
        unitPrice,
        subtotal,
      })),
    totalAmount: transaction.totalAmount,
    paymentMethod: transaction.paymentMethod as PaymentMethod,
    amountPaid: transaction.amountPaid,
    changeAmount: transaction.changeAmount,
    status: transaction.status,
  };
}

export async function getProducts(): Promise<ProductDTO[]> {
  const db = await readDatabase();
  return db.products
    .slice()
    .sort((a, b) => a.id - b.id)
    .map(toProductDTO);
}

export async function getCheckoutProducts(productIds: number[]): Promise<ProductDTO[]> {
  const uniqueIds = new Set(productIds);
  const db = await readDatabase();
  return db.products.filter((product) => uniqueIds.has(product.id)).map(toProductDTO);
}

export async function findReceipt(transactionNumber: string): Promise<Receipt | null> {
  const db = await readDatabase();
  const transaction = db.transactions.find((entry) => entry.transactionNumber === transactionNumber);
  return transaction ? toReceipt(transaction) : null;
}

export async function saveCheckout(input: {
  request: CheckoutRequest;
  totalAmount: number;
  amountPaid: number;
  changeAmount: number;
  lines: CheckoutLine[];
}): Promise<Receipt> {
  return withLock(async () => {
    const db = await readDatabase();

    const existing = db.transactions.find(
      (entry) => entry.idempotencyKey === input.request.idempotencyKey,
    );
    if (existing) return toReceipt(existing);

    const year = new Date().getFullYear();
    const yearKey = String(year);
    const nextValue = (db.yearCounters[yearKey] ?? 0) + 1;
    db.yearCounters[yearKey] = nextValue;

    const transactionNumber = `TXN-${year}-${String(nextValue).padStart(5, "0")}`;
    const nextTransactionId =
      db.transactions.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;

    const created: StoredTransaction = {
      id: nextTransactionId,
      transactionNumber,
      idempotencyKey: input.request.idempotencyKey,
      totalAmount: input.totalAmount,
      paymentMethod: input.request.paymentMethod,
      amountPaid: input.amountPaid,
      changeAmount: input.changeAmount,
      status: "SUCCESS",
      createdAt: new Date().toISOString(),
      items: input.lines.map((line, index) => ({
        id: index + 1,
        productId: line.productId,
        productName: line.productName,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        subtotal: line.subtotal,
      })),
    };

    db.transactions.push(created);
    await writeDatabase(db);
    return toReceipt(created);
  });
}
