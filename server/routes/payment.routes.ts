import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated, hasRole } from "../middleware/auth.middleware";
import { insertPaymentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Product } from "@shared/schema";
import {
  FRONTEND_TO_SEPAY_METHOD,
  generateDepositInvoice,
  generateOrderInvoice,
  getSepayClient,
  isSepayConfigured,
} from "../lib/sepay.js";

const adminMiddleware = hasRole(["admin"]);
const COMMISSION_RATE = 0.05;

interface PendingDeposit {
  userId: number;
  amount: number;
  paymentMethod: string;
  createdAt: number;
  status: "pending" | "paid" | "failed";
}

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
  createdAt: number;
  status: "pending" | "paid" | "failed";
}

/** Pending wallet deposits — keyed by order_invoice_number */
const pendingDeposits = new Map<string, PendingDeposit>();
/** Pending marketplace orders — keyed by order_invoice_number */
const pendingOrders = new Map<string, PendingOrder>();

function getAppBaseUrl(req: Request) {
  const configured = process.env.APP_URL || process.env.PUBLIC_URL;
  if (configured) return configured.replace(/\/$/, "");
  const host = req.get("host") || "localhost:5001";
  const protocol = req.protocol || "http";
  return `${protocol}://${host}`;
}

function pruneExpiredPending() {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [key, value] of pendingDeposits) {
    if (value.createdAt < cutoff && value.status === "pending") {
      pendingDeposits.delete(key);
    }
  }
  for (const [key, value] of pendingOrders) {
    if (value.createdAt < cutoff && value.status === "pending") {
      pendingOrders.delete(key);
    }
  }
}

