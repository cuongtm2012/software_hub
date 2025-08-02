import { pgTable, text, serial, integer, timestamp, boolean, pgEnum, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Role enum for user roles
export const roleEnum = pgEnum('role', ['user', 'admin', 'developer', 'client', 'seller', 'buyer']);

// Platform enum for software platforms
export const platformEnum = pgEnum('platform', ['windows', 'mac', 'linux', 'android', 'ios', 'web']);

// Status enum for software status
export const statusEnum = pgEnum('status', ['pending', 'approved', 'rejected']);

// Project status enum for project management
export const projectStatusEnum = pgEnum('project_status', ['pending', 'in_progress', 'completed', 'cancelled']);

// Quote status enum for project quotes
export const quoteStatusEnum = pgEnum('quote_status', ['pending', 'accepted', 'rejected']);

// Payment status enum for payments
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);

// Order status enum for marketplace orders
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled']);

// Product status enum for marketplace products
export const productStatusEnum = pgEnum('product_status', ['pending', 'approved', 'rejected', 'draft']);

// Seller verification status enum
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'verified', 'rejected']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default('user').notNull(),
  profile_data: jsonb("profile_data"),
  phone: text("phone"),
  email_verified: boolean("email_verified").default(false).notNull(),
  phone_verified: boolean("phone_verified").default(false).notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Seller profiles table for marketplace verification
export const sellerProfiles = pgTable("seller_profiles", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull().unique(),
  business_name: text("business_name"),
  business_type: text("business_type"), // 'individual', 'company'
  tax_id: text("tax_id"),
  business_address: text("business_address"),
  bank_account: text("bank_account"),
  verification_status: verificationStatusEnum("verification_status").default('pending').notNull(),
  verification_documents: text("verification_documents").array(),
  commission_rate: numeric("commission_rate").default('0.10').notNull(), // Default 10%
  total_sales: numeric("total_sales").default('0').notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  total_reviews: integer("total_reviews").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  parent_id: integer("parent_id"),
});

// Add self-reference after table definition
categories.parent_id = integer("parent_id").references(() => categories.id);

