import { storage } from "../storage.js";
import type { Product } from "@shared/schema";
import {
  getPendingCheckout,
  markPendingCheckoutPaid,
} from "../storage/payment/pendingCheckoutStorage.js";

interface PendingOrderItem {
  productId: number;
  quantity: number;
}

interface PendingOrder {
  orderId: number;
  userId: number;
  amount: number;
  paymentMethod: string;
  items: PendingOrderItem[];
}

async function fulfillMarketplaceOrder(
  pending: PendingOrder,
  transactionRef: string,
  paidAmount: number,
) {
  const order = await storage.getOrderById(pending.orderId);
  if (!order || order.status !== "pending") return;

  await storage.updateOrderStatus(pending.orderId, "completed");

  await storage.createPayment({
    order_id: pending.orderId,
    amount: paidAmount.toString(),
    payment_method: pending.paymentMethod,
    status: "completed",
    transaction_id: transactionRef,
  } as Parameters<typeof storage.createPayment>[0]);

  for (const item of pending.items) {
    const product = await storage.getProductById(item.productId);
    if (!product) continue;

    const newStock = Math.max(0, product.stock_quantity - item.quantity);
    await storage.updateProduct(
      item.productId,
      {
        stock_quantity: newStock,
        total_sales: product.total_sales + item.quantity,
      },
      product.seller_id,
    );
  }
}

async function creditWallet(userId: number, amount: number) {
  const user = await storage.getUser(userId);
  if (!user) return;

  const profile = (user.profile_data as Record<string, unknown> | null) || {};
  const currentBalance = Number(profile.wallet_balance) || 0;

  await storage.updateUser(userId, {
    profile_data: {
      ...profile,
      wallet_balance: currentBalance + amount,
    },
  });
}

/** Idempotent fulfill from pending_checkouts by payOS orderCode. */
export async function fulfillPendingCheckoutByOrderCode(
  orderCode: number,
  paidAmount: number,
): Promise<boolean> {
  const invoiceKey = String(orderCode);
  const pending = await getPendingCheckout(invoiceKey);
  if (!pending || pending.status !== "pending") {
    return false;
  }

  if (pending.type === "wallet_deposit") {
    const userId = Number(pending.payload.userId);
    const amount = Number(pending.payload.amount);
    await creditWallet(userId, paidAmount || amount);
  } else if (pending.type === "marketplace_order") {
    const marketplaceOrder: PendingOrder = {
      orderId: Number(pending.payload.orderId),
      userId: Number(pending.payload.userId),
      amount: Number(pending.payload.amount),
      paymentMethod: String(pending.payload.paymentMethod || "payos"),
      items: (pending.payload.items as PendingOrderItem[]) || [],
    };
    await fulfillMarketplaceOrder(
      marketplaceOrder,
      invoiceKey,
      paidAmount || marketplaceOrder.amount,
    );
  } else if (pending.type === "service_payment") {
    const servicePaymentId = Number(pending.payload.servicePaymentId);
    if (servicePaymentId) {
      await storage.updateServicePaymentStatus(servicePaymentId, "completed");
      const payment = await storage.getServicePaymentById(servicePaymentId);
      if (payment?.service_project_id && payment.payment_type === "deposit") {
        await storage.updateServiceProject(payment.service_project_id, {
          status: "in_progress",
        });
      }
    }
  }

  await markPendingCheckoutPaid(invoiceKey);
  return true;
}

export function resolveItemPrice(product: Product, packageId: string): number {
  const rows = product.pricing_rows as Array<{ price: number | string }> | null;
  if (rows && rows.length > 0) {
    const rowIndex = parseInt(packageId, 10);
    if (!Number.isNaN(rowIndex) && rows[rowIndex]) {
      return Number(rows[rowIndex].price);
    }
    if (packageId === "standard" || packageId === "0") {
      return Number(rows[0].price);
    }
  }
  return parseFloat(String(product.price));
}
