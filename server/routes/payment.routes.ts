import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated, hasRole } from "../middleware/auth.middleware";
import { paymentRateLimiter } from "../middleware/rate-limit.js";
import { insertPaymentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  FRONTEND_PAYMENT_METHODS,
  createPaymentLink,
  isPayosConfigured,
  marketplaceOrderCode,
  payosDescription,
  verifyWebhookDataSignature,
  walletOrderCode,
} from "../lib/payos.js";
import {
  fulfillPendingCheckoutByOrderCode,
  resolveItemPrice,
} from "../lib/payment-fulfillment.js";
import {
  pruneExpiredPendingCheckouts,
  savePendingCheckout,
} from "../storage/payment/pendingCheckoutStorage.js";

const adminMiddleware = hasRole(["admin"]);
const COMMISSION_RATE = 0.05;

interface PendingOrderItem {
  productId: number;
  quantity: number;
}

function getAppBaseUrl(req: Request) {
  const configured = process.env.APP_URL || process.env.PUBLIC_URL || process.env.SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const host = req.get("host") || "localhost:5001";
  const protocol = req.protocol || "http";
  return `${protocol}://${host}`;
}

function isValidPaymentMethod(method?: string): boolean {
  return !method || FRONTEND_PAYMENT_METHODS.has(method);
}

function buildPaymentInfo(
  link: Awaited<ReturnType<typeof createPaymentLink>>,
  orderCode: number,
  amount: number,
) {
  return {
    checkout_url: link.checkoutUrl,
    qr_code: link.qrCode,
    order_code: orderCode,
    order_invoice_number: String(orderCode),
    payment_link_id: link.paymentLinkId,
    amount,
    payment_method: "payos",
  };
}

async function handlePayosWebhook(req: Request, res: Response) {
  try {
    const body = req.body as {
      code?: string;
      success?: boolean;
      data?: Record<string, unknown>;
      signature?: string;
    };

    if (!body.data || !body.signature) {
      return res.status(400).json({ success: false, message: "Invalid webhook payload" });
    }

    if (!verifyWebhookDataSignature(body.data, body.signature)) {
      console.error("payOS webhook signature mismatch");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    if (body.code === "00" && body.success && body.data.orderCode != null) {
      const orderCode = Number(body.data.orderCode);
      const paidAmount = Number(body.data.amount) || 0;
      await fulfillPendingCheckoutByOrderCode(orderCode, paidAmount);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("payOS webhook error:", error);
    return res.status(500).json({ success: false });
  }
}

export function registerPaymentRoutes(app: Express) {
  // Wallet top-up via payOS
  app.post("/api/payment/initiate", paymentRateLimiter, isAuthenticated, async (req, res, next) => {
    try {
      if (!isPayosConfigured()) {
        return res.status(503).json({
          success: false,
          message:
            "Cổng thanh toán payOS chưa được cấu hình. Thêm PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY vào .env",
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

      if (!isValidPaymentMethod(payment_method)) {
        return res.status(400).json({
          success: false,
          message: "Phương thức thanh toán không hợp lệ",
        });
      }

      const user = req.user!;
      const orderCode = walletOrderCode(user.id);
      const baseUrl = getAppBaseUrl(req);
      const roundedAmount = Math.round(amount);

      const link = await createPaymentLink({
        orderCode,
        amount: roundedAmount,
        description: payosDescription("NAP", user.id),
        returnUrl: `${baseUrl}/add-funds?status=success&order=${orderCode}`,
        cancelUrl: `${baseUrl}/add-funds?status=cancel&order=${orderCode}`,
        buyerName: user.name,
        buyerEmail: user.email,
      });

      await savePendingCheckout(String(orderCode), "wallet_deposit", {
        userId: user.id,
        amount: roundedAmount,
        paymentMethod: "payos",
        orderCode,
        paymentLinkId: link.paymentLinkId,
      });
      await pruneExpiredPendingCheckouts();

      res.json({
        success: true,
        payment_info: buildPaymentInfo(link, orderCode, roundedAmount),
      });
    } catch (error) {
      next(error);
    }
  });

  // Marketplace checkout via payOS
  app.post("/api/payment/checkout", paymentRateLimiter, isAuthenticated, async (req, res, next) => {
    try {
      if (!isPayosConfigured()) {
        return res.status(503).json({
          success: false,
          message:
            "Cổng thanh toán payOS chưa được cấu hình. Thêm PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY vào .env",
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

      if (!isValidPaymentMethod(payment_method)) {
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
          payment_method: "payos",
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

      const orderCode = marketplaceOrderCode(order.id);
      const baseUrl = getAppBaseUrl(req);
      const roundedTotal = Math.round(totalAmount);

      const link = await createPaymentLink({
        orderCode,
        amount: roundedTotal,
        description: payosDescription("DH", order.id),
        returnUrl: `${baseUrl}/marketplace/order-success/${order.id}?status=success`,
        cancelUrl: `${baseUrl}/marketplace/checkout?status=cancel&orderId=${order.id}`,
        buyerName: buyer_info?.name || user.name,
        buyerEmail: buyer_info?.email || user.email,
        buyerPhone: buyer_info?.phone,
      });

      await savePendingCheckout(String(orderCode), "marketplace_order", {
        orderId: order.id,
        userId: user.id,
        amount: roundedTotal,
        paymentMethod: "payos",
        items: pendingItems,
        orderCode,
        paymentLinkId: link.paymentLinkId,
      });
      await pruneExpiredPendingCheckouts();

      res.json({
        success: true,
        order_id: order.id,
        payment_info: buildPaymentInfo(link, orderCode, roundedTotal),
      });
    } catch (error) {
      next(error);
    }
  });

  // payOS webhook — source of truth for fulfillment
  app.post("/api/payment/webhook", handlePayosWebhook);

  // Legacy alias (SePay IPN path) → same payOS handler
  app.post("/api/payment/ipn", handlePayosWebhook);

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