// Software table
export const softwares = pgTable("softwares", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category_id: integer("category_id").references(() => categories.id).notNull(),
  platform: text("platform").array().notNull(),
  download_link: text("download_link").notNull(),
  image_url: text("image_url"),
  created_by: integer("created_by").references(() => users.id).notNull(),
  status: statusEnum("status").default('pending').notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  target_type: text("target_type").notNull(), // 'software'
  target_id: integer("target_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// External Requests Table
export const externalRequests = pgTable("external_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  project_description: text("project_description").notNull(),
  status: text("status").default('new').notNull(), // 'new', 'contacted', 'converted', 'rejected'
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Phase 2: Project Management Tables
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  client_id: integer("client_id").references(() => users.id),  // Nullable for external requests
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  budget: numeric("budget"),
  deadline: timestamp("deadline"),
  status: projectStatusEnum("status").default('pending').notNull(),
  contact_email: text("contact_email"),  // For external requests
  contact_phone: text("contact_phone"),  // For external requests
  external_request_id: integer("external_request_id").references(() => externalRequests.id), // Link to external request if applicable
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").references(() => projects.id).notNull(),
  developer_id: integer("developer_id").references(() => users.id).notNull(),
  price: numeric("price").notNull(),
  timeline: text("timeline").notNull(),
  message: text("message"),
  status: quoteStatusEnum("status").default('pending').notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").references(() => projects.id).notNull(),
  sender_id: integer("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  developer_id: integer("developer_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  images: text("images").array(),
  demo_link: text("demo_link"),
  technologies: text("technologies").array(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const portfolioReviews = pgTable("portfolio_reviews", {
  id: serial("id").primaryKey(),
  portfolio_id: integer("portfolio_id").references(() => portfolios.id).notNull(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Phase 3: Marketplace Tables
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  seller_id: integer("seller_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: numeric("price").notNull(),
  price_type: text("price_type").default('fixed').notNull(), // 'fixed', 'range', 'auction'
  stock_quantity: integer("stock_quantity").default(1).notNull(),
  download_link: text("download_link"),
  product_files: text("product_files").array(),
  images: text("images").array(),
  tags: text("tags").array(),
  license_info: text("license_info"),
  status: productStatusEnum("status").default('draft').notNull(),
  featured: boolean("featured").default(false).notNull(),
  total_sales: integer("total_sales").default(0).notNull(),
  avg_rating: numeric("avg_rating", { precision: 3, scale: 2 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyer_id: integer("buyer_id").references(() => users.id).notNull(),
  seller_id: integer("seller_id").references(() => users.id).notNull(),
  status: orderStatusEnum("status").default('pending').notNull(),
  total_amount: numeric("total_amount").notNull(),
  commission_amount: numeric("commission_amount").notNull(),
  payment_method: text("payment_method").notNull(),
  download_links: text("download_links").array(),
  buyer_info: jsonb("buyer_info"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").references(() => orders.id).notNull(),
  product_id: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  price: numeric("price").notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").references(() => orders.id),
  project_id: integer("project_id").references(() => projects.id),
  amount: numeric("amount").notNull(),
  payment_method: text("payment_method").notNull(),
  status: paymentStatusEnum("status").default('pending').notNull(),
  escrow_release: boolean("escrow_release").default(false).notNull(),
  transaction_id: text("transaction_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// User Downloads table
export const userDownloads = pgTable("user_downloads", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  software_id: integer("software_id").references(() => softwares.id).notNull(),
  version: text("version").notNull(),
  downloaded_at: timestamp("downloaded_at").defaultNow().notNull(),
});

export const productReviews = pgTable("product_reviews", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").references(() => orders.id).notNull(),
  product_id: integer("product_id").references(() => products.id).notNull(),
  buyer_id: integer("buyer_id").references(() => users.id).notNull(),
  seller_id: integer("seller_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  helpful_votes: integer("helpful_votes").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Cart table for shopping cart functionality
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  product_id: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Support tickets for post-purchase support
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").references(() => orders.id),
  buyer_id: integer("buyer_id").references(() => users.id).notNull(),
  seller_id: integer("seller_id").references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").default('open').notNull(), // 'open', 'in_progress', 'resolved', 'closed'
  priority: text("priority").default('medium').notNull(), // 'low', 'medium', 'high', 'urgent'
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Sales analytics for sellers
export const salesAnalytics = pgTable("sales_analytics", {
  id: serial("id").primaryKey(),
  seller_id: integer("seller_id").references(() => users.id).notNull(),
  product_id: integer("product_id").references(() => products.id),
  date: timestamp("date").notNull(),
  revenue: numeric("revenue").notNull(),
  units_sold: integer("units_sold").notNull(),
  commission_paid: numeric("commission_paid").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
  softwares: many(softwares),
  reviews: many(reviews),
  downloads: many(userDownloads),
  clientProjects: many(projects, { relationName: "clientProjects" }),
  developerQuotes: many(quotes, { relationName: "developerQuotes" }),
  messages: many(messages, { relationName: "senderMessages" }),
  portfolios: many(portfolios),
  portfolioReviews: many(portfolioReviews),
  products: many(products, { relationName: "sellerProducts" }),
  buyerOrders: many(orders, { relationName: "buyerOrders" }),
  sellerOrders: many(orders, { relationName: "sellerOrders" }),
  productReviews: many(productReviews),
  cartItems: many(cartItems),
  supportTickets: many(supportTickets, { relationName: "buyerTickets" }),
  sellerTickets: many(supportTickets, { relationName: "sellerTickets" }),
  sellerProfile: one(sellerProfiles),
  salesAnalytics: many(salesAnalytics),
}));

export const sellerProfilesRelations = relations(sellerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [sellerProfiles.user_id],
    references: [users.id],
  }),
}));

export const softwaresRelations = relations(softwares, ({ one, many }) => ({
  category: one(categories, {
    fields: [softwares.category_id],
    references: [categories.id],
  }),
  creator: one(users, {
    fields: [softwares.created_by],
    references: [users.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.user_id],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(users, {
    fields: [projects.client_id],
    references: [users.id],
  }),
  quotes: many(quotes),
  messages: many(messages),
  payments: many(payments),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  project: one(projects, {
    fields: [quotes.project_id],
    references: [projects.id],
  }),
  developer: one(users, {
    fields: [quotes.developer_id],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  project: one(projects, {
    fields: [messages.project_id],
    references: [projects.id],
  }),
  sender: one(users, {
    fields: [messages.sender_id],
    references: [users.id],
  }),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  developer: one(users, {
    fields: [portfolios.developer_id],
    references: [users.id],
  }),
  reviews: many(portfolioReviews),
}));

export const portfolioReviewsRelations = relations(portfolioReviews, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [portfolioReviews.portfolio_id],
    references: [portfolios.id],
  }),
  user: one(users, {
    fields: [portfolioReviews.user_id],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, {
    fields: [products.seller_id],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  reviews: many(productReviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.buyer_id],
    references: [users.id],
    relationName: "buyerOrders",
  }),
  seller: one(users, {
    fields: [orders.seller_id],
    references: [users.id],
    relationName: "sellerOrders",
  }),
  orderItems: many(orderItems),
  payment: many(payments),
  reviews: many(productReviews),
  supportTickets: many(supportTickets),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.product_id],
    references: [products.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.order_id],
    references: [orders.id],
  }),
  project: one(projects, {
    fields: [payments.project_id],
    references: [projects.id],
  }),
}));

export const userDownloadsRelations = relations(userDownloads, ({ one }) => ({
  user: one(users, {
    fields: [userDownloads.user_id],
    references: [users.id],
  }),
  software: one(softwares, {
    fields: [userDownloads.software_id],
    references: [softwares.id],
  }),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  order: one(orders, {
    fields: [productReviews.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [productReviews.product_id],
    references: [products.id],
  }),
  buyer: one(users, {
    fields: [productReviews.buyer_id],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [productReviews.seller_id],
    references: [users.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.user_id],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.product_id],
    references: [products.id],
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  order: one(orders, {
    fields: [supportTickets.order_id],
    references: [orders.id],
  }),
  buyer: one(users, {
    fields: [supportTickets.buyer_id],
    references: [users.id],
    relationName: "buyerTickets",
  }),
  seller: one(users, {
    fields: [supportTickets.seller_id],
    references: [users.id],
    relationName: "sellerTickets",
  }),
}));

export const salesAnalyticsRelations = relations(salesAnalytics, ({ one }) => ({
  seller: one(users, {
    fields: [salesAnalytics.seller_id],
    references: [users.id],
  }),
  product: one(products, {
    fields: [salesAnalytics.product_id],
    references: [products.id],
  }),
}));

// Schemas for inserting
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
  profile_data: true,
});

export const insertSoftwareSchema = createInsertSchema(softwares).omit({
  id: true,
  created_at: true,
  created_by: true,
  status: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  created_at: true,
  user_id: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

// External request schema
export const insertExternalRequestSchema = createInsertSchema(externalRequests).omit({
  id: true,
  created_at: true,
  status: true,
});

// Phase 2 schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  created_at: true,
  status: true,
  client_id: true,
  external_request_id: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  created_at: true,
  status: true,
  developer_id: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  created_at: true,
  sender_id: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  created_at: true,
  developer_id: true,
});

export const insertPortfolioReviewSchema = createInsertSchema(portfolioReviews).omit({
  id: true,
  created_at: true,
  user_id: true,
});

// Phase 3 schemas
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  created_at: true,
  updated_at: true,
  seller_id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  created_at: true,
  updated_at: true,
  status: true,
  buyer_id: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  created_at: true,
  status: true,
  escrow_release: true,
});

export const insertProductReviewSchema = createInsertSchema(productReviews).omit({
  id: true,
  created_at: true,
  buyer_id: true,
});

export const insertUserDownloadSchema = createInsertSchema(userDownloads).omit({
  id: true,
  downloaded_at: true,
  user_id: true,
});

// New marketplace schemas
export const insertSellerProfileSchema = createInsertSchema(sellerProfiles).omit({
  id: true,
  created_at: true,
  updated_at: true,
  user_id: true,
  verification_status: true,
  total_sales: true,
  rating: true,
  total_reviews: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  created_at: true,
  user_id: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  created_at: true,
  updated_at: true,
  buyer_id: true,
});

export const insertSalesAnalyticsSchema = createInsertSchema(salesAnalytics).omit({
  id: true,
  created_at: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Software = typeof softwares.$inferSelect;
export type InsertSoftware = z.infer<typeof insertSoftwareSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// Phase 2 types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;

export type PortfolioReview = typeof portfolioReviews.$inferSelect;
export type InsertPortfolioReview = z.infer<typeof insertPortfolioReviewSchema>;

// Phase 3 types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;

export type UserDownload = typeof userDownloads.$inferSelect;
export type InsertUserDownload = z.infer<typeof insertUserDownloadSchema>;

export type ExternalRequest = typeof externalRequests.$inferSelect;
export type InsertExternalRequest = z.infer<typeof insertExternalRequestSchema>;

// New marketplace types
export type SellerProfile = typeof sellerProfiles.$inferSelect;
export type InsertSellerProfile = z.infer<typeof insertSellerProfileSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

export type SalesAnalytics = typeof salesAnalytics.$inferSelect;
export type InsertSalesAnalytics = z.infer<typeof insertSalesAnalyticsSchema>;