function resolveItemPrice(product: Product, packageId: string): number {
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

async function fulfillMarketplaceOrder(
  pending: PendingOrder,
  invoice: string,
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
    transaction_id: invoice,
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

export function registerPaymentRoutes(app: Express) {
  // Wallet top-up via SePay
  app.post("/api/payment/initiate", isAuthenticated, async (req, res, next) => {
    try {
      if (!isSepayConfigured()) {
        return res.status(503).json({
          success: false,
          message:
            "Cổng thanh toán SePay chưa được cấu hình. Thêm SEPAY_MERCHANT_ID và SEPAY_SECRET_KEY vào .env",
        });
      }

      const { amount, payment_method } = req.body as {
        amount?: number;
        payment_method?: string;
      };

      if (!amount || amount < 1000) {
        return res.status(400).json({
          success: false,
          message: "Số tiền tối thiểu là 1.000₫",
        });
      }

      const sepayMethod = payment_method
        ? FRONTEND_TO_SEPAY_METHOD[payment_method]
        : undefined;

      if (!sepayMethod) {
        return res.status(400).json({
          success: false,
          message: "Phương thức thanh toán không hợp lệ",
        });
      }

      const user = req.user!;
      const invoiceNumber = generateDepositInvoice(user.id);
      const baseUrl = getAppBaseUrl(req);

      const client = getSepayClient();
      const formFields = client.checkout.initOneTimePaymentFields({
        operation: "PURCHASE",
        payment_method: sepayMethod,
        order_invoice_number: invoiceNumber,
        order_amount: amount,
        currency: "VND",
        order_description: `Nạp tiền ví Software Hub — ${user.name}`,
        customer_id: String(user.id),
        success_url: `${baseUrl}/add-funds?status=success&order=${encodeURIComponent(invoiceNumber)}`,
        error_url: `${baseUrl}/add-funds?status=failure&order=${encodeURIComponent(invoiceNumber)}`,
        cancel_url: `${baseUrl}/add-funds?status=cancel&order=${encodeURIComponent(invoiceNumber)}`,
        custom_data: JSON.stringify({ userId: user.id, type: "wallet_deposit" }),
      });

      pendingDeposits.set(invoiceNumber, {
        userId: user.id,
        amount,
        paymentMethod: sepayMethod,
        createdAt: Date.now(),
        status: "pending",
      });
      pruneExpiredPending();

      res.json({
        success: true,
        payment_info: {
          checkout_url: client.checkout.initCheckoutUrl(),
          form_fields: formFields,
          order_invoice_number: invoiceNumber,
          amount,
          payment_method: sepayMethod,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Marketplace checkout via SePay
  app.post("/api/payment/checkout", isAuthenticated, async (req, res, next) => {
    try {
      if (!isSepayConfigured()) {
        return res.status(503).json({
          success: false,
          message:
            "Cổng thanh toán SePay chưa được cấu hình. Thêm SEPAY_MERCHANT_ID và SEPAY_SECRET_KEY vào .env",
        });
      }

      if (req.user?.role !== "buyer" && req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Chỉ người mua mới có thể thanh toán đơn hàng",
        });
      }

      const { items, payment_method, buyer_info } = req.body as {
        items?: Array<{ product_id: number | string; package_id?: string; quantity?: number }>;
        payment_method?: string;
        buyer_info?: { name?: string; email?: string; phone?: string; notes?: string };
      };

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Giỏ hàng trống",
        });
      }

      const sepayMethod = payment_method
        ? FRONTEND_TO_SEPAY_METHOD[payment_method]
        : undefined;

      if (!sepayMethod) {
        return res.status(400).json({
          success: false,
          message: "Phương thức thanh toán không hợp lệ",
        });
      }

      let totalAmount = 0;
      let sellerId: number | null = null;
      const orderItems: Array<{
        product_id: number;
        quantity: number;
        price: string;
      }> = [];
      const pendingItems: PendingOrderItem[] = [];

      for (const item of items) {
        const productId = parseInt(String(item.product_id), 10);
        const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
        const packageId = item.package_id || "standard";

        if (Number.isNaN(productId)) {
          return res.status(400).json({
            success: false,
            message: "Sản phẩm không hợp lệ trong giỏ hàng",
          });
        }

        const product = await storage.getProductById(productId);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Không tìm thấy sản phẩm #${productId}`,
          });
        }

        if (product.status !== "approved") {
          return res.status(400).json({
            success: false,
            message: `Sản phẩm "${product.title}" chưa sẵn sàng để mua`,
          });
        }

        if (product.seller_id === req.user!.id) {
          return res.status(400).json({
            success: false,
            message: "Không thể mua sản phẩm của chính bạn",
          });
        }

        if (sellerId === null) {
          sellerId = product.seller_id;
        } else if (sellerId !== product.seller_id) {
          return res.status(400).json({
            success: false,
            message: "Vui lòng thanh toán từng người bán riêng (giỏ hàng có nhiều người bán)",
          });
        }

        if (product.stock_quantity < quantity) {
          return res.status(400).json({
            success: false,
            message: `Sản phẩm "${product.title}" không đủ tồn kho`,
          });
        }

        const unitPrice = resolveItemPrice(product, packageId);
        const itemTotal = unitPrice * quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product_id: productId,
          quantity,
          price: unitPrice.toString(),
        });
        pendingItems.push({ productId, quantity });
      }

      if (totalAmount < 1000) {
        return res.status(400).json({
          success: false,
          message: "Tổng đơn hàng tối thiểu là 1.000₫",
        });
      }

      const commissionAmount = totalAmount * COMMISSION_RATE;
      const user = req.user!;

      const order = await storage.createOrder(
        {
          seller_id: sellerId!,
          total_amount: totalAmount.toString(),
          commission_amount: commissionAmount.toString(),
          payment_method: sepayMethod,
          status: "pending",
          buyer_info: {
            name: buyer_info?.name || user.name,
            email: buyer_info?.email || user.email,
            phone: buyer_info?.phone || "",
            notes: buyer_info?.notes || "",
          },
        },
        orderItems.map((item) => ({
          ...item,
          order_id: 0,
        })),
        user.id,
      );

      const invoiceNumber = generateOrderInvoice(order.id);
      const baseUrl = getAppBaseUrl(req);
      const client = getSepayClient();

      const formFields = client.checkout.initOneTimePaymentFields({
        operation: "PURCHASE",
        payment_method: sepayMethod,
        order_invoice_number: invoiceNumber,
        order_amount: Math.round(totalAmount),
        currency: "VND",
        order_description: `Mua hàng Software Hub — Đơn #${order.id}`,
        customer_id: String(user.id),
        success_url: `${baseUrl}/marketplace/order-success/${order.id}?status=success`,
        error_url: `${baseUrl}/marketplace/checkout?status=failure&orderId=${order.id}`,
        cancel_url: `${baseUrl}/marketplace/checkout?status=cancel&orderId=${order.id}`,
        custom_data: JSON.stringify({
          userId: user.id,
          orderId: order.id,
          type: "marketplace_order",
        }),
      });

      pendingOrders.set(invoiceNumber, {
        orderId: order.id,
        userId: user.id,
        amount: Math.round(totalAmount),
        paymentMethod: sepayMethod,
        items: pendingItems,
        createdAt: Date.now(),
        status: "pending",
      });
      pruneExpiredPending();

      res.json({
        success: true,
        order_id: order.id,
        payment_info: {
          checkout_url: client.checkout.initCheckoutUrl(),
          form_fields: formFields,
          order_invoice_number: invoiceNumber,
          amount: Math.round(totalAmount),
          payment_method: sepayMethod,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // SePay IPN — xác nhận thanh toán thực tế
  app.post("/api/payment/ipn", async (req, res) => {
    try {
      const data = req.body as {
        notification_type?: string;
        order?: {
          order_invoice_number?: string;
          order_amount?: string;
          order_status?: string;
        };
      };

      if (data.notification_type === "ORDER_PAID" && data.order?.order_invoice_number) {
        const invoice = data.order.order_invoice_number;
        const paidAmount = parseFloat(data.order.order_amount || "0");

        const deposit = pendingDeposits.get(invoice);
        if (deposit && deposit.status === "pending") {
          await creditWallet(deposit.userId, paidAmount || deposit.amount);
          deposit.status = "paid";
          pendingDeposits.set(invoice, deposit);
        }

        const marketplaceOrder = pendingOrders.get(invoice);
        if (marketplaceOrder && marketplaceOrder.status === "pending") {
          await fulfillMarketplaceOrder(
            marketplaceOrder,
            invoice,
            paidAmount || marketplaceOrder.amount,
          );
          marketplaceOrder.status = "paid";
          pendingOrders.set(invoice, marketplaceOrder);
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("SePay IPN error:", error);
      res.status(500).json({ success: false });
    }
  });

  // Payments Management
  app.get("/api/payments", isAuthenticated, async (req, res, next) => {
    try {
      let payments;

      if (req.user?.role === "admin") {
        payments = await storage.getAllPayments();
      } else if (req.user?.role === "client") {
        payments = await storage.getClientPayments(req.user.id);
      } else if (req.user?.role === "developer") {
        payments = await storage.getDeveloperPayments(req.user.id);
      } else if (req.user?.role === "buyer") {
        payments = await storage.getBuyerPayments(req.user.id);
      } else if (req.user?.role === "seller") {
        payments = await storage.getSellerPayments(req.user.id);
      } else {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      res.json(payments);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/payments", isAuthenticated, async (req, res, next) => {
    try {
      const { project_id, order_id, amount } = req.body;

      if ((!project_id && !order_id) || !amount) {
        return res.status(400).json({ message: "Project ID or Order ID and amount are required" });
      }

      if (project_id) {
        const project = await storage.getProjectById(parseInt(project_id));

        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }

        if (req.user?.role !== "admin" && project.client_id !== req.user?.id) {
          return res.status(403).json({ message: "Only the project owner can make payments" });
        }

        const insertData = insertPaymentSchema.parse({
          project_id: parseInt(project_id),
          amount: parseFloat(amount),
          status: "pending",
          payer_id: req.user?.id,
          payee_id: project.developer_id,
        });

        const payment = await storage.createPayment(insertData);
        res.status(201).json(payment);
      } else {
        const order = await storage.getOrderById(parseInt(order_id));

        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }

        if (req.user?.role !== "admin" && order.buyer_id !== req.user?.id) {
          return res.status(403).json({ message: "Only the order owner can make payments" });
        }

        const insertData = insertPaymentSchema.parse({
          order_id: parseInt(order_id),
          amount: parseFloat(amount),
          status: "pending",
          payer_id: req.user?.id,
        });

        const payment = await storage.createPayment(insertData);
        res.status(201).json(payment);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });

  app.put("/api/payments/:id/status", adminMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const payment = await storage.getPaymentById(parseInt(id));

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      const updatedPayment = await storage.updatePaymentStatus(parseInt(id), status);

      if (status === "completed") {
        if (payment.project_id) {
          await storage.updateProjectStatus(payment.project_id, "completed");
        } else if (payment.order_id) {
          await storage.updateOrderStatus(payment.order_id, "completed");
        }
      }

      res.json(updatedPayment);
    } catch (error) {
      next(error);
    }
  });
}
