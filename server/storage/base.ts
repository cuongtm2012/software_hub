/**
 * Base utilities and re-exports for storage modules
 */

import { db } from "../db";
import { eq, and, desc, sql, like, ilike, inArray, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "../db";

// Export database utilities
export { db, eq, and, desc, sql, like, ilike, inArray, or };

// Export session store
export const PostgresSessionStore = connectPg(session);
export { pool };

// Re-export all schema types and tables
export {
    users, softwares, categories, reviews, userDownloads,
    externalRequests, quotes, messages, portfolios, portfolioReviews,
    products, orders, orderItems, payments, productReviews,
    sellerProfiles, cartItems, supportTickets, salesAnalytics,
    serviceRequests, serviceQuotations, serviceProjects, servicePayments,
    userPresence, notifications,
    chatRooms, chatRoomMembers, chatMessages,
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
