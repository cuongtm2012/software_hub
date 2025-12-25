#!/bin/bash

# Marketplace - Cart Storage
cat > server/storage/marketplace/cartStorage.ts << 'EOF'
import { db } from "../../db";
import { cartItems, type CartItem, type InsertCartItem } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface ICartStorage {
  addToCart(item: InsertCartItem, buyerId: number): Promise<CartItem>;
  getCartItems(buyerId: number): Promise<CartItem[]>;
  updateCartItemQuantity(id: number, quantity: number, buyerId: number): Promise<CartItem | undefined>;
  removeFromCart(id: number, buyerId: number): Promise<boolean>;
  clearCart(buyerId: number): Promise<boolean>;
}

export class CartStorage implements ICartStorage {
  async addToCart(item: InsertCartItem, buyerId: number): Promise<CartItem> {
    const [cartItem] = await db
      .insert(cartItems)
      .values({
        ...item,
        buyer_id: buyerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return cartItem;
  }

  async getCartItems(buyerId: number): Promise<CartItem[]> {
    return await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.buyer_id, buyerId));
  }

  async updateCartItemQuantity(id: number, quantity: number, buyerId: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({
        quantity,
        updated_at: new Date()
      })
      .where(and(eq(cartItems.id, id), eq(cartItems.buyer_id, buyerId)))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number, buyerId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, id), eq(cartItems.buyer_id, buyerId)));
    return result.rowCount > 0;
  }

  async clearCart(buyerId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.buyer_id, buyerId));
    return result.rowCount > 0;
  }
}

export const cartStorage = new CartStorage();
EOF

# Marketplace - Product Review Storage
cat > server/storage/marketplace/productReviewStorage.ts << 'EOF'
import { db } from "../../db";
import { productReviews, type ProductReview, type InsertProductReview } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IProductReviewStorage {
  createProductReview(review: InsertProductReview, buyerId: number): Promise<ProductReview>;
  getProductReviewsByProductId(productId: number): Promise<ProductReview[]>;
  getBuyerReviewForProduct(buyerId: number, productId: number): Promise<ProductReview | undefined>;
  updateProductReview(id: number, buyerId: number, reviewData: Partial<InsertProductReview>): Promise<ProductReview | undefined>;
  deleteProductReview(id: number, buyerId: number): Promise<boolean>;
}

export class ProductReviewStorage implements IProductReviewStorage {
  async createProductReview(review: InsertProductReview, buyerId: number): Promise<ProductReview> {
    const [createdReview] = await db
      .insert(productReviews)
      .values({
        ...review,
        buyer_id: buyerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdReview;
  }

  async getProductReviewsByProductId(productId: number): Promise<ProductReview[]> {
    return await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.product_id, productId));
  }

  async getBuyerReviewForProduct(buyerId: number, productId: number): Promise<ProductReview | undefined> {
    const [review] = await db
      .select()
      .from(productReviews)
      .where(and(eq(productReviews.buyer_id, buyerId), eq(productReviews.product_id, productId)));
    return review;
  }

  async updateProductReview(id: number, buyerId: number, reviewData: Partial<InsertProductReview>): Promise<ProductReview | undefined> {
    const [updatedReview] = await db
      .update(productReviews)
      .set({
        ...reviewData,
        updated_at: new Date()
      })
      .where(and(eq(productReviews.id, id), eq(productReviews.buyer_id, buyerId)))
      .returning();
    return updatedReview;
  }

  async deleteProductReview(id: number, buyerId: number): Promise<boolean> {
    const result = await db
      .delete(productReviews)
      .where(and(eq(productReviews.id, id), eq(productReviews.buyer_id, buyerId)));
    return result.rowCount > 0;
  }
}

export const productReviewStorage = new ProductReviewStorage();
EOF

# Marketplace - Seller Storage
cat > server/storage/marketplace/sellerStorage.ts << 'EOF'
import { db } from "../../db";
import { sellerProfiles, type SellerProfile, type InsertSellerProfile } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface ISellerStorage {
  createSellerProfile(profile: InsertSellerProfile, sellerId: number): Promise<SellerProfile>;
  getSellerProfileById(id: number): Promise<SellerProfile | undefined>;
  getSellerProfileByUserId(userId: number): Promise<SellerProfile | undefined>;
  getAllSellerProfiles(limit?: number, offset?: number): Promise<{ sellers: SellerProfile[], total: number }>;
  updateSellerProfile(id: number, profile: Partial<InsertSellerProfile>): Promise<SellerProfile | undefined>;
}

