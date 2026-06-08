import { SePayPgClient } from "sepay-pg-node";

export type SepayPaymentMethod = "BANK_TRANSFER" | "NAPAS_BANK_TRANSFER";

/** Map frontend method ids → SePay payment_method */
export const FRONTEND_TO_SEPAY_METHOD: Record<string, SepayPaymentMethod> = {
  "bank-qr": "BANK_TRANSFER",
  "napas-qr": "NAPAS_BANK_TRANSFER",
};

export function getSepayClient(): SePayPgClient {
  const merchantId = process.env.SEPAY_MERCHANT_ID;
  const secretKey = process.env.SEPAY_SECRET_KEY;

  if (!merchantId || !secretKey) {
    throw new Error("SEPAY_MERCHANT_ID và SEPAY_SECRET_KEY chưa được cấu hình trong .env");
  }

  const env = process.env.SEPAY_ENV === "production" ? "production" : "sandbox";

  return new SePayPgClient({
    env,
    merchant_id: merchantId,
    secret_key: secretKey,
  });
}

export function isSepayConfigured() {
  return Boolean(process.env.SEPAY_MERCHANT_ID && process.env.SEPAY_SECRET_KEY);
}

export function generateDepositInvoice(userId: number) {
  return `DEP-${userId}-${Date.now()}`;
}

export function generateOrderInvoice(orderId: number) {
  return `ORD-${orderId}-${Date.now()}`;
}
