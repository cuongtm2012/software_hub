#!/bin/bash

# Marketplace - Product Storage
cat > server/storage/marketplace/productStorage.ts << 'EOF'
import { db } from "../../db";
import { products, type Product, type InsertProduct } from "@shared/schema";
import { eq, and, ilike, sql } from "drizzle-orm";

export interface IProductStorage {
  createProduct(product: InsertProduct, sellerId: number): Promise<Product>;
  getProductById(id: number): Promise<Product | undefined>;
  getProducts(params?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<{ products: Product[], total: number }>;
  getProductsByCategory(category: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }>;
  getProductsBySellerId(sellerId: number): Promise<Product[]>;
  searchProducts(search: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }>;
  updateProduct(id: number, product: Partial<InsertProduct>, sellerId: number): Promise<Product | undefined>;
  deleteProduct(id: number, sellerId: number): Promise<boolean>;
}

export class ProductStorage implements IProductStorage {
  async createProduct(product: InsertProduct, sellerId: number): Promise<Product> {
    const [createdProduct] = await db
      .insert(products)
      .values({
        ...product,
        seller_id: sellerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdProduct;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }

  async getProducts(params?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<{ products: Product[], total: number }> {
    let whereConditions = [];

    if (params?.category) {
      whereConditions.push(eq(products.category, params.category));
    }

    if (params?.search) {
      whereConditions.push(ilike(products.name, `%${params.search}%`));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    const productsList = await db
      .select()
      .from(products)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { products: productsList, total };
  }

  async getProductsByCategory(category: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }> {
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(eq(products.category, category));

    const total = countResult?.count || 0;

    const productsList = await db
      .select()
      .from(products)
      .where(eq(products.category, category))
      .limit(limit || 10)
      .offset(offset || 0);

    return { products: productsList, total };
  }

  async getProductsBySellerId(sellerId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.seller_id, sellerId));
  }

  async searchProducts(search: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }> {
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(ilike(products.name, `%${search}%`));

    const total = countResult?.count || 0;

    const productsList = await db
      .select()
      .from(products)
      .where(ilike(products.name, `%${search}%`))
      .limit(limit || 10)
      .offset(offset || 0);

    return { products: productsList, total };
  }

  async updateProduct(id: number, product: Partial<InsertProduct>, sellerId: number): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({
        ...product,
        updated_at: new Date()
      })
      .where(and(eq(products.id, id), eq(products.seller_id, sellerId)))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number, sellerId: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.seller_id, sellerId)));
    return result.rowCount > 0;
  }
}

export const productStorage = new ProductStorage();
EOF

# Marketplace - Order Storage
cat > server/storage/marketplace/orderStorage.ts << 'EOF'
import { db } from "../../db";
import { orders, orderItems, type Order, type InsertOrder, type OrderItem, type InsertOrderItem } from "@shared/schema";
import { eq, and, ilike, sql, inArray } from "drizzle-orm";

export interface IOrderStorage {
  createOrder(order: InsertOrder, items: InsertOrderItem[], buyerId: number): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
  getAllOrders(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ orders: Order[], total: number }>;
  getOrdersByBuyerId(buyerId: number): Promise<Order[]>;
  getBuyerOrders(buyerId: number): Promise<Order[]>;
  getOrdersBySellerId(sellerId: number): Promise<Order[]>;
  getSellerOrders(sellerId: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
}

export class OrderStorage implements IOrderStorage {
  async createOrder(order: InsertOrder, items: InsertOrderItem[], buyerId: number): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [createdOrder] = await tx
        .insert(orders)
        .values({
          ...order,
          buyer_id: buyerId,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();

      if (items.length > 0) {
        await tx.insert(orderItems).values(
          items.map(item => ({
            ...item,
            order_id: createdOrder.id
          }))
        );
      }

      return createdOrder;
    });
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    return order;
  }

  async getAllOrders(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ orders: Order[], total: number }> {
    let whereConditions = [];

    if (params?.status) {
      whereConditions.push(eq(orders.status, params.status));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    const ordersList = await db
      .select()
      .from(orders)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { orders: ordersList, total };
  }

  async getOrdersByBuyerId(buyerId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.buyer_id, buyerId));
  }

  async getBuyerOrders(buyerId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.buyer_id, buyerId));
  }

  async getOrdersBySellerId(sellerId: number): Promise<Order[]> {
    const orderItemsWithSeller = await db
      .select({ order_id: orderItems.order_id })
      .from(orderItems)
      .where(eq(orderItems.seller_id, sellerId));

    if (orderItemsWithSeller.length === 0) {
      return [];
    }

    const orderIds = orderItemsWithSeller.map(item => item.order_id);

    return await db
      .select()
      .from(orders)
      .where(inArray(orders.id, orderIds));
  }

  async getSellerOrders(sellerId: number): Promise<Order[]> {
    return this.getOrdersBySellerId(sellerId);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
}

export const orderStorage = new OrderStorage();
EOF

# Marketplace - Payment Storage
cat > server/storage/marketplace/paymentStorage.ts << 'EOF'
import { db } from "../../db";
import { payments, type Payment, type InsertPayment } from "@shared/schema";
import { eq, and, ilike, sql } from "drizzle-orm";

export interface IPaymentStorage {
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentById(id: number): Promise<Payment | undefined>;
  getPaymentsByOrderId(orderId: number): Promise<Payment[]>;
  getAllPayments(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ payments: Payment[], total: number }>;
  getClientPayments(clientId: number): Promise<Payment[]>;
  getDeveloperPayments(developerId: number): Promise<Payment[]>;
  getBuyerPayments(buyerId: number): Promise<Payment[]>;
  getSellerPayments(sellerId: number): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  releaseEscrow(id: number, buyerId: number): Promise<Payment | undefined>;
}

export class PaymentStorage implements IPaymentStorage {
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [createdPayment] = await db
      .insert(payments)
      .values({
        ...payment,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdPayment;
  }

  async getPaymentById(id: number): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByOrderId(orderId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.order_id, orderId));
  }

  async getAllPayments(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ payments: Payment[], total: number }> {
    let whereConditions = [];

    if (params?.status) {
      whereConditions.push(eq(payments.status, params.status));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(payments)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    const paymentsList = await db
      .select()
      .from(payments)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { payments: paymentsList, total };
  }

  async getClientPayments(clientId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.payer_id, clientId));
  }

  async getDeveloperPayments(developerId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.payee_id, developerId));
  }

  async getBuyerPayments(buyerId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.payer_id, buyerId));
  }

  async getSellerPayments(sellerId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.payee_id, sellerId));
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  async releaseEscrow(id: number, buyerId: number): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set({
        status: 'released',
        updated_at: new Date()
      })
      .where(and(eq(payments.id, id), eq(payments.payer_id, buyerId)))
      .returning();
    return updatedPayment;
  }
}

export const paymentStorage = new PaymentStorage();
EOF

echo "✅ Marketplace modules (product, order, payment) created"

