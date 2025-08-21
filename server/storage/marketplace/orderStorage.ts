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