export class SellerStorage implements ISellerStorage {
  async createSellerProfile(profile: InsertSellerProfile, sellerId: number): Promise<SellerProfile> {
    const [createdProfile] = await db
      .insert(sellerProfiles)
      .values({
        ...profile,
        user_id: sellerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdProfile;
  }

  async getSellerProfileById(id: number): Promise<SellerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.id, id));
    return profile;
  }

  async getSellerProfileByUserId(userId: number): Promise<SellerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.user_id, userId));
    return profile;
  }

  async getAllSellerProfiles(limit?: number, offset?: number): Promise<{ sellers: SellerProfile[], total: number }> {
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(sellerProfiles);

    const total = countResult?.count || 0;

    const sellersList = await db
      .select()
      .from(sellerProfiles)
      .limit(limit || 10)
      .offset(offset || 0);

    return { sellers: sellersList, total };
  }

  async updateSellerProfile(id: number, profile: Partial<InsertSellerProfile>): Promise<SellerProfile | undefined> {
    const [updatedProfile] = await db
      .update(sellerProfiles)
      .set({
        ...profile,
        updated_at: new Date()
      })
      .where(eq(sellerProfiles.id, id))
      .returning();
    return updatedProfile;
  }
}

export const sellerStorage = new SellerStorage();
EOF

# Marketplace - Support Storage
cat > server/storage/marketplace/supportStorage.ts << 'EOF'
import { db } from "../../db";
import { supportTickets, type SupportTicket, type InsertSupportTicket } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface ISupportStorage {
  createSupportTicket(ticket: InsertSupportTicket, userId: number): Promise<SupportTicket>;
  getSupportTicketById(id: number): Promise<SupportTicket | undefined>;
  getUserSupportTickets(userId: number): Promise<SupportTicket[]>;
  getAllSupportTickets(params?: { status?: string; limit?: number; offset?: number }): Promise<{ tickets: SupportTicket[], total: number }>;
  updateSupportTicketStatus(id: number, status: string): Promise<SupportTicket | undefined>;
  assignSupportTicket(id: number, assignedTo: number): Promise<SupportTicket | undefined>;
}

export class SupportStorage implements ISupportStorage {
  async createSupportTicket(ticket: InsertSupportTicket, userId: number): Promise<SupportTicket> {
    const [createdTicket] = await db
      .insert(supportTickets)
      .values({
        ...ticket,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdTicket;
  }

  async getSupportTicketById(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id));
    return ticket;
  }

  async getUserSupportTickets(userId: number): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.user_id, userId));
  }

  async getAllSupportTickets(params?: { status?: string; limit?: number; offset?: number }): Promise<{ tickets: SupportTicket[], total: number }> {
    let whereConditions = [];

    if (params?.status) {
      whereConditions.push(eq(supportTickets.status, params.status));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(supportTickets)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    const ticketsList = await db
      .select()
      .from(supportTickets)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { tickets: ticketsList, total };
  }

  async updateSupportTicketStatus(id: number, status: string): Promise<SupportTicket | undefined> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }

  async assignSupportTicket(id: number, assignedTo: number): Promise<SupportTicket | undefined> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({
        assigned_to: assignedTo,
        updated_at: new Date()
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }
}

export const supportStorage = new SupportStorage();
EOF

# Marketplace - Analytics Storage
cat > server/storage/marketplace/analyticsStorage.ts << 'EOF'
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
EOF

# Marketplace index
cat > server/storage/marketplace/index.ts << 'EOF'
export * from './productStorage';
export * from './orderStorage';
export * from './paymentStorage';
export * from './cartStorage';
export * from './productReviewStorage';
export * from './sellerStorage';
export * from './supportStorage';
export * from './analyticsStorage';
EOF

echo "✅ Marketplace modules completed (cart, reviews, seller, support, analytics)"

# Service module - Service Request Storage
cat > server/storage/service/serviceRequestStorage.ts << 'EOF'
import { db } from "../../db";
import { serviceRequests, type ServiceRequest, type InsertServiceRequest } from "@shared/schema";
import { eq, and, ilike, sql } from "drizzle-orm";

export interface IServiceRequestStorage {
  createServiceRequest(request: InsertServiceRequest, clientId: number): Promise<ServiceRequest>;
  getServiceRequestById(id: number): Promise<ServiceRequest | undefined>;
  getAllServiceRequests(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ requests: ServiceRequest[], total: number }>;
  getClientServiceRequests(clientId: number, status?: string): Promise<ServiceRequest[]>;
  getProviderServiceRequests(providerId: number, status?: string): Promise<ServiceRequest[]>;
  updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest | undefined>;
  assignProviderToServiceRequest(id: number, providerId: number): Promise<ServiceRequest | undefined>;
}

