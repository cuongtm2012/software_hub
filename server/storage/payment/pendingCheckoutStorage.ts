import { db } from "../../db";
import { pendingCheckouts } from "@shared/schema";
import { eq, and, lt } from "drizzle-orm";

export type PendingCheckoutType = "wallet_deposit" | "marketplace_order";
export type PendingCheckoutStatus = "pending" | "paid" | "failed";

export interface PendingCheckoutRecord {
  invoice_number: string;
  type: PendingCheckoutType;
  payload: Record<string, unknown>;
  status: PendingCheckoutStatus;
  created_at: Date;
  expires_at: Date;
}

const TTL_MS = 30 * 60 * 1000;

export async function savePendingCheckout(
  invoiceNumber: string,
  type: PendingCheckoutType,
  payload: Record<string, unknown>,
): Promise<void> {
  const expiresAt = new Date(Date.now() + TTL_MS);

  await db
    .insert(pendingCheckouts)
    .values({
      invoice_number: invoiceNumber,
      type,
      payload,
      status: "pending",
      expires_at: expiresAt,
    })
    .onConflictDoUpdate({
      target: pendingCheckouts.invoice_number,
      set: {
        type,
        payload,
        status: "pending",
        expires_at: expiresAt,
      },
    });
}

export async function getPendingCheckout(
  invoiceNumber: string,
): Promise<PendingCheckoutRecord | undefined> {
  const [row] = await db
    .select()
    .from(pendingCheckouts)
    .where(eq(pendingCheckouts.invoice_number, invoiceNumber));

  if (!row) return undefined;
  if (row.expires_at < new Date() && row.status === "pending") {
    await db.delete(pendingCheckouts).where(eq(pendingCheckouts.invoice_number, invoiceNumber));
    return undefined;
  }

  return {
    invoice_number: row.invoice_number,
    type: row.type as PendingCheckoutType,
    payload: row.payload as Record<string, unknown>,
    status: row.status as PendingCheckoutStatus,
    created_at: row.created_at,
    expires_at: row.expires_at,
  };
}

export async function markPendingCheckoutPaid(invoiceNumber: string): Promise<void> {
  await db
    .update(pendingCheckouts)
    .set({ status: "paid" })
    .where(eq(pendingCheckouts.invoice_number, invoiceNumber));
}

export async function pruneExpiredPendingCheckouts(): Promise<void> {
  await db
    .delete(pendingCheckouts)
    .where(and(eq(pendingCheckouts.status, "pending"), lt(pendingCheckouts.expires_at, new Date())));
}
