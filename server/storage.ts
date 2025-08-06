import { 
  users, softwares, categories, reviews, userDownloads,
  externalRequests, quotes, messages, portfolios, portfolioReviews,
  products, orders, orderItems, payments, productReviews,
  sellerProfiles, cartItems, supportTickets, salesAnalytics,
  serviceRequests, serviceQuotations, serviceProjects, servicePayments,
  userPresence,
  type User, type InsertUser, 
  type Software, type InsertSoftware,
  type Category, type InsertCategory,
  type Review, type InsertReview,
  type ExternalRequest, type InsertExternalRequest,
  type Quote, type InsertQuote,
  type Message, type InsertMessage,
  type Portfolio, type InsertPortfolio,
  type PortfolioReview, type InsertPortfolioReview,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Payment, type InsertPayment,
  type ProductReview, type InsertProductReview,
  type UserDownload, type InsertUserDownload,
  type SellerProfile, type InsertSellerProfile,
  type CartItem, type InsertCartItem,
  type SupportTicket, type InsertSupportTicket,
  type SalesAnalytics, type InsertSalesAnalytics,
  type ServiceRequest, type InsertServiceRequest,
  type ServiceQuotation, type InsertServiceQuotation,
  type ServiceProject, type InsertServiceProject,
  type ServicePayment, type InsertServicePayment,
  type UserPresence, type InsertUserPresence
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, ilike, inArray, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserProfile(userId: number, profileData: any): Promise<User | undefined>;
  
  // Admin User Management
  getAllUsers(params?: { role?: string; search?: string; limit?: number; offset?: number }): Promise<{ users: User[], total: number }>;
  deleteUser(id: number): Promise<boolean>;
  
  // User Downloads
  createUserDownload(userId: number, softwareId: number, version: string): Promise<UserDownload>;
  getUserDownloads(userId: number): Promise<UserDownload[]>;
  
  // User Reviews Management
  getUserReviews(userId: number): Promise<Review[]>;
  updateReview(id: number, userId: number, reviewData: Partial<InsertReview>): Promise<Review | undefined>;
  
  // Categories
  createCategory(category: InsertCategory): Promise<Category>;
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  
  // Software
  createSoftware(software: InsertSoftware, userId: number): Promise<Software>;
  getSoftwareById(id: number): Promise<Software | undefined>;
  updateSoftware(id: number, software: Partial<InsertSoftware>): Promise<Software | undefined>;
  deleteSoftware(id: number): Promise<boolean>;
  updateSoftwareStatus(id: number, status: 'approved' | 'rejected'): Promise<Software | undefined>;
  getSoftwareList(params: {
    category?: number;
    platform?: string;
    search?: string;
    status?: 'pending' | 'approved' | 'rejected';
    limit?: number;
    offset?: number;
  }): Promise<{ softwares: Software[], total: number }>;
  
  // Reviews
  createReview(review: InsertReview, userId: number): Promise<Review>;
  getReviewsBySoftwareId(softwareId: number): Promise<Review[]>;
  deleteReview(id: number, userId: number): Promise<boolean>;
  
  // External Project Requests
  createExternalRequest(request: InsertExternalRequest): Promise<ExternalRequest>;
  getExternalRequests(status?: string, limit?: number, offset?: number): Promise<{ requests: ExternalRequest[], total: number }>;
  getExternalRequestById(id: number): Promise<ExternalRequest | undefined>;
  updateExternalRequestStatus(id: number, status: string): Promise<ExternalRequest | undefined>;
  convertExternalRequestToProject(id: number, updates: Partial<InsertExternalRequest>): Promise<ExternalRequest>;
  getAllExternalRequests(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ requests: ExternalRequest[], total: number }>;
  assignDeveloperToExternalRequest(id: number, developerId: number): Promise<ExternalRequest | undefined>;
  getUserExternalRequests(email: string): Promise<ExternalRequest[]>;
  getAvailableProjects(status?: string): Promise<ExternalRequest[]>;
  getAllProjects(status?: string): Promise<ExternalRequest[]>;
  getClientProjects(clientId: number, status?: string): Promise<ExternalRequest[]>;
  getDeveloperProjects(developerId: number, status?: string): Promise<ExternalRequest[]>;
  getProjectsCount(status?: string): Promise<{ count: number }>;
  
  // Phase 2: Project Management (now using external requests)
  createProject(project: InsertExternalRequest, clientId?: number): Promise<ExternalRequest>; // clientId optional for external requests
  getProjectById(id: number): Promise<ExternalRequest | undefined>;
  getProjectsByClientId(clientId: number): Promise<ExternalRequest[]>;
  getProjectsForDevelopers(status?: string, limit?: number, offset?: number): Promise<{ projects: ExternalRequest[], total: number }>;
  updateProjectStatus(id: number, status: string): Promise<ExternalRequest | undefined>;
  
  // Quotes
  createQuote(quote: InsertQuote, developerId: number): Promise<Quote>;
  getQuotesByProjectId(projectId: number): Promise<Quote[]>;
  getQuotesByDeveloperId(developerId: number): Promise<Quote[]>;
  updateQuoteStatus(id: number, status: string): Promise<Quote | undefined>;
  
  // Messages
  sendMessage(message: InsertMessage, senderId: number): Promise<Message>;
  getMessagesByProjectId(projectId: number): Promise<Message[]>;
  
  // Portfolios
  createPortfolio(portfolio: InsertPortfolio, developerId: number): Promise<Portfolio>;
  getPortfolioById(id: number): Promise<Portfolio | undefined>;
  getPortfoliosByDeveloperId(developerId: number): Promise<Portfolio[]>;
  getAllPortfolios(limit?: number, offset?: number): Promise<{ portfolios: Portfolio[], total: number }>;
  updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined>;
  deletePortfolio(id: number, developerId: number): Promise<boolean>;
  
  // Portfolio Reviews
  createPortfolioReview(review: InsertPortfolioReview, userId: number): Promise<PortfolioReview>;
  getPortfolioReviewsByPortfolioId(portfolioId: number): Promise<PortfolioReview[]>;
  deletePortfolioReview(id: number, userId: number): Promise<boolean>;
  
  // Phase 3: Marketplace
  // Products
  createProduct(product: InsertProduct, sellerId: number): Promise<Product>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }>;
  getProductsBySellerId(sellerId: number): Promise<Product[]>;
  searchProducts(search: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }>;
  updateProduct(id: number, product: Partial<InsertProduct>, sellerId: number): Promise<Product | undefined>;
  deleteProduct(id: number, sellerId: number): Promise<boolean>;
  
  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[], buyerId: number): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByBuyerId(buyerId: number): Promise<Order[]>;
  getOrdersBySellerId(sellerId: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentById(id: number): Promise<Payment | undefined>;
  getPaymentsByOrderId(orderId: number): Promise<Payment[]>;
  releaseEscrow(id: number, buyerId: number): Promise<Payment | undefined>;
  
  // Product Reviews
  createProductReview(review: InsertProductReview, buyerId: number): Promise<ProductReview>;
  getProductReviewsByProductId(productId: number): Promise<ProductReview[]>;
  getProductReviewsByBuyerId(buyerId: number): Promise<ProductReview[]>;
  deleteProductReview(id: number, buyerId: number): Promise<boolean>;
  
  // Seller Profile Management
  createSellerProfile(profile: InsertSellerProfile, userId: number): Promise<SellerProfile>;
  getSellerProfile(userId: number): Promise<SellerProfile | undefined>;
  updateSellerProfile(userId: number, profile: Partial<InsertSellerProfile>): Promise<SellerProfile | undefined>;
  updateSellerVerificationStatus(userId: number, status: 'pending' | 'verified' | 'rejected'): Promise<SellerProfile | undefined>;
  getAllSellersForVerification(): Promise<SellerProfile[]>;
  
  // Cart Management
  addToCart(item: InsertCartItem, userId: number): Promise<CartItem>;
  getCartItems(userId: number): Promise<CartItem[]>;
  removeFromCart(itemId: number, userId: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Support Tickets
  createSupportTicket(ticket: InsertSupportTicket, buyerId: number): Promise<SupportTicket>;
  getSupportTickets(userId: number): Promise<SupportTicket[]>;
  updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  
  // Sales Analytics
  createSalesAnalytics(analytics: InsertSalesAnalytics): Promise<SalesAnalytics>;
  getSalesAnalytics(sellerId: number, filters?: { startDate?: Date; endDate?: Date; }): Promise<SalesAnalytics[]>;
  
  // IT Services
  // Service Requests
  createServiceRequest(request: InsertServiceRequest, clientId: number): Promise<ServiceRequest>;
  getServiceRequestById(id: number): Promise<ServiceRequest | undefined>;
  getServiceRequestsByClient(clientId: number): Promise<ServiceRequest[]>;
  getAllServiceRequests(): Promise<ServiceRequest[]>;
  updateServiceRequest(id: number, request: Partial<InsertServiceRequest>): Promise<ServiceRequest | undefined>;
  updateServiceRequestStatus(id: number, status: string, adminNotes?: string): Promise<ServiceRequest | undefined>;
  
  // Service Quotations
  createServiceQuotation(quotation: InsertServiceQuotation, adminId: number): Promise<ServiceQuotation>;
  getServiceQuotationById(id: number): Promise<ServiceQuotation | undefined>;
  getServiceQuotationsByRequest(requestId: number): Promise<ServiceQuotation[]>;
  getAllServiceQuotations(): Promise<ServiceQuotation[]>;
  updateServiceQuotation(id: number, quotation: Partial<InsertServiceQuotation>): Promise<ServiceQuotation | undefined>;
  updateServiceQuotationStatus(id: number, status: string, clientResponse?: string): Promise<ServiceQuotation | undefined>;
  
  // Service Projects
  createServiceProject(project: InsertServiceProject): Promise<ServiceProject>;
  getServiceProjectById(id: number): Promise<ServiceProject | undefined>;
  getServiceProjectsByClient(clientId: number): Promise<ServiceProject[]>;
  getServiceProjectsByAdmin(adminId: number): Promise<ServiceProject[]>;
  getAllServiceProjects(): Promise<ServiceProject[]>;
  updateServiceProject(id: number, project: Partial<InsertServiceProject>): Promise<ServiceProject | undefined>;
  updateServiceProjectProgress(id: number, progress: number, adminNotes?: string): Promise<ServiceProject | undefined>;
  
  // Service Payments
  createServicePayment(payment: InsertServicePayment): Promise<ServicePayment>;
  getServicePaymentById(id: number): Promise<ServicePayment | undefined>;
  getServicePaymentsByQuotation(quotationId: number): Promise<ServicePayment[]>;
  getServicePaymentsByClient(clientId: number): Promise<ServicePayment[]>;
  updateServicePaymentStatus(id: number, status: string): Promise<ServicePayment | undefined>;
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  // Admin methods
  async getAllUsers(params?: { role?: string; search?: string; limit?: number; offset?: number }): Promise<{ users: User[], total: number }> {
    try {
      // Build conditions array
      const conditions = [];
      
      if (params?.role && params.role !== 'all') {
        conditions.push(eq(users.role, params.role as any));
      }
      
      if (params?.search) {
        conditions.push(
          or(
            ilike(users.name, `%${params.search}%`),
            ilike(users.email, `%${params.search}%`)
          )
        );
      }
      
      // Get total count
      let countQuery = db.select({ count: sql<number>`count(*)` }).from(users);
      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }
      
      const totalResult = await countQuery;
      const total = totalResult[0]?.count || 0;
      
      // Build main query with presence data
      let mainQuery = db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          created_at: users.created_at,
          is_online: userPresence.is_online,
          last_seen: userPresence.last_seen,
        })
        .from(users)
        .leftJoin(userPresence, eq(users.id, userPresence.user_id));
      
      if (conditions.length > 0) {
        mainQuery = mainQuery.where(and(...conditions));
      }
      
      mainQuery = mainQuery.orderBy(desc(users.created_at));
      
      if (params?.limit) {
        mainQuery = mainQuery.limit(params.limit);
      }
      
      if (params?.offset) {
        mainQuery = mainQuery.offset(params.offset);
      }
      
      const usersList = await mainQuery;
      
      return {
        users: usersList,
        total: Number(total)
      };
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return {
        users: [],
        total: 0
      };
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async updateUserProfile(userId: number, profileData: any): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        profile_data: profileData,
        updated_at: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Categories
  async createCategory(category: InsertCategory): Promise<Category> {
    const [createdCategory] = await db.insert(categories).values(category).returning();
    return createdCategory;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  // Software
  async createSoftware(softwareData: InsertSoftware, userId: number): Promise<Software> {
    const [software] = await db
      .insert(softwares)
      .values({
        ...softwareData,
        created_by: userId
      })
      .returning();
    return software;
  }

  async getSoftwareById(id: number): Promise<Software | undefined> {
    const [software] = await db
      .select()
      .from(softwares)
      .where(eq(softwares.id, id));
    return software;
  }

  async updateSoftwareStatus(id: number, status: 'approved' | 'rejected'): Promise<Software | undefined> {
    const [updatedSoftware] = await db
      .update(softwares)
      .set({ status })
      .where(eq(softwares.id, id))
      .returning();
    return updatedSoftware;
  }

  async getSoftwareList(params: {
    category?: number;
    platform?: string;
    search?: string;
    status?: 'pending' | 'approved' | 'rejected';
    limit?: number;
    offset?: number;
  }): Promise<{ softwares: Software[], total: number }> {
    try {
      // Build conditions
      const conditions = [];
      conditions.push(eq(softwares.status, params.status || 'approved'));
      
      if (params.category) {
        conditions.push(eq(softwares.category_id, params.category));
      }
      
      if (params.search) {
        conditions.push(
          or(
            ilike(softwares.name, `%${params.search}%`),
            ilike(softwares.description, `%${params.search}%`)
          )
        );
      }
      
      // Get total count first
      let countQuery = db.select({ count: sql<number>`count(*)` }).from(softwares);
      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }
      
      const totalResult = await countQuery;
      const total = totalResult[0]?.count || 0;
      
      // Build main query
      let mainQuery = db.select().from(softwares);
      if (conditions.length > 0) {
        mainQuery = mainQuery.where(and(...conditions));
      }
      
      mainQuery = mainQuery.orderBy(desc(softwares.created_at));
      
      if (params.limit) {
        mainQuery = mainQuery.limit(params.limit);
      }
      
      if (params.offset) {
        mainQuery = mainQuery.offset(params.offset);
      }
      
      const softwareList = await mainQuery;
      
      return {
        softwares: softwareList,
        total: Number(total)
      };
    } catch (error) {
      console.error('Error in getSoftwareList:', error);
      return {
        softwares: [],
        total: 0
      };
    }
  }

  async updateSoftware(id: number, updateData: Partial<InsertSoftware>): Promise<Software | undefined> {
    const [updatedSoftware] = await db
      .update(softwares)
      .set(updateData)
      .where(eq(softwares.id, id))
      .returning();
    return updatedSoftware;
  }

  async getAdminSoftwareList(filters: any, limit: number, offset: number) {
    try {
      const conditions = [];
      
      // Apply filters
      if (filters.search) {
        conditions.push(
          or(
            ilike(softwares.name, `%${filters.search}%`),
            ilike(softwares.description, `%${filters.search}%`)
          )
        );
      }
      
      if (filters.status && filters.status !== 'all') {
        conditions.push(eq(softwares.status, filters.status));
      }
      
      // Get total count first
      let countQuery = db.select({ count: sql<number>`count(*)` }).from(softwares);
      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }
      
      const totalResult = await countQuery;
      const count = totalResult[0]?.count || 0;
      
      // Build main query
      let mainQuery = db.select().from(softwares);
      if (conditions.length > 0) {
        mainQuery = mainQuery.where(and(...conditions));
      }
      
      // Apply pagination and ordering
      const results = await mainQuery
        .limit(limit)
        .offset(offset)
        .orderBy(desc(softwares.created_at));
      
      return {
        softwares: results,
        total: count,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Error in getAdminSoftwareList:', error);
      return {
        softwares: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }
  }

  async updateSoftwareAdmin(id: number, updates: Partial<any>) {
    try {
      const result = await db
        .update(softwares)
        .set(updates)
        .where(eq(softwares.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error updating software:', error);
      return null;
    }
  }

  async deleteSoftware(id: number): Promise<boolean> {
    const result = await db
      .delete(softwares)
      .where(eq(softwares.id, id))
      .returning({ id: softwares.id });
    
    return result.length > 0;
  }

  // Reviews
  async createReview(reviewData: InsertReview, userId: number): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values({
        ...reviewData,
        user_id: userId
      })
      .returning();
    return review;
  }

  async getReviewsBySoftwareId(softwareId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.target_type, 'software'),
          eq(reviews.target_id, softwareId)
        )
      )
      .orderBy(desc(reviews.created_at));
  }

  async deleteReview(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(reviews)
      .where(
        and(
          eq(reviews.id, id),
          eq(reviews.user_id, userId)
        )
      )
      .returning({ id: reviews.id });
    
    return result.length > 0;
  }

  // External Project Requests
  async createExternalRequest(request: InsertExternalRequest): Promise<ExternalRequest> {
    const [result] = await db
      .insert(externalRequests)
      .values(request)
      .returning();
      
    return result;
  }
  
  async getExternalRequests(status?: string, limit: number = 20, offset: number = 0): Promise<{ requests: ExternalRequest[], total: number }> {
    try {
      const conditions = [];
      
      if (status) {
        conditions.push(eq(externalRequests.status, status as any));
      }
      
      // Get total count
      let countQuery = db.select({ count: sql<number>`count(*)` }).from(externalRequests);
      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }
      
      const totalResult = await countQuery;
      const total = totalResult[0]?.count || 0;
      
      // Build main query
      let mainQuery = db.select().from(externalRequests);
      if (conditions.length > 0) {
        mainQuery = mainQuery.where(and(...conditions));
      }
      
      const requests = await mainQuery
        .orderBy(desc(externalRequests.created_at))
        .limit(limit)
        .offset(offset);
    
      return {
        requests,
        total: Number(total)
      };
    } catch (error) {
      console.error('Error in getExternalRequests:', error);
      return {
        requests: [],
        total: 0
      };
    }
  }
  
  async getExternalRequestById(id: number): Promise<ExternalRequest | undefined> {
    const [request] = await db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.id, id));
      
    return request;
  }
  
  async updateExternalRequestStatus(id: number, status: string): Promise<ExternalRequest | undefined> {
    const [request] = await db
      .update(externalRequests)
      .set({ status })
      .where(eq(externalRequests.id, id))
      .returning();
      
    return request;
  }
  
  async convertExternalRequestToProject(id: number, updates: Partial<InsertExternalRequest>): Promise<ExternalRequest> {
    // Update the external request with project data and change status
    const [result] = await db
      .update(externalRequests)
      .set({
        ...updates,
        status: 'converted',
      })
      .where(eq(externalRequests.id, id))
      .returning();
    
    if (!result) {
      throw new Error("External request not found");
    }
    
    return result;
  }

  async getAllExternalRequests(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ requests: ExternalRequest[], total: number }> {
    let baseQuery = db.select().from(externalRequests);
    
    // Apply filters
    if (params?.status && params.status !== 'all') {
      baseQuery = baseQuery.where(eq(externalRequests.status, params.status));
    }
    
    if (params?.search) {
      baseQuery = baseQuery.where(
        or(
          ilike(externalRequests.name, `%${params.search}%`),
          ilike(externalRequests.email, `%${params.search}%`),
          ilike(externalRequests.project_description, `%${params.search}%`)
        )
      );
    }
    
    // Get total count first
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(externalRequests);
    if (params?.status && params.status !== 'all') {
      countQuery.where(eq(externalRequests.status, params.status));
    }
    if (params?.search) {
      countQuery.where(
        or(
          ilike(externalRequests.name, `%${params.search}%`),
          ilike(externalRequests.email, `%${params.search}%`),
          ilike(externalRequests.project_description, `%${params.search}%`)
        )
      );
    }
    
    const totalResult = await countQuery;
    const total = totalResult[0]?.count || 0;
    
    // Apply ordering and pagination
    baseQuery = baseQuery.orderBy(desc(externalRequests.created_at));
    
    if (params?.limit) {
      baseQuery = baseQuery.limit(params.limit);
    }
    
    if (params?.offset) {
      baseQuery = baseQuery.offset(params.offset);
    }
    
    const requestsList = await baseQuery;
    
    return {
      requests: requestsList,
      total: Number(total)
    };
  }

  async assignDeveloperToExternalRequest(id: number, developerId: number): Promise<ExternalRequest | undefined> {
    const [updatedRequest] = await db
      .update(externalRequests)
      .set({ 
        assigned_developer_id: developerId,
        updated_at: new Date()
      })
      .where(eq(externalRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async getUserExternalRequests(
    email: string, 
    options?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ): Promise<{ requests: ExternalRequest[]; total: number }> {
    let query = db.select().from(externalRequests).where(eq(externalRequests.email, email));
    
    // Add status filter
    if (options?.status && options.status !== 'all') {
      query = query.where(and(
        eq(externalRequests.email, email),
        eq(externalRequests.status, options.status)
      ));
    }
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(externalRequests)
      .where(eq(externalRequests.email, email));
    
    // Apply pagination and ordering
    const requestsList = await query
      .orderBy(desc(externalRequests.created_at))
      .limit(options?.limit || 50)
      .offset(options?.offset || 0);
    
    return { requests: requestsList, total: count };
  }

  async getAvailableProjects(status?: string): Promise<ExternalRequest[]> {
    let query = db.select().from(externalRequests).where(
      sql`${externalRequests.client_id} IS NOT NULL OR ${externalRequests.assigned_developer_id} IS NOT NULL`
    );
    
    if (status && status !== 'all') {
      const statusMap: { [key: string]: string } = {
        'pending': 'pending',
        'in-progress': 'in_progress', 
        'completed': 'completed',
        'cancelled': 'cancelled'
      };
      const dbStatus = statusMap[status] || status;
      query = query.where(and(
        eq(externalRequests.status, dbStatus as any),
        sql`${externalRequests.client_id} IS NOT NULL OR ${externalRequests.assigned_developer_id} IS NOT NULL`
      ));
    }
    
    return query.orderBy(desc(externalRequests.created_at));
  }

  async getAvailableProjectsPaginated(
    status?: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<{ projects: Project[]; total: number }> {
    let query = db.select().from(externalRequests).where(
      sql`${externalRequests.client_id} IS NOT NULL OR ${externalRequests.assigned_developer_id} IS NOT NULL`
    );
    
    if (status && status !== 'all') {
      // Map frontend status to database status
      const statusMap: { [key: string]: string } = {
        'pending': 'pending',
        'in-progress': 'in_progress', 
        'completed': 'completed',
        'cancelled': 'cancelled'
      };
      const dbStatus = statusMap[status] || status;
      query = query.where(and(
        eq(externalRequests.status, dbStatus as any),
        sql`${externalRequests.client_id} IS NOT NULL OR ${externalRequests.assigned_developer_id} IS NOT NULL`
      ));
    }
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(externalRequests)
      .where(sql`${externalRequests.client_id} IS NOT NULL OR ${externalRequests.assigned_developer_id} IS NOT NULL`);
    
    // Apply pagination and ordering
    const projectsList = await query
      .orderBy(desc(externalRequests.created_at))
      .limit(options?.limit || 50)
      .offset(options?.offset || 0);
    
    return { projects: projectsList, total: count };
  }

  async getCombinedProjectsForUser(
    userEmail: string,
    status?: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<{ projects: any[]; total: number }> {
    // Get user's external requests
    const userRequestsQuery = db.select({
      id: externalRequests.id,
      title: sql<string>`null`.as('title'),
      description: sql<string>`null`.as('description'),
      project_description: externalRequests.project_description,
      status: externalRequests.status,
      created_at: externalRequests.created_at,
      budget: sql<string>`null`.as('budget'),
      deadline: sql<string>`null`.as('deadline'),
      type: sql<string>`'external_request'`.as('type')
    }).from(externalRequests).where(eq(externalRequests.email, userEmail));

    // Note: Since projects table is removed and everything is now in externalRequests,
    // we'll use a subset of externalRequests that have proper project structure
    const availableProjectsQuery = db.select({
      id: externalRequests.id,
      title: externalRequests.title,
      description: sql<string>`null`.as('description'),
      project_description: externalRequests.project_description,
      status: externalRequests.status,
      created_at: externalRequests.created_at,
      budget: externalRequests.budget,
      deadline: externalRequests.deadline,
      type: sql<string>`'project'`.as('type')
    }).from(externalRequests).where(sql`${externalRequests.client_id} IS NOT NULL OR ${externalRequests.assigned_developer_id} IS NOT NULL`);

    // Apply status filter if provided
    if (status && status !== 'all') {
      const statusMap: { [key: string]: string } = {
        'pending': 'pending',
        'in-progress': 'in_progress', 
        'completed': 'completed',
        'cancelled': 'cancelled'
      };
      const dbStatus = statusMap[status] || status;
      userRequestsQuery.where(eq(externalRequests.status, dbStatus));
      availableProjectsQuery.where(and(
        eq(externalRequests.status, dbStatus),
        sql`${externalRequests.client_id} IS NOT NULL OR ${externalRequests.assigned_developer_id} IS NOT NULL`
      ));
    }

    // Execute queries to get counts
    const [userRequestsCount] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(externalRequests)
      .where(eq(externalRequests.email, userEmail));

    const [availableProjectsCount] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(externalRequests)
      .where(sql`${externalRequests.client_id} IS NOT NULL OR ${externalRequests.assigned_developer_id} IS NOT NULL`);

    const totalCount = userRequestsCount.count + availableProjectsCount.count;

    // Get the combined results with pagination
    const userRequests = await userRequestsQuery
      .orderBy(desc(externalRequests.created_at))
      .limit(Math.min(options?.limit || 10, totalCount))
      .offset(options?.offset || 0);

    const remainingLimit = Math.max(0, (options?.limit || 10) - userRequests.length);
    const availableProjects = remainingLimit > 0 ? await availableProjectsQuery
      .orderBy(desc(externalRequests.created_at))
      .limit(remainingLimit)
      .offset(Math.max(0, (options?.offset || 0) - userRequestsCount.count)) : [];

    // Combine and sort by created_at
    const combinedProjects = [...userRequests, ...availableProjects]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { projects: combinedProjects, total: totalCount };
  }

  // Phase 2: Project Management
  async createProject(project: InsertExternalRequest, clientId?: number): Promise<ExternalRequest> {
    const [createdProject] = await db
      .insert(externalRequests)
      .values({
        ...project,
        client_id: clientId
      })
      .returning();
    return createdProject;
  }

  async getProjectById(id: number): Promise<ExternalRequest | undefined> {
    const [project] = await db.select().from(externalRequests).where(eq(externalRequests.id, id));
    return project;
  }

  async getProjectsByClientId(clientId: number): Promise<ExternalRequest[]> {
    return db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.client_id, clientId))
      .orderBy(desc(externalRequests.created_at));
  }

  async getProjectsForDevelopers(status?: string, limit?: number, offset?: number): Promise<{ projects: ExternalRequest[], total: number }> {
    let query = db.select().from(externalRequests);
    
    if (status) {
      query = query.where(eq(externalRequests.status, status as any));
    }
    
    // Get total count
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(externalRequests);
    const total = totalResult[0]?.count || 0;
    
    // Apply ordering and pagination
    query = query.orderBy(desc(externalRequests.created_at));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    if (offset) {
      query = query.offset(offset);
    }
    
    const projectsList = await query;
    
    return {
      projects: projectsList,
      total: Number(total)
    };
  }

  async updateProjectStatus(id: number, status: string): Promise<ExternalRequest | undefined> {
    const [updatedProject] = await db
      .update(externalRequests)
      .set({ status: status as any, updated_at: new Date() })
      .where(eq(externalRequests.id, id))
      .returning();
    return updatedProject;
  }

  // New methods for admin dashboard
  async getAllProjects(status?: string): Promise<ExternalRequest[]> {
    let query = db.select().from(externalRequests);
    
    if (status && status !== 'all') {
      const statusMap: { [key: string]: string } = {
        'pending': 'pending',
        'in-progress': 'in_progress', 
        'completed': 'completed',
        'cancelled': 'cancelled'
      };
      const dbStatus = statusMap[status] || status;
      query = query.where(eq(externalRequests.status, dbStatus as any));
    }
    
    return query.orderBy(desc(externalRequests.created_at));
  }

  async getClientProjects(clientId: number, status?: string): Promise<ExternalRequest[]> {
    let query = db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.client_id, clientId));
    
    if (status && status !== 'all') {
      const statusMap: { [key: string]: string } = {
        'pending': 'pending',
        'in-progress': 'in_progress', 
        'completed': 'completed',
        'cancelled': 'cancelled'
      };
      const dbStatus = statusMap[status] || status;
      query = query.where(and(
        eq(externalRequests.client_id, clientId),
        eq(externalRequests.status, dbStatus as any)
      ));
    }
    
    return query.orderBy(desc(externalRequests.created_at));
  }

  async getDeveloperProjects(developerId: number, status?: string): Promise<ExternalRequest[]> {
    let query = db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.assigned_developer_id, developerId));
    
    if (status && status !== 'all') {
      const statusMap: { [key: string]: string } = {
        'pending': 'pending',
        'in-progress': 'in_progress', 
        'completed': 'completed',
        'cancelled': 'cancelled'
      };
      const dbStatus = statusMap[status] || status;
      query = query.where(and(
        eq(externalRequests.assigned_developer_id, developerId),
        eq(externalRequests.status, dbStatus as any)
      ));
    }
    
    return query.orderBy(desc(externalRequests.created_at));
  }

  async getProjectsCount(status?: string): Promise<{ count: number }> {
    let query = db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(externalRequests);
    
    if (status && status !== 'all') {
      const statusMap: { [key: string]: string } = {
        'pending': 'pending',
        'in-progress': 'in_progress', 
        'completed': 'completed',
        'cancelled': 'cancelled'
      };
      const dbStatus = statusMap[status] || status;
      query = query.where(eq(externalRequests.status, dbStatus as any));
    }
    
    const [result] = await query;
    return { count: result.count };
  }

  // Quotes
  async createQuote(quote: InsertQuote, developerId: number): Promise<Quote> {
    const [createdQuote] = await db
      .insert(quotes)
      .values({
        ...quote,
        developer_id: developerId
      })
      .returning();
    return createdQuote;
  }

  async getQuotesByProjectId(projectId: number): Promise<Quote[]> {
    return db
      .select()
      .from(quotes)
      .where(eq(quotes.project_id, projectId))
      .orderBy(desc(quotes.created_at));
  }

  async getQuotesByDeveloperId(developerId: number): Promise<Quote[]> {
    return db
      .select()
      .from(quotes)
      .where(eq(quotes.developer_id, developerId))
      .orderBy(desc(quotes.created_at));
  }

  async updateQuoteStatus(id: number, status: string): Promise<Quote | undefined> {
    const [updatedQuote] = await db
      .update(quotes)
      .set({ status: status as any })
      .where(eq(quotes.id, id))
      .returning();
    return updatedQuote;
  }

  // Messages
  async sendMessage(message: InsertMessage, senderId: number): Promise<Message> {
    const [createdMessage] = await db
      .insert(messages)
      .values({
        ...message,
        sender_id: senderId
      })
      .returning();
    return createdMessage;
  }

  async getMessagesByProjectId(projectId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.project_id, projectId))
      .orderBy(messages.created_at);
  }

  // Portfolios
  async createPortfolio(portfolio: InsertPortfolio, developerId: number): Promise<Portfolio> {
    const [createdPortfolio] = await db
      .insert(portfolios)
      .values({
        ...portfolio,
        developer_id: developerId
      })
      .returning();
    return createdPortfolio;
  }

  async getPortfolioById(id: number): Promise<Portfolio | undefined> {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, id));
    return portfolio;
  }

  async getPortfoliosByDeveloperId(developerId: number): Promise<Portfolio[]> {
    return db
      .select()
      .from(portfolios)
      .where(eq(portfolios.developer_id, developerId))
      .orderBy(desc(portfolios.created_at));
  }

  async getAllPortfolios(limit?: number, offset?: number): Promise<{ portfolios: Portfolio[], total: number }> {
    let query = db.select().from(portfolios);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(portfolios);
    
    // Get total count
    const [countResult] = await countQuery;
    const total = countResult?.count || 0;
    
    // Apply pagination
    if (limit) {
      query = query.limit(limit);
      
      if (offset) {
        query = query.offset(offset);
      }
    }
    
    // Order by creation date, newest first
    query = query.orderBy(desc(portfolios.created_at));
    
    const portfoliosList = await query;
    
    return {
      portfolios: portfoliosList,
      total: Number(total)
    };
  }

  async updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
    const [updatedPortfolio] = await db
      .update(portfolios)
      .set(portfolio)
      .where(eq(portfolios.id, id))
      .returning();
    return updatedPortfolio;
  }

  async deletePortfolio(id: number, developerId: number): Promise<boolean> {
    const result = await db
      .delete(portfolios)
      .where(
        and(
          eq(portfolios.id, id),
          eq(portfolios.developer_id, developerId)
        )
      )
      .returning({ id: portfolios.id });
    
    return result.length > 0;
  }

  // Portfolio Reviews
  async createPortfolioReview(review: InsertPortfolioReview, userId: number): Promise<PortfolioReview> {
    const [createdReview] = await db
      .insert(portfolioReviews)
      .values({
        ...review,
        user_id: userId
      })
      .returning();
    return createdReview;
  }

  async getPortfolioReviewsByPortfolioId(portfolioId: number): Promise<PortfolioReview[]> {
    return db
      .select()
      .from(portfolioReviews)
      .where(eq(portfolioReviews.portfolio_id, portfolioId))
      .orderBy(desc(portfolioReviews.created_at));
  }

  async deletePortfolioReview(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(portfolioReviews)
      .where(
        and(
          eq(portfolioReviews.id, id),
          eq(portfolioReviews.user_id, userId)
        )
      )
      .returning({ id: portfolioReviews.id });
    
    return result.length > 0;
  }

  // Phase 3: Marketplace
  // Products
  async createProduct(product: InsertProduct, sellerId: number): Promise<Product> {
    const [createdProduct] = await db
      .insert(products)
      .values({
        ...product,
        seller_id: sellerId
      })
      .returning();
    return createdProduct;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByCategory(category: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }> {
    let query = db.select().from(products).where(eq(products.category, category));
    let countQuery = db.select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.category, category));
    
    // Get total count
    const [countResult] = await countQuery;
    const total = countResult?.count || 0;
    
    // Apply pagination
    if (limit) {
      query = query.limit(limit);
      
      if (offset) {
        query = query.offset(offset);
      }
    }
    
    // Order by creation date, newest first
    query = query.orderBy(desc(products.created_at));
    
    const productsList = await query;
    
    return {
      products: productsList,
      total: Number(total)
    };
  }

  async getProductsBySellerId(
    sellerId: number, 
    options?: {
      limit?: number;
      offset?: number;
      status?: string;
      search?: string;
    }
  ): Promise<{ products: Product[]; total: number }> {
    let query = db.select().from(products).where(eq(products.seller_id, sellerId));
    
    // Add filters
    if (options?.status && options.status !== 'all') {
      query = query.where(and(
        eq(products.seller_id, sellerId),
        eq(products.status, options.status)
      ));
    }
    
    if (options?.search) {
      query = query.where(and(
        eq(products.seller_id, sellerId),
        or(
          ilike(products.title, `%${options.search}%`),
          ilike(products.description, `%${options.search}%`),
          ilike(products.category, `%${options.search}%`)
        )
      ));
    }
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(products)
      .where(eq(products.seller_id, sellerId));
    
    // Apply pagination and ordering
    const productList = await query
      .orderBy(desc(products.created_at))
      .limit(options?.limit || 50)
      .offset(options?.offset || 0);
    
    return { products: productList, total: count };
  }

  async searchProducts(search: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }> {
    let query = db.select().from(products).where(
      or(
        ilike(products.title, `%${search}%`),
        ilike(products.description, `%${search}%`),
        ilike(products.category, `%${search}%`)
      )
    );
    
    let countQuery = db.select({ count: sql<number>`count(*)` })
      .from(products)
      .where(
        or(
          ilike(products.title, `%${search}%`),
          ilike(products.description, `%${search}%`),
          ilike(products.category, `%${search}%`)
        )
      );
    
    // Get total count
    const [countResult] = await countQuery;
    const total = countResult?.count || 0;
    
    // Apply pagination
    if (limit) {
      query = query.limit(limit);
      
      if (offset) {
        query = query.offset(offset);
      }
    }
    
    // Order by creation date, newest first
    query = query.orderBy(desc(products.created_at));
    
    const productsList = await query;
    
    return {
      products: productsList,
      total: Number(total)
    };
  }

  async updateProduct(id: number, product: Partial<InsertProduct>, sellerId?: number): Promise<Product | undefined> {
    let whereCondition = eq(products.id, id);
    
    // If sellerId is provided, add seller check for permission control
    if (sellerId !== undefined) {
      whereCondition = and(
        eq(products.id, id),
        eq(products.seller_id, sellerId)
      );
    }
    
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(whereCondition)
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number, sellerId: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(
        and(
          eq(products.id, id),
          eq(products.seller_id, sellerId)
        )
      )
      .returning({ id: products.id });
    
    return result.length > 0;
  }

  // Orders
  async createOrder(order: InsertOrder, items: InsertOrderItem[], buyerId: number): Promise<Order> {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // Create the order
      const [createdOrder] = await tx
        .insert(orders)
        .values({
          ...order,
          buyer_id: buyerId
        })
        .returning();
      
      // Insert order items
      if (items.length > 0) {
        await tx
          .insert(orderItems)
          .values(
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
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByBuyerId(buyerId: number): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.buyer_id, buyerId))
      .orderBy(desc(orders.created_at));
  }

  async getOrdersBySellerId(sellerId: number): Promise<Order[]> {
    // Join orders with order_items and products to find orders that contain products from this seller
    const result = await db
      .select({
        order: orders
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.order_id))
      .innerJoin(products, and(
        eq(orderItems.product_id, products.id),
        eq(products.seller_id, sellerId)
      ))
      .groupBy(orders.id)
      .orderBy(desc(orders.created_at));
    
    return result.map(r => r.order);
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
    
    // If the order is marked as completed, update any pending payments
    if (status === 'completed') {
      await db
        .update(payments)
        .set({ 
          status: 'completed',
          escrow_release: true 
        })
        .where(and(
          eq(payments.order_id, id),
          eq(payments.status, 'pending')
        ));
    }
    
    return updatedOrder;
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [createdOrderItem] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    return createdOrderItem;
  }

  // Payments
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [createdPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return createdPayment;
  }

  async getPaymentById(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByOrderId(orderId: number): Promise<Payment[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.order_id, orderId))
      .orderBy(desc(payments.created_at));
  }

  async releaseEscrow(id: number, buyerId: number): Promise<Payment | undefined> {
    // First check if the payment belongs to an order created by this buyer
    const payment = await this.getPaymentById(id);
    
    if (!payment || !payment.order_id) {
      return undefined;
    }
    
    const order = await this.getOrderById(payment.order_id);
    
    // Check if the order belongs to this buyer and is in a state where escrow can be released
    // Escrow can only be released if the order is in "delivered" or "completed" status
    if (!order || 
        order.buyer_id !== buyerId || 
        (order.status !== 'delivered' && order.status !== 'completed')) {
      return undefined;
    }
    
    // Release the escrow
    const [updatedPayment] = await db
      .update(payments)
      .set({ 
        escrow_release: true,
        status: 'completed' 
      })
      .where(eq(payments.id, id))
      .returning();
    
    // If the payment was successfully released, update the order to completed status
    if (updatedPayment && order.status !== 'completed') {
      await this.updateOrderStatus(order.id, 'completed');
    }
    
    return updatedPayment;
  }

  // Product Reviews
  async createProductReview(review: InsertProductReview, buyerId: number): Promise<ProductReview> {
    const [createdReview] = await db
      .insert(productReviews)
      .values({
        ...review,
        buyer_id: buyerId
      })
      .returning();
    return createdReview;
  }

  async getProductReviewsByProductId(productId: number): Promise<ProductReview[]> {
    return db
      .select()
      .from(productReviews)
      .where(eq(productReviews.product_id, productId))
      .orderBy(desc(productReviews.created_at));
  }

  async getProductReviewsByBuyerId(buyerId: number): Promise<ProductReview[]> {
    return db
      .select()
      .from(productReviews)
      .where(eq(productReviews.buyer_id, buyerId))
      .orderBy(desc(productReviews.created_at));
  }

  async deleteProductReview(id: number, buyerId: number): Promise<boolean> {
    const result = await db
      .delete(productReviews)
      .where(
        and(
          eq(productReviews.id, id),
          eq(productReviews.buyer_id, buyerId)
        )
      )
      .returning({ id: productReviews.id });
    
    return result.length > 0;
  }

  // User Downloads functionality
  async createUserDownload(userId: number, softwareId: number, version: string): Promise<UserDownload> {
    const [download] = await db
      .insert(userDownloads)
      .values({
        user_id: userId,
        software_id: softwareId,
        version
      })
      .returning();
    return download;
  }
  
  async getUserDownloads(userId: number): Promise<UserDownload[]> {
    const downloadsWithSoftware = await db
      .select({
        download: userDownloads,
        software: softwares
      })
      .from(userDownloads)
      .innerJoin(softwares, eq(userDownloads.software_id, softwares.id))
      .where(eq(userDownloads.user_id, userId))
      .orderBy(desc(userDownloads.downloaded_at));
    
    return downloadsWithSoftware.map(item => ({
      ...item.download,
      softwareName: item.software.name,
      softwareImageUrl: item.software.image_url
    }));
  }

  // User Reviews management
  async getUserReviews(userId: number): Promise<Review[]> {
    const reviewsWithSoftware = await db
      .select({
        review: reviews,
        software: softwares
      })
      .from(reviews)
      .innerJoin(softwares, eq(reviews.target_id, softwares.id))
      .where(
        and(
          eq(reviews.user_id, userId),
          eq(reviews.target_type, 'software')
        )
      )
      .orderBy(desc(reviews.created_at));
    
    return reviewsWithSoftware.map(item => ({
      ...item.review,
      softwareName: item.software.name,
      softwareImageUrl: item.software.image_url
    }));
  }
  
  async updateReview(id: number, userId: number, reviewData: Partial<InsertReview>): Promise<Review | undefined> {
    const [updatedReview] = await db
      .update(reviews)
      .set({
        ...reviewData,
        // Don't allow changing the target
        target_type: undefined,
        target_id: undefined
      })
      .where(
        and(
          eq(reviews.id, id),
          eq(reviews.user_id, userId)
        )
      )
      .returning();
    
    return updatedReview;
  }

  async createUserDownload(userId: number, softwareId: number, version: string): Promise<UserDownload> {
    const [download] = await db
      .insert(userDownloads)
      .values({
        user_id: userId,
        software_id: softwareId,
        version,
        downloaded_at: new Date()
      })
      .returning();
    return download;
  }

  async getUserDownloads(userId: number): Promise<UserDownload[]> {
    return await db
      .select()
      .from(userDownloads)
      .where(eq(userDownloads.user_id, userId))
      .orderBy(desc(userDownloads.downloaded_at));
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.user_id, userId))
      .orderBy(desc(reviews.created_at));
  }

  async updateReview(id: number, userId: number, reviewData: Partial<InsertReview>): Promise<Review | undefined> {
    const [review] = await db
      .update(reviews)
      .set(reviewData)
      .where(and(
        eq(reviews.id, id),
        eq(reviews.user_id, userId)
      ))
      .returning();
    return review || undefined;
  }

  // Seller Profile Management
  async createSellerProfile(profile: InsertSellerProfile, userId: number): Promise<SellerProfile> {
    const [createdProfile] = await db
      .insert(sellerProfiles)
      .values({
        ...profile,
        user_id: userId
      })
      .returning();
    return createdProfile;
  }

  async getSellerProfile(userId: number): Promise<SellerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.user_id, userId));
    return profile;
  }

  async updateSellerProfile(userId: number, profile: Partial<InsertSellerProfile>): Promise<SellerProfile | undefined> {
    const [updatedProfile] = await db
      .update(sellerProfiles)
      .set({
        ...profile,
        updated_at: new Date()
      })
      .where(eq(sellerProfiles.user_id, userId))
      .returning();
    return updatedProfile;
  }

  async updateSellerVerificationStatus(userId: number, status: 'pending' | 'verified' | 'rejected'): Promise<SellerProfile | undefined> {
    const [updatedProfile] = await db
      .update(sellerProfiles)
      .set({
        verification_status: status,
        updated_at: new Date()
      })
      .where(eq(sellerProfiles.user_id, userId))
      .returning();
    return updatedProfile;
  }

  async getAllSellersForVerification(): Promise<SellerProfile[]> {
    return db
      .select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.verification_status, 'pending'))
      .orderBy(sellerProfiles.created_at);
  }

  // Cart Management
  async addToCart(item: InsertCartItem, userId: number): Promise<CartItem> {
    const [cartItem] = await db
      .insert(cartItems)
      .values({
        ...item,
        user_id: userId
      })
      .returning();
    return cartItem;
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    return db
      .select()
      .from(cartItems)
      .where(eq(cartItems.user_id, userId))
      .orderBy(cartItems.created_at);
  }

  async removeFromCart(itemId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.id, itemId),
          eq(cartItems.user_id, userId)
        )
      )
      .returning({ id: cartItems.id });
    
    return result.length > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.user_id, userId))
      .returning({ id: cartItems.id });
    
    return result.length > 0;
  }

  // Support Tickets
  async createSupportTicket(ticket: InsertSupportTicket, buyerId: number): Promise<SupportTicket> {
    const [createdTicket] = await db
      .insert(supportTickets)
      .values({
        ...ticket,
        buyer_id: buyerId
      })
      .returning();
    return createdTicket;
  }

  async getSupportTickets(userId: number): Promise<SupportTicket[]> {
    return db
      .select()
      .from(supportTickets)
      .where(
        or(
          eq(supportTickets.buyer_id, userId),
          eq(supportTickets.seller_id, userId)
        )
      )
      .orderBy(desc(supportTickets.created_at));
  }

  async updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({
        ...updates,
        updated_at: new Date()
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }

  // Sales Analytics
  async createSalesAnalytics(analytics: InsertSalesAnalytics): Promise<SalesAnalytics> {
    const [createdAnalytics] = await db
      .insert(salesAnalytics)
      .values(analytics)
      .returning();
    return createdAnalytics;
  }

  async getSalesAnalytics(sellerId: number, filters?: { startDate?: Date; endDate?: Date; }): Promise<SalesAnalytics[]> {
    let query = db
      .select()
      .from(salesAnalytics)
      .where(eq(salesAnalytics.seller_id, sellerId));

    if (filters?.startDate) {
      query = query.where(and(
        eq(salesAnalytics.seller_id, sellerId),
        sql`${salesAnalytics.date} >= ${filters.startDate}`
      ));
    }

    if (filters?.endDate) {
      query = query.where(and(
        eq(salesAnalytics.seller_id, sellerId),
        sql`${salesAnalytics.date} <= ${filters.endDate}`
      ));
    }

    return query.orderBy(desc(salesAnalytics.date));
  }

  // IT Services Implementation
  
  // Service Requests
  async createServiceRequest(request: InsertServiceRequest, clientId: number): Promise<ServiceRequest> {
    const [created] = await db
      .insert(serviceRequests)
      .values({
        ...request,
        client_id: clientId
      })
      .returning();
    return created;
  }

  async getServiceRequestById(id: number): Promise<ServiceRequest | undefined> {
    const [request] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id));
    return request;
  }

  async getServiceRequestsByClient(clientId: number): Promise<ServiceRequest[]> {
    return db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.client_id, clientId))
      .orderBy(desc(serviceRequests.created_at));
  }

  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    return db
      .select()
      .from(serviceRequests)
      .orderBy(desc(serviceRequests.created_at));
  }

  async updateServiceRequest(id: number, request: Partial<InsertServiceRequest>): Promise<ServiceRequest | undefined> {
    const [updated] = await db
      .update(serviceRequests)
      .set({
        ...request,
        updated_at: new Date()
      })
      .where(eq(serviceRequests.id, id))
      .returning();
    return updated;
  }

  async updateServiceRequestStatus(id: number, status: string, adminNotes?: string): Promise<ServiceRequest | undefined> {
    const [updated] = await db
      .update(serviceRequests)
      .set({
        status: status as any,
        admin_notes: adminNotes,
        updated_at: new Date()
      })
      .where(eq(serviceRequests.id, id))
      .returning();
    return updated;
  }

  // Service Quotations
  async createServiceQuotation(quotation: InsertServiceQuotation, adminId: number): Promise<ServiceQuotation> {
    const [created] = await db
      .insert(serviceQuotations)
      .values({
        ...quotation,
        admin_id: adminId
      })
      .returning();
    return created;
  }

  async getServiceQuotationById(id: number): Promise<ServiceQuotation | undefined> {
    const [quotation] = await db
      .select()
      .from(serviceQuotations)
      .where(eq(serviceQuotations.id, id));
    return quotation;
  }

  async getServiceQuotationsByRequest(requestId: number): Promise<ServiceQuotation[]> {
    return db
      .select()
      .from(serviceQuotations)
      .where(eq(serviceQuotations.service_request_id, requestId))
      .orderBy(desc(serviceQuotations.created_at));
  }

  async getAllServiceQuotations(): Promise<ServiceQuotation[]> {
    return db
      .select()
      .from(serviceQuotations)
      .orderBy(desc(serviceQuotations.created_at));
  }

  async updateServiceQuotation(id: number, quotation: Partial<InsertServiceQuotation>): Promise<ServiceQuotation | undefined> {
    const [updated] = await db
      .update(serviceQuotations)
      .set({
        ...quotation,
        updated_at: new Date()
      })
      .where(eq(serviceQuotations.id, id))
      .returning();
    return updated;
  }

  async updateServiceQuotationStatus(id: number, status: string, clientResponse?: string): Promise<ServiceQuotation | undefined> {
    const [updated] = await db
      .update(serviceQuotations)
      .set({
        status: status as any,
        client_response: clientResponse,
        updated_at: new Date()
      })
      .where(eq(serviceQuotations.id, id))
      .returning();
    return updated;
  }

  // Service Projects
  async createServiceProject(project: InsertServiceProject): Promise<ServiceProject> {
    const [created] = await db
      .insert(serviceProjects)
      .values(project)
      .returning();
    return created;
  }

  async getServiceProjectById(id: number): Promise<ServiceProject | undefined> {
    const [project] = await db
      .select()
      .from(serviceProjects)
      .where(eq(serviceProjects.id, id));
    return project;
  }

  async getServiceProjectsByClient(clientId: number): Promise<ServiceProject[]> {
    return db
      .select()
      .from(serviceProjects)
      .where(eq(serviceProjects.client_id, clientId))
      .orderBy(desc(serviceProjects.created_at));
  }

  async getServiceProjectsByAdmin(adminId: number): Promise<ServiceProject[]> {
    return db
      .select()
      .from(serviceProjects)
      .where(eq(serviceProjects.admin_id, adminId))
      .orderBy(desc(serviceProjects.created_at));
  }

  async getAllServiceProjects(): Promise<ServiceProject[]> {
    return db
      .select()
      .from(serviceProjects)
      .orderBy(desc(serviceProjects.created_at));
  }

  async updateServiceProject(id: number, project: Partial<InsertServiceProject>): Promise<ServiceProject | undefined> {
    const [updated] = await db
      .update(serviceProjects)
      .set({
        ...project,
        updated_at: new Date()
      })
      .where(eq(serviceProjects.id, id))
      .returning();
    return updated;
  }

  async updateServiceProjectProgress(id: number, progress: number, adminNotes?: string): Promise<ServiceProject | undefined> {
    const [updated] = await db
      .update(serviceProjects)
      .set({
        progress_percentage: progress,
        admin_notes: adminNotes,
        updated_at: new Date()
      })
      .where(eq(serviceProjects.id, id))
      .returning();
    return updated;
  }

  // Service Payments
  async createServicePayment(payment: InsertServicePayment): Promise<ServicePayment> {
    const [created] = await db
      .insert(servicePayments)
      .values(payment)
      .returning();
    return created;
  }

  async getServicePaymentById(id: number): Promise<ServicePayment | undefined> {
    const [payment] = await db
      .select()
      .from(servicePayments)
      .where(eq(servicePayments.id, id));
    return payment;
  }

  async getServicePaymentsByQuotation(quotationId: number): Promise<ServicePayment[]> {
    return db
      .select()
      .from(servicePayments)
      .where(eq(servicePayments.quotation_id, quotationId))
      .orderBy(desc(servicePayments.created_at));
  }

  async getServicePaymentsByClient(clientId: number): Promise<ServicePayment[]> {
    return db
      .select()
      .from(servicePayments)
      .where(eq(servicePayments.client_id, clientId))
      .orderBy(desc(servicePayments.created_at));
  }

  async updateServicePaymentStatus(id: number, status: string): Promise<ServicePayment | undefined> {
    const [updated] = await db
      .update(servicePayments)
      .set({
        status: status as any,
        updated_at: new Date()
      })
      .where(eq(servicePayments.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
