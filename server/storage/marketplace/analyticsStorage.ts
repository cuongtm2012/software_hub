import { db } from "../../db";
import { orders, products, payments } from "@shared/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";

export interface IAnalyticsStorage {
  getSellerSalesAnalytics(sellerId: number, startDate?: Date, endDate?: Date): Promise<{
    totalSales: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  }>;
  getTopSellingProducts(sellerId: number, limit?: number): Promise<any[]>;
}

export class AnalyticsStorage implements IAnalyticsStorage {
  async getSellerSalesAnalytics(sellerId: number, startDate?: Date, endDate?: Date): Promise<{
    totalSales: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  }> {
    let dateConditions = [eq(payments.payee_id, sellerId)];

    if (startDate) {
      dateConditions.push(gte(payments.created_at, startDate));
    }

    if (endDate) {
      dateConditions.push(lte(payments.created_at, endDate));
    }

    const [result] = await db
      .select({
        totalSales: sql<number>`COUNT(*)`,
        totalRevenue: sql<number>`SUM(${payments.amount})`,
        totalOrders: sql<number>`COUNT(DISTINCT ${payments.order_id})`
      })
      .from(payments)
      .where(and(...dateConditions));

    const totalSales = result?.totalSales || 0;
    const totalRevenue = result?.totalRevenue || 0;
    const totalOrders = result?.totalOrders || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalSales,
      totalRevenue,
      totalOrders,
      averageOrderValue
    };
  }

  async getTopSellingProducts(sellerId: number, limit: number = 10): Promise<any[]> {
    // This would need a proper join with order_items table
    // Simplified version for now
    return await db
      .select()
      .from(products)
      .where(eq(products.seller_id, sellerId))
      .limit(limit);
  }
}

export const analyticsStorage = new AnalyticsStorage();
