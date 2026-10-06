import { NextResponse } from "next/server";
import { findReceipt } from "@/lib/checkout";

export const dynamic = "force-dynamic";

const NUMBER_PATTERN = /^TXN-\d{4}-\d{5,}$/;

export async function GET(_request: Request, context: { params: Promise<{ transactionNumber: string }> }) {
  const { transactionNumber } = await context.params;
  if (!NUMBER_PATTERN.test(transactionNumber)) {
    return NextResponse.json({ ok: false, error: "Invalid transaction number.", code: "INVALID_NUMBER" }, { status: 400 });
  }
  try {
    const receipt = await findReceipt(transactionNumber);
    if (!receipt) {
      return NextResponse.json({ ok: false, error: "Transaction not found.", code: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data: receipt });
  } catch (error) {
    console.error("Receipt lookup failed:", error);
    return NextResponse.json({ ok: false, error: "Could not load the receipt.", code: "SERVER_ERROR" }, { status: 500 });
  }
}
