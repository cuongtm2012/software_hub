// Base storage interface types
export interface IStorage {
  initialize(): Promise<void>;
  sessionStore: any;
}

// Re-export common types that storage modules will need
export type { 
  User, InsertUser,
  Software, InsertSoftware,
  Category, InsertCategory,
  Review, InsertReview,
  ExternalRequest, InsertExternalRequest,
  Quote, InsertQuote,
  Message, InsertMessage,
  Portfolio, InsertPortfolio,
  PortfolioReview, InsertPortfolioReview,
  Product, InsertProduct,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  Payment, InsertPayment,
  ProductReview, InsertProductReview,
  UserDownload, InsertUserDownload,
  SellerProfile, InsertSellerProfile,
  CartItem, InsertCartItem,
  SupportTicket, InsertSupportTicket,
  SalesAnalytics, InsertSalesAnalytics,
  ServiceRequest, InsertServiceRequest,
  ServiceQuotation, InsertServiceQuotation,
  ServiceProject, InsertServiceProject,
  ServicePayment, InsertServicePayment,
  UserPresence, InsertUserPresence,
  Notification, InsertNotification,
  ChatRoom, InsertChatRoom,
  ChatRoomMember, InsertChatRoomMember,
  ChatMessage, InsertChatMessage
} from "@shared/schema";
