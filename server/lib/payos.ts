import { createHmac } from "crypto";

const PAYOS_API_BASE = "https://api-merchant.payos.vn";

export type PayosPaymentMethod = "payos";

/** Frontend method ids — payOS hosts VietQR/NAPAS on one checkout page */
export const FRONTEND_PAYMENT_METHODS = new Set(["bank-qr", "napas-qr", "payos"]);

export function isPayosConfigured(): boolean {
  return Boolean(
    process.env.PAYOS_CLIENT_ID &&
      process.env.PAYOS_API_KEY &&
      process.env.PAYOS_CHECKSUM_KEY,
  );
}

function getCredentials() {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (!clientId || !apiKey || !checksumKey) {
    throw new Error(
      "PAYOS_CLIENT_ID, PAYOS_API_KEY và PAYOS_CHECKSUM_KEY chưa được cấu hình trong .env",
    );
  }

  return { clientId, apiKey, checksumKey };
}

/** Short description for bank transfer memo (payOS may limit length). */
export function payosDescription(prefix: string, id: number): string {
  const raw = `${prefix}${id}`;
  return raw.slice(0, 25);
}

export function walletOrderCode(userId: number): number {
  return 900_000_000_000 + Date.now() % 100_000_000_000 + (userId % 1000);
}

export function marketplaceOrderCode(orderId: number): number {
  return 1_000_000_000 + orderId;
}

export function serviceOrderCode(paymentId: number): number {
  return 2_000_000_000 + paymentId;
}

export function createPaymentRequestSignature(data: {
  amount: number;
  cancelUrl: string;
  description: string;
  orderCode: number;
  returnUrl: string;
}): string {
  const { checksumKey } = getCredentials();
  const query = `amount=${data.amount}&cancelUrl=${data.cancelUrl}&description=${data.description}&orderCode=${data.orderCode}&returnUrl=${data.returnUrl}`;
  return createHmac("sha256", checksumKey).update(query).digest("hex");
}

function sortObjDataByKey<T extends Record<string, unknown>>(object: T): T {
  return Object.keys(object)
    .sort()
    .reduce((obj, key) => {
      (obj as Record<string, unknown>)[key] = object[key as keyof T];
      return obj;
    }, {} as T);
}

function convertObjToQueryStr(object: Record<string, unknown>): string {
  return Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .map((key) => {
      let value: unknown = object[key];
      if (Array.isArray(value)) {
        value = JSON.stringify(
          value.map((val) =>
            typeof val === "object" && val !== null
              ? sortObjDataByKey(val as Record<string, unknown>)
              : val,
          ),
        );
      }
      if (value === null || value === undefined || value === "undefined" || value === "null") {
        value = "";
      }
      return `${key}=${value}`;
    })
    .join("&");
}

export function verifyWebhookDataSignature(
  data: Record<string, unknown>,
  signature: string,
): boolean {
  const { checksumKey } = getCredentials();
  const sorted = sortObjDataByKey(data);
  const query = convertObjToQueryStr(sorted);
  const expected = createHmac("sha256", checksumKey).update(query).digest("hex");
  return expected === signature;
}

export interface PayosPaymentLinkResult {
  checkoutUrl: string;
  qrCode?: string;
  paymentLinkId: string;
  orderCode: number;
}

export async function createPaymentLink(params: {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
}): Promise<PayosPaymentLinkResult> {
  const { clientId, apiKey } = getCredentials();
  const amount = Math.round(params.amount);

  const signature = createPaymentRequestSignature({
    amount,
    cancelUrl: params.cancelUrl,
    description: params.description,
    orderCode: params.orderCode,
    returnUrl: params.returnUrl,
  });

  const body = {
    orderCode: params.orderCode,
    amount,
    description: params.description,
    returnUrl: params.returnUrl,
    cancelUrl: params.cancelUrl,
    signature,
    ...(params.buyerName && { buyerName: params.buyerName }),
    ...(params.buyerEmail && { buyerEmail: params.buyerEmail }),
    ...(params.buyerPhone && { buyerPhone: params.buyerPhone }),
  };

  const response = await fetch(`${PAYOS_API_BASE}/v2/payment-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": clientId,
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const json = (await response.json()) as {
    code?: string;
    desc?: string;
    data?: {
      checkoutUrl?: string;
      qrCode?: string;
      paymentLinkId?: string;
      orderCode?: number;
    };
  };

  if (!response.ok || json.code !== "00" || !json.data?.checkoutUrl) {
    console.error("payOS create link error:", json);
    throw new Error(json.desc || "Không tạo được link thanh toán payOS");
  }

  return {
    checkoutUrl: json.data.checkoutUrl,
    qrCode: json.data.qrCode,
    paymentLinkId: json.data.paymentLinkId || "",
    orderCode: json.data.orderCode ?? params.orderCode,
  };
}

export async function confirmWebhookUrl(webhookUrl: string): Promise<void> {
  const { clientId, apiKey } = getCredentials();
  const response = await fetch(`${PAYOS_API_BASE}/confirm-webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": clientId,
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ webhookUrl }),
  });

  const json = (await response.json()) as { code?: string; desc?: string };
  if (!response.ok || (json.code && json.code !== "00")) {
    throw new Error(json.desc || "Đăng ký webhook payOS thất bại");
  }
}