export class ServiceRequestStorage implements IServiceRequestStorage {
  async createServiceRequest(request: InsertServiceRequest, clientId: number): Promise<ServiceRequest> {
    const [createdRequest] = await db
      .insert(serviceRequests)
      .values({
        ...request,
        client_id: clientId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdRequest;
  }

  async getServiceRequestById(id: number): Promise<ServiceRequest | undefined> {
    const [request] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id));
    return request;
  }

  async getAllServiceRequests(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ requests: ServiceRequest[], total: number }> {
    let whereConditions = [];

    if (params?.status) {
      whereConditions.push(eq(serviceRequests.status, params.status));
    }

    if (params?.search) {
      whereConditions.push(ilike(serviceRequests.title, `%${params.search}%`));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(serviceRequests)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    const requestsList = await db
      .select()
      .from(serviceRequests)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { requests: requestsList, total };
  }

  async getClientServiceRequests(clientId: number, status?: string): Promise<ServiceRequest[]> {
    let whereConditions = [eq(serviceRequests.client_id, clientId)];

    if (status) {
      whereConditions.push(eq(serviceRequests.status, status));
    }

    return await db
      .select()
      .from(serviceRequests)
      .where(and(...whereConditions));
  }

  async getProviderServiceRequests(providerId: number, status?: string): Promise<ServiceRequest[]> {
    let whereConditions = [eq(serviceRequests.provider_id, providerId)];

    if (status) {
      whereConditions.push(eq(serviceRequests.status, status));
    }

    return await db
      .select()
      .from(serviceRequests)
      .where(and(...whereConditions));
  }

  async updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest | undefined> {
    const [updatedRequest] = await db
      .update(serviceRequests)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(serviceRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async assignProviderToServiceRequest(id: number, providerId: number): Promise<ServiceRequest | undefined> {
    const [updatedRequest] = await db
      .update(serviceRequests)
      .set({
        provider_id: providerId,
        updated_at: new Date()
      })
      .where(eq(serviceRequests.id, id))
      .returning();
    return updatedRequest;
  }
}

export const serviceRequestStorage = new ServiceRequestStorage();
EOF

# Service module - Service Quotation Storage
cat > server/storage/service/serviceQuotationStorage.ts << 'EOF'
import { db } from "../../db";
import { serviceQuotations, type ServiceQuotation, type InsertServiceQuotation } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IServiceQuotationStorage {
  createServiceQuotation(quotation: InsertServiceQuotation, providerId: number): Promise<ServiceQuotation>;
  getServiceQuotationById(id: number): Promise<ServiceQuotation | undefined>;
  getQuotationsByServiceRequestId(serviceRequestId: number): Promise<ServiceQuotation[]>;
  getProviderQuotations(providerId: number): Promise<ServiceQuotation[]>;
  updateQuotationStatus(id: number, status: string): Promise<ServiceQuotation | undefined>;
}

export class ServiceQuotationStorage implements IServiceQuotationStorage {
  async createServiceQuotation(quotation: InsertServiceQuotation, providerId: number): Promise<ServiceQuotation> {
    const [createdQuotation] = await db
      .insert(serviceQuotations)
      .values({
        ...quotation,
        provider_id: providerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdQuotation;
  }

  async getServiceQuotationById(id: number): Promise<ServiceQuotation | undefined> {
    const [quotation] = await db
      .select()
      .from(serviceQuotations)
      .where(eq(serviceQuotations.id, id));
    return quotation;
  }

  async getQuotationsByServiceRequestId(serviceRequestId: number): Promise<ServiceQuotation[]> {
    return await db
      .select()
      .from(serviceQuotations)
      .where(eq(serviceQuotations.service_request_id, serviceRequestId));
  }

  async getProviderQuotations(providerId: number): Promise<ServiceQuotation[]> {
    return await db
      .select()
      .from(serviceQuotations)
      .where(eq(serviceQuotations.provider_id, providerId));
  }

  async updateQuotationStatus(id: number, status: string): Promise<ServiceQuotation | undefined> {
    const [updatedQuotation] = await db
      .update(serviceQuotations)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(serviceQuotations.id, id))
      .returning();
    return updatedQuotation;
  }
}

export const serviceQuotationStorage = new ServiceQuotationStorage();
EOF

# Service module - Service Project Storage
cat > server/storage/service/serviceProjectStorage.ts << 'EOF'
import { db } from "../../db";
import { serviceProjects, type ServiceProject, type InsertServiceProject } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IServiceProjectStorage {
  createServiceProject(project: InsertServiceProject): Promise<ServiceProject>;
  getServiceProjectById(id: number): Promise<ServiceProject | undefined>;
  getClientServiceProjects(clientId: number, status?: string): Promise<ServiceProject[]>;
  getProviderServiceProjects(providerId: number, status?: string): Promise<ServiceProject[]>;
  updateServiceProjectStatus(id: number, status: string): Promise<ServiceProject | undefined>;
  updateServiceProjectProgress(id: number, progress: number): Promise<ServiceProject | undefined>;
}

export class ServiceProjectStorage implements IServiceProjectStorage {
  async createServiceProject(project: InsertServiceProject): Promise<ServiceProject> {
    const [createdProject] = await db
      .insert(serviceProjects)
      .values({
        ...project,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdProject;
  }

  async getServiceProjectById(id: number): Promise<ServiceProject | undefined> {
    const [project] = await db
      .select()
      .from(serviceProjects)
      .where(eq(serviceProjects.id, id));
    return project;
  }

  async getClientServiceProjects(clientId: number, status?: string): Promise<ServiceProject[]> {
    let whereConditions = [eq(serviceProjects.client_id, clientId)];

    if (status) {
      whereConditions.push(eq(serviceProjects.status, status));
    }

    return await db
      .select()
      .from(serviceProjects)
      .where(and(...whereConditions));
  }

  async getProviderServiceProjects(providerId: number, status?: string): Promise<ServiceProject[]> {
    let whereConditions = [eq(serviceProjects.provider_id, providerId)];

    if (status) {
      whereConditions.push(eq(serviceProjects.status, status));
    }

    return await db
      .select()
      .from(serviceProjects)
      .where(and(...whereConditions));
  }

  async updateServiceProjectStatus(id: number, status: string): Promise<ServiceProject | undefined> {
    const [updatedProject] = await db
      .update(serviceProjects)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(serviceProjects.id, id))
      .returning();
    return updatedProject;
  }

  async updateServiceProjectProgress(id: number, progress: number): Promise<ServiceProject | undefined> {
    const [updatedProject] = await db
      .update(serviceProjects)
      .set({
        progress,
        updated_at: new Date()
      })
      .where(eq(serviceProjects.id, id))
      .returning();
    return updatedProject;
  }
}

export const serviceProjectStorage = new ServiceProjectStorage();
EOF

# Service module - Service Payment Storage
cat > server/storage/service/servicePaymentStorage.ts << 'EOF'
import { db } from "../../db";
import { servicePayments, type ServicePayment, type InsertServicePayment } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IServicePaymentStorage {
  createServicePayment(payment: InsertServicePayment): Promise<ServicePayment>;
  getServicePaymentById(id: number): Promise<ServicePayment | undefined>;
  getPaymentsByServiceProjectId(serviceProjectId: number): Promise<ServicePayment[]>;
  updateServicePaymentStatus(id: number, status: string): Promise<ServicePayment | undefined>;
}

export class ServicePaymentStorage implements IServicePaymentStorage {
  async createServicePayment(payment: InsertServicePayment): Promise<ServicePayment> {
    const [createdPayment] = await db
      .insert(servicePayments)
      .values({
        ...payment,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdPayment;
  }

  async getServicePaymentById(id: number): Promise<ServicePayment | undefined> {
    const [payment] = await db
      .select()
      .from(servicePayments)
      .where(eq(servicePayments.id, id));
    return payment;
  }

  async getPaymentsByServiceProjectId(serviceProjectId: number): Promise<ServicePayment[]> {
    return await db
      .select()
      .from(servicePayments)
      .where(eq(servicePayments.service_project_id, serviceProjectId));
  }

  async updateServicePaymentStatus(id: number, status: string): Promise<ServicePayment | undefined> {
    const [updatedPayment] = await db
      .update(servicePayments)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(servicePayments.id, id))
      .returning();
    return updatedPayment;
  }
}

export const servicePaymentStorage = new ServicePaymentStorage();
EOF

# Service module index
cat > server/storage/service/index.ts << 'EOF'
export * from './serviceRequestStorage';
export * from './serviceQuotationStorage';
export * from './serviceProjectStorage';
export * from './servicePaymentStorage';
EOF

echo "✅ Service modules created"
echo "✅ All domain modules created successfully!"

