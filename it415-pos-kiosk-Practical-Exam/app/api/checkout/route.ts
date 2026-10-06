import { NextResponse } from "next/server";
import { processCheckout } from "@/lib/checkout";
import { prisma } from "@/lib/prisma";
import { parseCheckoutRequest, ValidationError } from "@/lib/validation";

export const dynamic = "force-dynamic";

function fail(error: string, code: string, status: number) {
  return NextResponse.json({ ok: false, error, code }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Request body must be valid JSON.", "INVALID_JSON", 400);
  }

  try {
    const checkout = parseCheckoutRequest(body);
    const receipt = await processCheckout(prisma, checkout);
    return NextResponse.json({ ok: true, data: receipt });
  } catch (error) {
    if (error instanceof ValidationError) {
      const status = error.code === "INSUFFICIENT_PAYMENT" ? 422 : error.code === "PRODUCT_NOT_FOUND" ? 404 : 400;
      return fail(error.message, error.code, status);
    }
    console.error("Checkout failed:", error);
    return fail("Something went wrong while saving your payment. Please try again.", "SERVER_ERROR", 500);
  }
}
