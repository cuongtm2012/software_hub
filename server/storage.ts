import {
  users, softwares, categories, reviews, userDownloads,
  externalRequests, quotes, messages, portfolios, portfolioReviews,
  products, orders, orderItems, payments, productReviews,
  sellerProfiles, cartItems, supportTickets, salesAnalytics,
  serviceRequests, serviceQuotations, serviceProjects, servicePayments,
  userPresence, notifications,
  chatRooms, chatRoomMembers, chatMessages, courses,
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
  type UserPresence, type InsertUserPresence,
  type Notification, type InsertNotification,
  type ChatRoom, type InsertChatRoom,
  type ChatRoomMember, type InsertChatRoomMember,
  type ChatMessage, type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, ilike, inArray, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // System
  initialize(): Promise<void>;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserProfile(userId: number, profileData: any): Promise<User | undefined>;

  // Admin User Management
  getAllUsers(params?: { role?: string; search?: string; limit?: number; offset?: number }): Promise<{ users: any[], total: number }>;
  deleteUser(id: number): Promise<boolean>;
  resetUserPassword(id: number, newPassword: string): Promise<boolean>;

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
  updateSoftwareAdmin(id: number, software: Partial<InsertSoftware>): Promise<Software | undefined>;
  deleteSoftware(id: number): Promise<boolean>;
  updateSoftwareStatus(id: number, status: 'approved' | 'rejected'): Promise<Software | undefined>;
  incrementSoftwareDownloads(id: number): Promise<void>;
  getSoftwareList(params: {
    category?: number;
    platform?: string;
    search?: string;
    type?: 'software' | 'api';
    status?: 'pending' | 'approved' | 'rejected';
    limit?: number;
    offset?: number;
  }): Promise<{ softwares: Software[], total: number }>;
  getAdminSoftwareList(filters: any, limit?: number, offset?: number): Promise<{ softwares: Software[], total: number }>;

  // Reviews
  createReview(review: InsertReview, userId: number): Promise<Review>;
  getReviewsBySoftwareId(softwareId: number): Promise<Review[]>;
  getSoftwareReviews(softwareId: number): Promise<Review[]>;
  getUserReviewForSoftware(userId: number, softwareId: number): Promise<Review | undefined>;
  getReviewById(id: number): Promise<Review | undefined>;
  deleteReview(id: number, userId: number): Promise<boolean>;

  // External Project Requests
  createExternalRequest(request: InsertExternalRequest): Promise<ExternalRequest>;
  getExternalRequests(status?: string, limit?: number, offset?: number): Promise<{ requests: ExternalRequest[], total: number }>;
  getExternalRequestById(id: number): Promise<ExternalRequest | undefined>;
  getExternalRequestsByClient(clientId: number, params?: { page?: number; limit?: number; status?: string }): Promise<{ requests: ExternalRequest[], total: number }>;
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
  updateProject(id: number, updates: Partial<InsertExternalRequest>): Promise<ExternalRequest | undefined>;
  updateProjectStatus(id: number, status: string): Promise<ExternalRequest | undefined>;

  // Quotes
  createQuote(quote: InsertQuote, developerId: number): Promise<Quote>;
  getQuotesByProjectId(projectId: number): Promise<Quote[]>;
  getQuotesByDeveloperId(developerId: number): Promise<Quote[]>;
  getDeveloperQuoteForProject(developerId: number, projectId: number): Promise<Quote | undefined>;
  getQuoteById(id: number): Promise<Quote | undefined>;
  updateQuoteStatus(id: number, status: string): Promise<Quote | undefined>;
  rejectOtherQuotes(projectId: number, acceptedQuoteId: number): Promise<void>;

  // Messages
  sendMessage(message: InsertMessage, senderId: number): Promise<Message>;
  getMessagesByProjectId(projectId: number): Promise<Message[]>;

  // Portfolios
  createPortfolio(portfolio: InsertPortfolio, developerId: number): Promise<Portfolio>;
  getPortfolioById(id: number): Promise<Portfolio | undefined>;
  getPortfoliosByDeveloperId(developerId: number): Promise<Portfolio[]>;
  getDeveloperPortfolio(developerId: number): Promise<Portfolio[]>;
  getAllPortfolios(limit?: number, offset?: number): Promise<{ portfolios: Portfolio[], total: number }>;
  updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined>;
  deletePortfolio(id: number, developerId: number): Promise<boolean>;

  // Portfolio Reviews
  createPortfolioReview(review: InsertPortfolioReview, userId: number): Promise<PortfolioReview>;
  getPortfolioReviewsByPortfolioId(portfolioId: number): Promise<PortfolioReview[]>;
  getPortfolioReviews(portfolioId: number): Promise<PortfolioReview[]>;
  getClientReviewForPortfolio(clientId: number, portfolioId: number): Promise<PortfolioReview | undefined>;
  deletePortfolioReview(id: number, userId: number): Promise<boolean>;

  // Phase 3: Marketplace
  // Products
  createProduct(product: InsertProduct, sellerId: number): Promise<Product>;
  getProductById(id: number): Promise<Product | undefined>;
  getProducts(params?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<{ products: Product[], total: number }>;
  getProductsByCategory(category: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }>;
  getProductsBySellerId(sellerId: number): Promise<Product[]>;
  searchProducts(search: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }>;
  updateProduct(id: number, product: Partial<InsertProduct>, sellerId: number): Promise<Product | undefined>;
  deleteProduct(id: number, sellerId: number): Promise<boolean>;

  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[], buyerId: number): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
  getAllOrders(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ orders: Order[], total: number }>;
  getOrdersByBuyerId(buyerId: number): Promise<Order[]>;
  getBuyerOrders(buyerId: number): Promise<Order[]>;
  getOrdersBySellerId(sellerId: number): Promise<Order[]>;
  getSellerOrders(sellerId: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Payments
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

  // Product Reviews
  createProductReview(review: InsertProductReview, buyerId: number): Promise<ProductReview>;
  getProductReviewsByProductId(productId: number): Promise<ProductReview[]>;
  getProductReviews(productId: number): Promise<ProductReview[]>;
  getUserReviewForProduct(userId: number, productId: number): Promise<ProductReview | undefined>;
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
  getCartItemsWithProducts(userId: number): Promise<any[]>;
  updateCartItemQuantity(itemId: number, quantity: number, userId: number): Promise<CartItem | undefined>;
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

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number, params?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<{ notifications: Notification[], total: number }>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  markNotificationAsRead(id: number, userId: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: number, userId: number): Promise<boolean>;

  // Admin Dashboard
  getAdminStatistics(): Promise<{
    totalUsers: number;
    totalSoftware: number;
    totalOrders: number;
    totalRevenue: number;
    usersTrend?: { value: number; isPositive: boolean };
    softwareTrend?: { value: number; isPositive: boolean };
    ordersTrend?: { value: number; isPositive: boolean };
    revenueTrend?: { value: number; isPositive: boolean };
  }>;
  broadcastNotification(data: { message: string; target: string; senderId: number }): Promise<{ recipientCount: number }>;
  getNotificationHistory(params: { limit: number; offset: number }): Promise<{ notifications: any[], total: number }>;

  // Chat
  getUserChatRooms(userId: number): Promise<ChatRoom[]>;
  getChatRoomById(roomId: number): Promise<ChatRoom | undefined>;
  createDirectChatRoom(userId: number, participantId: number): Promise<ChatRoom>;
  getDirectChatRoom(userId: number, participantId: number): Promise<ChatRoom | undefined>;
  createGroupChatRoom(name: string, creatorId: number, participantIds: number[]): Promise<ChatRoom>;
  isChatRoomMember(roomId: number, userId: number): Promise<boolean>;
  getChatMessages(roomId: number, limit?: number, before?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessagesAsRead(roomId: number, userId: number): Promise<void>;
  updateUserPresence(userId: number, status: string): Promise<void>;
  getOnlineUsers(): Promise<User[]>;

  // FCM Tokens for Push Notifications
  saveFCMToken(userId: number, token: string, deviceType?: string): Promise<void>;
  getUserFCMTokens(userId: number): Promise<string[]>;
  deleteFCMToken(token: string): Promise<boolean>;
  deleteUserFCMTokens(userId: number): Promise<boolean>;
  cleanupInvalidTokens(invalidTokens: string[]): Promise<void>;

  // Project Management
  getAdminProjects(filters: { status?: string; search?: string }): Promise<any[]>;
  getProjectStats(): Promise<Record<string, number>>;
  getProjectById(id: number): Promise<any>;
  updateProject(id: number, updates: any): Promise<any>;

  // Courses
  getCourses(filters: {
    topic?: string;
    level?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ courses: any[], total: number }>;
  getCourseTopics(): Promise<Array<{ topic: string; count: number }>>;
  getCourseById(id: number): Promise<any | undefined>;

  // Session store
  sessionStore: any;
}

class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true
    });
  }

  // System
  async initialize(): Promise<void> {
    // Initialization logic here
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return createdUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserProfile(userId: number, profileData: any): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(profileData)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Admin User Management
  async getAllUsers(params?: { role?: string; search?: string; limit?: number; offset?: number }): Promise<{ users: any[], total: number }> {
    let whereConditions = [];

    if (params?.role) {
      whereConditions.push(eq(users.role, params.role));
    }

    if (params?.search) {
      whereConditions.push(ilike(users.name, `%${params.search}%`));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    // Get users list
    const usersList = await db
      .select()
      .from(users)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { users: usersList, total };
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id));
    return result > 0;
  }

  async resetUserPassword(id: number, newPassword: string): Promise<boolean> {
    const [updatedUser] = await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, id))
      .returning();
    return !!updatedUser;
  }

  // User Downloads
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
    const downloads = await db
      .select()
      .from(userDownloads)
      .where(eq(userDownloads.user_id, userId));
    return downloads;
  }

  // User Reviews Management
  async getUserReviews(userId: number): Promise<Review[]> {
    const reviewsList = await db
      .select()
      .from(reviews)
      .where(eq(reviews.user_id, userId));
    return reviewsList;
  }

  async updateReview(id: number, userId: number, reviewData: Partial<InsertReview>): Promise<Review | undefined> {
    const [updatedReview] = await db
      .update(reviews)
      .set(reviewData)
      .where(and(eq(reviews.id, id), eq(reviews.user_id, userId)))
      .returning();
    return updatedReview;
  }

  // Categories
  async createCategory(category: InsertCategory): Promise<Category> {
    const [createdCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return createdCategory;
  }

  async getCategories(): Promise<Category[]> {
    const categoriesList = await db
      .select()
      .from(categories);
    return categoriesList;
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }

  // Software
  async createSoftware(software: InsertSoftware, userId: number): Promise<Software> {
    const [createdSoftware] = await db
      .insert(softwares)
      .values({
        ...software,
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdSoftware;
  }

  async getSoftwareById(id: number): Promise<Software | undefined> {
    const [software] = await db
      .select()
      .from(softwares)
      .where(eq(softwares.id, id));
    return software;
  }

  async updateSoftware(id: number, software: Partial<InsertSoftware>): Promise<Software | undefined> {
    const [updatedSoftware] = await db
      .update(softwares)
      .set({
        ...software,
        updated_at: new Date()
      })
      .where(eq(softwares.id, id))
      .returning();
    return updatedSoftware;
  }

  async updateSoftwareAdmin(id: number, software: Partial<InsertSoftware>): Promise<Software | undefined> {
    const [updatedSoftware] = await db
      .update(softwares)
      .set({
        ...software,
        updated_at: new Date()
      })
      .where(eq(softwares.id, id))
      .returning();
    return updatedSoftware;
  }

  async deleteSoftware(id: number): Promise<boolean> {
    const result = await db
      .delete(softwares)
      .where(eq(softwares.id, id));
    return result > 0;
  }

  async updateSoftwareStatus(id: number, status: 'approved' | 'rejected'): Promise<Software | undefined> {
    const [updatedSoftware] = await db
      .update(softwares)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(softwares.id, id))
      .returning();
    return updatedSoftware;
  }

  async incrementSoftwareDownloads(id: number): Promise<void> {
    await db
      .update(softwares)
      .set({
        downloads: sql`${softwares.downloads} + 1`
      })
      .where(eq(softwares.id, id));
  }

  async getSoftwareList(params: {
    category?: number;
    platform?: string;
    search?: string;
    type?: 'software' | 'api';
    status?: 'pending' | 'approved' | 'rejected';
    limit?: number;
    offset?: number;
  }): Promise<{ softwares: Software[], total: number }> {
    let whereConditions = [];

    if (params.category) {
      // Check if this is a parent category
      const allCategories = await db.select().from(categories);
      const selectedCategory = allCategories.find(c => c.id === params.category);

      if (selectedCategory) {
        // If it's a parent category (parent_id is null), get all its children
        if (selectedCategory.parent_id === null) {
          const childCategories = allCategories
            .filter(c => c.parent_id === params.category)
            .map(c => c.id);

          // Include both parent and all children
          const categoryIds = [params.category, ...childCategories];
          whereConditions.push(inArray(softwares.category_id, categoryIds));
        } else {
          // It's a subcategory, filter directly
          whereConditions.push(eq(softwares.category_id, params.category));
        }
      }
    }

    if (params.platform) {
      // Platform is an array, so we need to check if it contains the platform
      whereConditions.push(sql`${softwares.platform} @> ARRAY[${params.platform}]::text[]`);
    }

    if (params.search) {
      whereConditions.push(ilike(softwares.name, `%${params.search}%`));
    }

    // Add type filter
    if (params.type) {
      whereConditions.push(eq(softwares.type, params.type));
    }

    if (params.status) {
      whereConditions.push(eq(softwares.status, params.status));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(softwares)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    // Get software list
    const softwaresList = await db
      .select()
      .from(softwares)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params.limit || 10)
      .offset(params.offset || 0);

    return { softwares: softwaresList, total };
  }

  async getAdminSoftwareList(filters: any, limit?: number, offset?: number): Promise<{ softwares: Software[], total: number }> {
    let whereConditions = [];

    if (filters.category) {
      whereConditions.push(eq(softwares.category_id, filters.category));
    }

    if (filters.platform) {
      whereConditions.push(eq(softwares.platform, filters.platform));
    }

    if (filters.search) {
      whereConditions.push(ilike(softwares.name, `%${filters.search}%`));
    }

    if (filters.status) {
      whereConditions.push(eq(softwares.status, filters.status));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(softwares)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    // Get software list
    const softwaresList = await db
      .select()
      .from(softwares)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(limit || 10)
      .offset(offset || 0);

    return { softwares: softwaresList, total };
  }

  // Reviews
  async createReview(review: InsertReview, userId: number): Promise<Review> {
    const [createdReview] = await db
      .insert(reviews)
      .values({
        ...review,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdReview;
  }

  async getReviewsBySoftwareId(softwareId: number): Promise<Review[]> {
    const reviewsList = await db
      .select()
      .from(reviews)
      .where(eq(reviews.software_id, softwareId));
    return reviewsList;
  }

  async getSoftwareReviews(softwareId: number): Promise<Review[]> {
    const reviewsList = await db
      .select()
      .from(reviews)
      .where(eq(reviews.software_id, softwareId));
    return reviewsList;
  }

  async getUserReviewForSoftware(userId: number, softwareId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.user_id, userId), eq(reviews.software_id, softwareId)));
    return review;
  }

  async getReviewById(id: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));
    return review;
  }

  async deleteReview(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(reviews)
      .where(and(eq(reviews.id, id), eq(reviews.user_id, userId)));
    return result > 0;
  }

  // External Project Requests
  async createExternalRequest(request: InsertExternalRequest): Promise<ExternalRequest> {
    const [createdRequest] = await db
      .insert(externalRequests)
      .values({
        ...request,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdRequest;
  }

  async getExternalRequests(status?: string, limit?: number, offset?: number): Promise<{ requests: ExternalRequest[], total: number }> {
    let whereConditions = [];

    if (status) {
      whereConditions.push(eq(externalRequests.status, status));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(externalRequests)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    // Get requests list
    const requestsList = await db
      .select()
      .from(externalRequests)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(limit || 10)
      .offset(offset || 0);

    return { requests: requestsList, total };
  }

  async getExternalRequestById(id: number): Promise<ExternalRequest | undefined> {
    const [request] = await db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.id, id));
    return request;
  }

  async getExternalRequestsByClient(
    clientId: number,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<{ requests: ExternalRequest[], total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    console.log('🔍 getExternalRequestsByClient called with:', { clientId, page, limit, status: params?.status, offset });

    let whereConditions = [eq(externalRequests.client_id, clientId)];

    // Only add status filter if it's not 'all'
    if (params?.status && params.status !== 'all') {
      whereConditions.push(eq(externalRequests.status, params.status as any));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(externalRequests)
      .where(and(...whereConditions));

    const total = Number(countResult?.count) || 0;
    console.log('📊 Count result:', { countResult, total, totalType: typeof total });

    // Get requests list
    const requestsList = await db
      .select()
      .from(externalRequests)
      .where(and(...whereConditions))
      .orderBy(desc(externalRequests.created_at))
      .limit(limit)
      .offset(offset);

    console.log('📋 Requests list:', { count: requestsList.length, requests: requestsList.map(r => ({ id: r.id, client_id: r.client_id, name: r.name })) });

    return { requests: requestsList, total };
  }

  async updateExternalRequestStatus(id: number, status: string): Promise<ExternalRequest | undefined> {
    const [updatedRequest] = await db
      .update(externalRequests)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(externalRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async convertExternalRequestToProject(id: number, updates: Partial<InsertExternalRequest>): Promise<ExternalRequest> {
    const [updatedRequest] = await db
      .update(externalRequests)
      .set({
        ...updates,
        updated_at: new Date()
      })
      .where(eq(externalRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async getAllExternalRequests(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ requests: ExternalRequest[], total: number }> {
    let whereConditions = [];

    if (params?.status) {
      whereConditions.push(eq(externalRequests.status, params.status));
    }

    if (params?.search) {
      whereConditions.push(ilike(externalRequests.title, `%${params.search}%`));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(externalRequests)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    // Get requests list
    const requestsList = await db
      .select()
      .from(externalRequests)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { requests: requestsList, total };
  }

  async assignDeveloperToExternalRequest(id: number, developerId: number): Promise<ExternalRequest | undefined> {
    const [updatedRequest] = await db
      .update(externalRequests)
      .set({
        developer_id: developerId,
        updated_at: new Date()
      })
      .where(eq(externalRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async getUserExternalRequests(email: string): Promise<ExternalRequest[]> {
    const requestsList = await db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.client_email, email));
    return requestsList;
  }

  async getAvailableProjects(status?: string): Promise<ExternalRequest[]> {
    const query = db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.type, 'project'));

    if (status) {
      query.where(eq(externalRequests.status, status));
    }

    const projectsList = await query;
    return projectsList;
  }

  async getAllProjects(status?: string): Promise<ExternalRequest[]> {
    const query = db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.type, 'project'));

    if (status) {
      query.where(eq(externalRequests.status, status));
    }

    const projectsList = await query;
    return projectsList;
  }

  async getClientProjects(clientId: number, status?: string): Promise<ExternalRequest[]> {
    const query = db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.client_id, clientId));

    if (status) {
      query.where(eq(externalRequests.status, status));
    }

    const projectsList = await query;
    return projectsList;
  }

  async getDeveloperProjects(developerId: number, status?: string): Promise<ExternalRequest[]> {
    const query = db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.developer_id, developerId));

    if (status) {
      query.where(eq(externalRequests.status, status));
    }

    const projectsList = await query;
    return projectsList;
  }

  async getProjectsCount(status?: string): Promise<{ count: number }> {
    const query = db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(externalRequests)
      .where(eq(externalRequests.type, 'project'));

    if (status) {
      query.where(eq(externalRequests.status, status));
    }

    const [result] = await query;
    return result;
  }

  // Phase 2: Project Management (now using external requests)
  async createProject(project: InsertExternalRequest, clientId?: number): Promise<ExternalRequest> {
    const [createdProject] = await db
      .insert(externalRequests)
      .values({
        ...project,
        client_id: clientId,
        type: 'project',
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdProject;
  }

  async getProjectById(id: number): Promise<ExternalRequest | undefined> {
    const [project] = await db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.id, id));
    return project;
  }

  async getProjectsByClientId(clientId: number): Promise<ExternalRequest[]> {
    const projectsList = await db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.client_id, clientId));
    return projectsList;
  }

  async getProjectsForDevelopers(status?: string, limit?: number, offset?: number): Promise<{ projects: ExternalRequest[], total: number }> {
    let whereConditions = [eq(externalRequests.type, 'project')];

    if (status) {
      whereConditions.push(eq(externalRequests.status, status));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(externalRequests)
      .where(and(...whereConditions));

    const total = countResult?.count || 0;

    // Get projects list
    const projectsList = await db
      .select()
      .from(externalRequests)
      .where(and(...whereConditions))
      .limit(limit || 10)
      .offset(offset || 0);

    return { projects: projectsList, total };
  }

  async updateProject(id: number, updates: Partial<InsertExternalRequest>): Promise<ExternalRequest | undefined> {
    const [updatedProject] = await db
      .update(externalRequests)
      .set({
        ...updates,
        updated_at: new Date()
      })
      .where(eq(externalRequests.id, id))
      .returning();
    return updatedProject;
  }

  async updateProjectStatus(id: number, status: string): Promise<ExternalRequest | undefined> {
    const [updatedProject] = await db
      .update(externalRequests)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(externalRequests.id, id))
      .returning();
    return updatedProject;
  }

  // Quotes
  async createQuote(quote: InsertQuote, developerId: number): Promise<Quote> {
    const [createdQuote] = await db
      .insert(quotes)
      .values({
        ...quote,
        developer_id: developerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdQuote;
  }

  async getQuotesByProjectId(projectId: number): Promise<Quote[]> {
    const quotesList = await db
      .select()
      .from(quotes)
      .where(eq(quotes.project_id, projectId));
    return quotesList;
  }

  async getQuotesByDeveloperId(developerId: number): Promise<Quote[]> {
    const quotesList = await db
      .select()
      .from(quotes)
      .where(eq(quotes.developer_id, developerId));
    return quotesList;
  }

  async getDeveloperQuoteForProject(developerId: number, projectId: number): Promise<Quote | undefined> {
    const [quote] = await db
      .select()
      .from(quotes)
      .where(and(eq(quotes.developer_id, developerId), eq(quotes.project_id, projectId)));
    return quote;
  }

  async getQuoteById(id: number): Promise<Quote | undefined> {
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, id));
    return quote;
  }

  async updateQuoteStatus(id: number, status: string): Promise<Quote | undefined> {
    const [updatedQuote] = await db
      .update(quotes)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(quotes.id, id))
      .returning();
    return updatedQuote;
  }

  async rejectOtherQuotes(projectId: number, acceptedQuoteId: number): Promise<void> {
    await db
      .update(quotes)
      .set({
        status: 'rejected',
        updated_at: new Date()
      })
      .where(and(eq(quotes.project_id, projectId), sql`${quotes.id} != ${acceptedQuoteId}`));
  }

  // Messages
  async sendMessage(message: InsertMessage, senderId: number): Promise<Message> {
    const [createdMessage] = await db
      .insert(messages)
      .values({
        ...message,
        sender_id: senderId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdMessage;
  }

  async getMessagesByProjectId(projectId: number): Promise<Message[]> {
    const messagesList = await db
      .select()
      .from(messages)
      .where(eq(messages.project_id, projectId));
    return messagesList;
  }

  // Portfolios
  async createPortfolio(portfolio: InsertPortfolio, developerId: number): Promise<Portfolio> {
    const [createdPortfolio] = await db
      .insert(portfolios)
      .values({
        ...portfolio,
        developer_id: developerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdPortfolio;
  }

  async getPortfolioById(id: number): Promise<Portfolio | undefined> {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.id, id));
    return portfolio;
  }

  async getPortfoliosByDeveloperId(developerId: number): Promise<Portfolio[]> {
    const portfoliosList = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.developer_id, developerId));
    return portfoliosList;
  }

  async getDeveloperPortfolio(developerId: number): Promise<Portfolio[]> {
    const portfoliosList = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.developer_id, developerId));
    return portfoliosList;
  }

  async getAllPortfolios(limit?: number, offset?: number): Promise<{ portfolios: Portfolio[], total: number }> {
    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(portfolios);

    const total = countResult?.count || 0;

    // Get portfolios list
    const portfoliosList = await db
      .select()
      .from(portfolios)
      .limit(limit || 10)
      .offset(offset || 0);

    return { portfolios: portfoliosList, total };
  }

  async updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
    const [updatedPortfolio] = await db
      .update(portfolios)
      .set({
        ...portfolio,
        updated_at: new Date()
      })
      .where(eq(portfolios.id, id))
      .returning();
    return updatedPortfolio;
  }

  async deletePortfolio(id: number, developerId: number): Promise<boolean> {
    const result = await db
      .delete(portfolios)
      .where(and(eq(portfolios.id, id), eq(portfolios.developer_id, developerId)));
    return result > 0;
  }

  // Portfolio Reviews
  async createPortfolioReview(review: InsertPortfolioReview, userId: number): Promise<PortfolioReview> {
    const [createdReview] = await db
      .insert(portfolioReviews)
      .values({
        ...review,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdReview;
  }

  async getPortfolioReviewsByPortfolioId(portfolioId: number): Promise<PortfolioReview[]> {
    const reviewsList = await db
      .select()
      .from(portfolioReviews)
      .where(eq(portfolioReviews.portfolio_id, portfolioId));
    return reviewsList;
  }

  async getPortfolioReviews(portfolioId: number): Promise<PortfolioReview[]> {
    const reviewsList = await db
      .select()
      .from(portfolioReviews)
      .where(eq(portfolioReviews.portfolio_id, portfolioId));
    return reviewsList;
  }

  async getClientReviewForPortfolio(clientId: number, portfolioId: number): Promise<PortfolioReview | undefined> {
    const [review] = await db
      .select()
      .from(portfolioReviews)
      .where(and(eq(portfolioReviews.client_id, clientId), eq(portfolioReviews.portfolio_id, portfolioId)));
    return review;
  }

  async deletePortfolioReview(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(portfolioReviews)
      .where(and(eq(portfolioReviews.id, id), eq(portfolioReviews.user_id, userId)));
    return result > 0;
  }

  // Phase 3: Marketplace
  // Products
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

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    // Get products list
    const productsList = await db
      .select()
      .from(products)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { products: productsList, total };
  }

  async getProductsByCategory(category: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }> {
    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(eq(products.category, category));

    const total = countResult?.count || 0;

    // Get products list
    const productsList = await db
      .select()
      .from(products)
      .where(eq(products.category, category))
      .limit(limit || 10)
      .offset(offset || 0);

    return { products: productsList, total };
  }

  async getProductsBySellerId(sellerId: number): Promise<Product[]> {
    const productsList = await db
      .select()
      .from(products)
      .where(eq(products.seller_id, sellerId));
    return productsList;
  }

  async searchProducts(search: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }> {
    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(ilike(products.name, `%${search}%`));

    const total = countResult?.count || 0;

    // Get products list
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
    return result > 0;
  }

  // Orders
  async createOrder(order: InsertOrder, items: InsertOrderItem[], buyerId: number): Promise<Order> {
    return await db.transaction(async (tx) => {
      // Create the order
      const [createdOrder] = await tx
        .insert(orders)
        .values({
          ...order,
          buyer_id: buyerId,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();

      // Create the order items
      await tx.insert(orderItems).values(
        items.map(item => ({
          ...item,
          order_id: createdOrder.id,
          created_at: new Date(),
          updated_at: new Date()
        }))
      );

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

    if (params?.search) {
      whereConditions.push(sql`CAST(${orders.id} AS TEXT) LIKE ${`%${params.search}%`}`);
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    // Get orders list
    const ordersList = await db
      .select()
      .from(orders)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { orders: ordersList, total };
  }

  async getOrdersByBuyerId(buyerId: number): Promise<Order[]> {
    const ordersList = await db
      .select()
      .from(orders)
      .where(eq(orders.buyer_id, buyerId));
    return ordersList;
  }

  async getBuyerOrders(buyerId: number): Promise<Order[]> {
    const ordersList = await db
      .select()
      .from(orders)
      .where(eq(orders.buyer_id, buyerId));
    return ordersList;
  }

  async getOrdersBySellerId(sellerId: number): Promise<Order[]> {
    const ordersList = await db
      .select()
      .from(orders)
      .where(eq(orders.seller_id, sellerId));
    return ordersList;
  }

  async getSellerOrders(sellerId: number): Promise<Order[]> {
    const ordersList = await db
      .select()
      .from(orders)
      .where(eq(orders.seller_id, sellerId));
    return ordersList;
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

  // Payments
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
    const paymentsList = await db
      .select()
      .from(payments)
      .where(eq(payments.order_id, orderId));
    return paymentsList;
  }

  async getAllPayments(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ payments: Payment[], total: number }> {
    let whereConditions = [];

    if (params?.status) {
      whereConditions.push(eq(payments.status, params.status));
    }

    if (params?.search) {
      whereConditions.push(sql`CAST(${payments.id} AS TEXT) LIKE ${`%${params.search}%`}`);
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(payments)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    // Get payments list
    const paymentsList = await db
      .select()
      .from(payments)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { payments: paymentsList, total };
  }

  async getClientPayments(clientId: number): Promise<Payment[]> {
    const paymentsList = await db
      .select()
      .from(payments)
      .where(eq(payments.client_id, clientId));
    return paymentsList;
  }

  async getDeveloperPayments(developerId: number): Promise<Payment[]> {
    const paymentsList = await db
      .select()
      .from(payments)
      .where(eq(payments.developer_id, developerId));
    return paymentsList;
  }

  async getBuyerPayments(buyerId: number): Promise<Payment[]> {
    const paymentsList = await db
      .select()
      .from(payments)
      .where(eq(payments.buyer_id, buyerId));
    return paymentsList;
  }

  async getSellerPayments(sellerId: number): Promise<Payment[]> {
    const paymentsList = await db
      .select()
      .from(payments)
      .where(eq(payments.seller_id, sellerId));
    return paymentsList;
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
      .where(and(eq(payments.id, id), eq(payments.buyer_id, buyerId)))
      .returning();
    return updatedPayment;
  }

  // Product Reviews
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
    const reviewsList = await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.product_id, productId));
    return reviewsList;
  }

  async getProductReviews(productId: number): Promise<ProductReview[]> {
    const reviewsList = await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.product_id, productId));
    return reviewsList;
  }

  async getUserReviewForProduct(userId: number, productId: number): Promise<ProductReview | undefined> {
    const [review] = await db
      .select()
      .from(productReviews)
      .where(and(eq(productReviews.user_id, userId), eq(productReviews.product_id, productId)));
    return review;
  }

  async getProductReviewsByBuyerId(buyerId: number): Promise<ProductReview[]> {
    const reviewsList = await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.buyer_id, buyerId));
    return reviewsList;
  }

  async deleteProductReview(id: number, buyerId: number): Promise<boolean> {
    const result = await db
      .delete(productReviews)
      .where(and(eq(productReviews.id, id), eq(productReviews.buyer_id, buyerId)));
    return result > 0;
  }

  // Seller Profile Management
  async createSellerProfile(profile: InsertSellerProfile, userId: number): Promise<SellerProfile> {
    const [createdProfile] = await db
      .insert(sellerProfiles)
      .values({
        ...profile,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
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
    const profilesList = await db
      .select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.verification_status, 'pending'));
    return profilesList;
  }

  // Cart Management
  async addToCart(item: InsertCartItem, userId: number): Promise<CartItem> {
    const [cartItem] = await db
      .insert(cartItems)
      .values({
        ...item,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return cartItem;
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    const cartItemsList = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.user_id, userId));
    return cartItemsList;
  }

  async getCartItemsWithProducts(userId: number): Promise<any[]> {
    return db
      .select({
        id: cartItems.id,
        user_id: cartItems.user_id,
        product_id: cartItems.product_id,
        quantity: cartItems.quantity,
        created_at: cartItems.created_at,
        product: {
          id: products.id,
          title: products.title,
          description: products.description,
          price: products.price,
          images: products.images,
          category: products.category,
          seller_id: products.seller_id,
          status: products.status,
          stock_quantity: products.stock_quantity,
        }
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.product_id, products.id))
      .where(
        and(
          eq(cartItems.user_id, userId),
          eq(products.status, 'approved')
        )
      )
      .orderBy(cartItems.created_at);
  }

  async updateCartItemQuantity(itemId: number, quantity: number, userId: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(
          eq(cartItems.id, itemId),
          eq(cartItems.user_id, userId)
        )
      )
      .returning();

    return updatedItem;
  }

  async removeFromCart(itemId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.user_id, userId)));
    return result > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.user_id, userId));
    return result > 0;
  }

  // Support Tickets
  async createSupportTicket(ticket: InsertSupportTicket, buyerId: number): Promise<SupportTicket> {
    const [createdTicket] = await db
      .insert(supportTickets)
      .values({
        ...ticket,
        buyer_id: buyerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdTicket;
  }

  async getSupportTickets(userId: number): Promise<SupportTicket[]> {
    const ticketsList = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.user_id, userId));
    return ticketsList;
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
      .values({
        ...analytics,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdAnalytics;
  }

  async getSalesAnalytics(sellerId: number, filters?: { startDate?: Date; endDate?: Date; }): Promise<SalesAnalytics[]> {
    const query = db
      .select()
      .from(salesAnalytics)
      .where(eq(salesAnalytics.seller_id, sellerId));

    if (filters?.startDate) {
      query.where(sql`${salesAnalytics.created_at} >= ${filters.startDate}`);
    }

    if (filters?.endDate) {
      query.where(sql`${salesAnalytics.created_at} <= ${filters.endDate}`);
    }

    const analyticsList = await query;
    return analyticsList;
  }

  // IT Services
  // Service Requests
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

  async getServiceRequestsByClient(clientId: number): Promise<ServiceRequest[]> {
    const requestsList = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.client_id, clientId));
    return requestsList;
  }

  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    const requestsList = await db
      .select()
      .from(serviceRequests);
    return requestsList;
  }

  async updateServiceRequest(id: number, request: Partial<InsertServiceRequest>): Promise<ServiceRequest | undefined> {
    const [updatedRequest] = await db
      .update(serviceRequests)
      .set({
        ...request,
        updated_at: new Date()
      })
      .where(eq(serviceRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async updateServiceRequestStatus(id: number, status: string, adminNotes?: string): Promise<ServiceRequest | undefined> {
    const [updatedRequest] = await db
      .update(serviceRequests)
      .set({
        status,
        admin_notes: adminNotes,
        updated_at: new Date()
      })
      .where(eq(serviceRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Service Quotations
  async createServiceQuotation(quotation: InsertServiceQuotation, adminId: number): Promise<ServiceQuotation> {
    const [createdQuotation] = await db
      .insert(serviceQuotations)
      .values({
        ...quotation,
        admin_id: adminId,
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

  async getServiceQuotationsByRequest(requestId: number): Promise<ServiceQuotation[]> {
    const quotationsList = await db
      .select()
      .from(serviceQuotations)
      .where(eq(serviceQuotations.request_id, requestId));
    return quotationsList;
  }

  async getAllServiceQuotations(): Promise<ServiceQuotation[]> {
    const quotationsList = await db
      .select()
      .from(serviceQuotations);
    return quotationsList;
  }

  async updateServiceQuotation(id: number, quotation: Partial<InsertServiceQuotation>): Promise<ServiceQuotation | undefined> {
    const [updatedQuotation] = await db
      .update(serviceQuotations)
      .set({
        ...quotation,
        updated_at: new Date()
      })
      .where(eq(serviceQuotations.id, id))
      .returning();
    return updatedQuotation;
  }

  async updateServiceQuotationStatus(id: number, status: string, clientResponse?: string): Promise<ServiceQuotation | undefined> {
    const [updatedQuotation] = await db
      .update(serviceQuotations)
      .set({
        status,
        client_response: clientResponse,
        updated_at: new Date()
      })
      .where(eq(serviceQuotations.id, id))
      .returning();
    return updatedQuotation;
  }

  // Service Projects
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

  async getServiceProjectsByClient(clientId: number): Promise<ServiceProject[]> {
    const projectsList = await db
      .select()
      .from(serviceProjects)
      .where(eq(serviceProjects.client_id, clientId));
    return projectsList;
  }

  async getServiceProjectsByAdmin(adminId: number): Promise<ServiceProject[]> {
    const projectsList = await db
      .select()
      .from(serviceProjects)
      .where(eq(serviceProjects.admin_id, adminId));
    return projectsList;
  }

  async getAllServiceProjects(): Promise<ServiceProject[]> {
    const projectsList = await db
      .select()
      .from(serviceProjects);
    return projectsList;
  }

  async updateServiceProject(id: number, project: Partial<InsertServiceProject>): Promise<ServiceProject | undefined> {
    const [updatedProject] = await db
      .update(serviceProjects)
      .set({
        ...project,
        updated_at: new Date()
      })
      .where(eq(serviceProjects.id, id))
      .returning();
    return updatedProject;
  }

  async updateServiceProjectProgress(id: number, progress: number, adminNotes?: string): Promise<ServiceProject | undefined> {
    const [updatedProject] = await db
      .update(serviceProjects)
      .set({
        progress,
        admin_notes: adminNotes,
        updated_at: new Date()
      })
      .where(eq(serviceProjects.id, id))
      .returning();
    return updatedProject;
  }

  // Service Payments
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

  async getServicePaymentsByQuotation(quotationId: number): Promise<ServicePayment[]> {
    const paymentsList = await db
      .select()
      .from(servicePayments)
      .where(eq(servicePayments.quotation_id, quotationId));
    return paymentsList;
  }

  async getServicePaymentsByClient(clientId: number): Promise<ServicePayment[]> {
    const paymentsList = await db
      .select()
      .from(servicePayments)
      .where(eq(servicePayments.client_id, clientId));
    return paymentsList;
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

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [createdNotification] = await db
      .insert(notifications)
      .values({
        ...notification,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdNotification;
  }

  async getUserNotifications(userId: number, params?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<{ notifications: Notification[], total: number }> {
    let whereConditions = [eq(notifications.user_id, userId)];

    if (params?.unreadOnly) {
      whereConditions.push(eq(notifications.is_read, false));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(and(...whereConditions));

    const total = countResult?.count || 0;

    // Get notifications list
    const notificationsList = await db
      .select()
      .from(notifications)
      .where(and(...whereConditions))
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { notifications: notificationsList, total };
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const [result] = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(notifications)
      .where(and(eq(notifications.user_id, userId), eq(notifications.is_read, false)));
    return result.count;
  }

  async markNotificationAsRead(id: number, userId: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({
        is_read: true,
        updated_at: new Date()
      })
      .where(and(eq(notifications.id, id), eq(notifications.user_id, userId)))
      .returning();
    return updatedNotification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({
        is_read: true,
        updated_at: new Date()
      })
      .where(eq(notifications.user_id, userId));
    return result > 0;
  }

  async deleteNotification(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.user_id, userId)));
    return result > 0;
  }

  // Chat
  async getUserChatRooms(userId: number): Promise<ChatRoom[]> {
    const rooms = await db
      .select({
        room: chatRooms,
      })
      .from(chatRoomMembers)
      .innerJoin(chatRooms, eq(chatRoomMembers.room_id, chatRooms.id))
      .where(eq(chatRoomMembers.user_id, userId))
      .orderBy(desc(chatRooms.updated_at));

    return rooms.map(r => r.room);
  }

  async getChatRoomById(roomId: number): Promise<ChatRoom | undefined> {
    const [room] = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.id, roomId));
    return room;
  }

  async createDirectChatRoom(userId: number, participantId: number): Promise<ChatRoom> {
    return await db.transaction(async (tx) => {
      const [room] = await tx
        .insert(chatRooms)
        .values({
          type: 'direct',
          created_by: userId,
        })
        .returning();

      await tx.insert(chatRoomMembers).values([
        { room_id: room.id, user_id: userId },
        { room_id: room.id, user_id: participantId }
      ]);

      return room;
    });
  }

  async getDirectChatRoom(userId: number, participantId: number): Promise<ChatRoom | undefined> {
    const rooms = await db
      .select({
        room: chatRooms,
        memberCount: sql<number>`COUNT(DISTINCT ${chatRoomMembers.user_id})`.as('member_count')
      })
      .from(chatRooms)
      .innerJoin(chatRoomMembers, eq(chatRooms.id, chatRoomMembers.room_id))
      .where(
        and(
          eq(chatRooms.type, 'direct'),
          inArray(chatRoomMembers.user_id, [userId, participantId])
        )
      )
      .groupBy(chatRooms.id)
      .having(sql`COUNT(DISTINCT ${chatRoomMembers.user_id}) = 2`);

    return rooms[0]?.room;
  }

  async createGroupChatRoom(name: string, creatorId: number, participantIds: number[]): Promise<ChatRoom> {
    return await db.transaction(async (tx) => {
      const [room] = await tx
        .insert(chatRooms)
        .values({
          type: 'group',
          name,
          created_by: creatorId,
        })
        .returning();

      const allMembers = [creatorId, ...participantIds];
      const uniqueMembers = Array.from(new Set(allMembers));

      await tx.insert(chatRoomMembers).values(
        uniqueMembers.map(userId => ({
          room_id: room.id,
          user_id: userId
        }))
      );

      return room;
    });
  }

  async isChatRoomMember(roomId: number, userId: number): Promise<boolean> {
    const [member] = await db
      .select()
      .from(chatRoomMembers)
      .where(
        and(
          eq(chatRoomMembers.room_id, roomId),
          eq(chatRoomMembers.user_id, userId)
        )
      );
    return !!member;
  }

  async getChatMessages(roomId: number, limit: number = 50, before?: number): Promise<ChatMessage[]> {
    let query = db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.room_id, roomId));

    if (before) {
      query = db
        .select()
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.room_id, roomId),
            sql`${chatMessages.id} < ${before}`
          )
        );
    }

    const messages = await query
      .orderBy(desc(chatMessages.created_at))
      .limit(limit);

    return messages.reverse();
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [createdMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();

    await db
      .update(chatRooms)
      .set({ updated_at: new Date() })
      .where(eq(chatRooms.id, message.room_id));

    return createdMessage;
  }

  async markMessagesAsRead(roomId: number, userId: number): Promise<void> {
    await db
      .update(chatMessages)
      .set({ status: 'read' })
      .where(
        and(
          eq(chatMessages.room_id, roomId),
          sql`${chatMessages.sender_id} != ${userId}`,
          sql`${chatMessages.status} != 'read'`
        )
      );
  }

  async updateUserPresence(userId: number, status: string): Promise<void> {
    const isOnline = status === 'online';

    const [existing] = await db
      .select()
      .from(userPresence)
      .where(eq(userPresence.user_id, userId));

    if (existing) {
      await db
        .update(userPresence)
        .set({
          is_online: isOnline,
          last_seen: new Date()
        })
        .where(eq(userPresence.user_id, userId));
    } else {
      await db
        .insert(userPresence)
        .values({
          user_id: userId,
          is_online: isOnline,
          last_seen: new Date()
        });
    }
  }

  async getOnlineUsers(): Promise<User[]> {
    const onlineUsers = await db
      .select({
        user: users
      })
      .from(users)
      .innerJoin(userPresence, eq(users.id, userPresence.user_id))
      .where(eq(userPresence.is_online, true));

    return onlineUsers.map(u => u.user);
  }

  // FCM Token Management for Push Notifications
  async saveFCMToken(userId: number, token: string, deviceType: string = 'web'): Promise<void> {
    try {
      // Use raw SQL for upsert operation
      await pool.query(
        `INSERT INTO fcm_tokens (user_id, token, device_type, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (user_id, token)
         DO UPDATE SET 
           updated_at = NOW(),
           active = true`,
        [userId, token, deviceType]
      );
      console.log(`✅ Saved FCM token for user ${userId}`);
    } catch (error) {
      console.error('Failed to save FCM token:', error);
      throw error;
    }
  }

  async getUserFCMTokens(userId: number): Promise<string[]> {
    try {
      const result = await pool.query(
        `SELECT token FROM fcm_tokens 
         WHERE user_id = $1 AND active = true`,
        [userId]
      );
      return result.rows.map((row: any) => row.token);
    } catch (error) {
      console.error('Failed to get user FCM tokens:', error);
      return [];
    }
  }

  async deleteFCMToken(token: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `UPDATE fcm_tokens SET active = false WHERE token = $1`,
        [token]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Failed to delete FCM token:', error);
      return false;
    }
  }

  async deleteUserFCMTokens(userId: number): Promise<boolean> {
    try {
      const result = await pool.query(
        `UPDATE fcm_tokens SET active = false WHERE user_id = $1`,
        [userId]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Failed to delete user FCM tokens:', error);
      return false;
    }
  }

  async cleanupInvalidTokens(invalidTokens: string[]): Promise<void> {
    if (invalidTokens.length === 0) return;

    try {
      // Mark invalid tokens as inactive
      await pool.query(
        `UPDATE fcm_tokens 
         SET active = false 
         WHERE token = ANY($1::text[])`,
        [invalidTokens]
      );
      console.log(`🧹 Cleaned up ${invalidTokens.length} invalid FCM tokens`);
    } catch (error) {
      console.error('Failed to cleanup invalid FCM tokens:', error);
    }
  }

  // Admin Dashboard Methods
  async getAdminStatistics(): Promise<{
    totalUsers: number;
    totalSoftware: number;
    totalOrders: number;
    totalRevenue: number;
    usersTrend?: { value: number; isPositive: boolean };
    softwareTrend?: { value: number; isPositive: boolean };
    ordersTrend?: { value: number; isPositive: boolean };
    revenueTrend?: { value: number; isPositive: boolean };
  }> {
    try {
      // Get total counts
      const [usersCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
      const [softwareCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(softwares);
      const [ordersCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);

      // Get total revenue
      const [revenueResult] = await db.select({
        total: sql<string>`COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0)`
      }).from(orders);

      return {
        totalUsers: usersCount?.count || 0,
        totalSoftware: softwareCount?.count || 0,
        totalOrders: ordersCount?.count || 0,
        totalRevenue: parseFloat(revenueResult?.total || '0'),
      };
    } catch (error) {
      console.error('Failed to get admin statistics:', error);
      return {
        totalUsers: 0,
        totalSoftware: 0,
        totalOrders: 0,
        totalRevenue: 0,
      };
    }
  }

  async broadcastNotification(data: {
    message: string;
    target: string;
    senderId: number
  }): Promise<{ recipientCount: number }> {
    try {
      // Get target users
      let targetUsers: User[] = [];

      if (data.target === 'all') {
        targetUsers = await db.select().from(users);
      } else {
        targetUsers = await db.select().from(users).where(eq(users.role, data.target as any));
      }

      // Create notifications for each user
      const notificationPromises = targetUsers.map(user =>
        this.createNotification({
          user_id: user.id,
          title: 'Admin Notification',
          message: data.message,
          type: 'admin',
        })
      );

      await Promise.all(notificationPromises);

      return { recipientCount: targetUsers.length };
    } catch (error) {
      console.error('Failed to broadcast notification:', error);
      return { recipientCount: 0 };
    }
  }

  async getNotificationHistory(params: {
    limit: number;
    offset: number
  }): Promise<{ notifications: any[], total: number }> {
    try {
      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(notifications)
        .where(eq(notifications.type, 'admin'));

      // Get notifications
      const notificationsList = await db
        .select()
        .from(notifications)
        .where(eq(notifications.type, 'admin'))
        .orderBy(desc(notifications.created_at))
        .limit(params.limit)
        .offset(params.offset);

      return {
        notifications: notificationsList,
        total: countResult?.count || 0,
      };
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return {
        notifications: [],
        total: 0,
      };
    }
  }

  // Seller Dashboard Methods
  async getSellerStatistics(sellerId: number): Promise<{
    totalProducts: number;
    totalSales: number;
    totalRevenue: number;
    averageRating: number;
  }> {
    try {
      // Get total products
      const [productsCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(products)
        .where(eq(products.seller_id, sellerId));

      // Get total sales and revenue from orders
      const [salesData] = await db
        .select({
          count: sql<number>`COUNT(*)`,
          revenue: sql<string>`COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0)`,
        })
        .from(orders)
        .where(eq(orders.seller_id, sellerId));

      // Get average rating
      const [ratingData] = await db
        .select({
          avg: sql<string>`COALESCE(AVG(rating), 0)`,
        })
        .from(reviews)
        .where(eq(reviews.target_type, 'product'));

      return {
        totalProducts: productsCount?.count || 0,
        totalSales: salesData?.count || 0,
        totalRevenue: parseFloat(salesData?.revenue || '0'),
        averageRating: parseFloat(ratingData?.avg || '0'),
      };
    } catch (error) {
      console.error('Failed to get seller statistics:', error);
      return {
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: 0,
        averageRating: 0,
      };
    }
  }

  // Buyer Dashboard Methods
  async getBuyerStatistics(buyerId: number): Promise<{
    totalPurchases: number;
    totalFavorites: number;
    totalDownloads: number;
    reviewsWritten: number;
  }> {
    try {
      // Get total purchases
      const [purchasesCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders)
        .where(eq(orders.buyer_id, buyerId));

      // Get reviews written
      const [reviewsCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(reviews)
        .where(eq(reviews.user_id, buyerId));

      return {
        totalPurchases: purchasesCount?.count || 0,
        totalFavorites: 0, // TODO: implement favorites
        totalDownloads: 0, // TODO: implement downloads tracking
        reviewsWritten: reviewsCount?.count || 0,
      };
    } catch (error) {
      console.error('Failed to get buyer statistics:', error);
      return {
        totalPurchases: 0,
        totalFavorites: 0,
        totalDownloads: 0,
        reviewsWritten: 0,
      };
    }
  }

  async getBuyerPurchases(buyerId: number): Promise<any[]> {
    try {
      const purchases = await db
        .select()
        .from(orders)
        .where(eq(orders.buyer_id, buyerId))
        .orderBy(desc(orders.created_at));

      return purchases;
    } catch (error) {
      console.error('Failed to get buyer purchases:', error);
      return [];
    }
  }

  // Project Management Methods
  async getAdminProjects(filters: { status?: string; search?: string }): Promise<any[]> {
    try {
      let query = db.select().from(externalRequests);

      const conditions = [];

      if (filters.status && filters.status !== 'all') {
        conditions.push(eq(externalRequests.status, filters.status as any));
      }

      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        conditions.push(
          or(
            like(externalRequests.name, searchTerm),
            like(externalRequests.email, searchTerm),
            like(externalRequests.project_description, searchTerm)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const projects = await query.orderBy(desc(externalRequests.created_at));
      return projects;
    } catch (error) {
      console.error('Failed to get admin projects:', error);
      return [];
    }
  }

  async getProjectStats(): Promise<Record<string, number>> {
    try {
      const stats = await db
        .select({
          status: externalRequests.status,
          count: sql<number>`count(*)::int`,
        })
        .from(externalRequests)
        .groupBy(externalRequests.status);

      const statsMap = stats.reduce((acc, stat) => {
        acc[stat.status] = stat.count;
        return acc;
      }, {} as Record<string, number>);

      return statsMap;
    } catch (error) {
      console.error('Failed to get project stats:', error);
      return {};
    }
  }

  // Courses methods
  async getCourses(filters: {
    topic?: string;
    level?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ courses: any[], total: number }> {
    try {
      const { topic, level, limit = 12, offset = 0 } = filters;

      const whereConditions: any[] = [];

      if (topic) {
        whereConditions.push(eq(courses.topic, topic));
      }

      if (level) {
        whereConditions.push(eq(courses.level, level));
      }

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(courses)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      // Get courses
      const coursesList = await db
        .select()
        .from(courses)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(courses.created_at))
        .limit(limit)
        .offset(offset);

      return {
        courses: coursesList,
        total: count
      };
    } catch (error) {
      console.error('Failed to get courses:', error);
      throw error;
    }
  }

  async getCourseTopics(): Promise<Array<{ topic: string; count: number }>> {
    try {
      const topics = await db
        .select({
          topic: courses.topic,
          count: sql<number>`count(*)::int`,
        })
        .from(courses)
        .groupBy(courses.topic)
        .orderBy(desc(sql<number>`count(*)`));

      return topics;
    } catch (error) {
      console.error('Failed to get course topics:', error);
      throw error;
    }
  }

  async getCourseById(id: number): Promise<any | undefined> {
    try {
      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, id))
        .limit(1);

      return course;
    } catch (error) {
      console.error('Failed to get course by id:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
