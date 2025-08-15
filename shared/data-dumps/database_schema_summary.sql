-- SoftwareHub Database Schema Summary
-- Export Date: 2025-08-15 13:38:00 UTC
-- Database: PostgreSQL
-- Total Tables: 29

-- Core User Management Tables
-- users: 5 records (admin, sellers, buyers)
-- seller_profiles: 2 verified sellers
-- notifications: 5 system notifications

-- Project Management Tables  
-- external_requests: 8 custom development requests
-- service_requests: Project service requests
-- service_projects: Active development projects
-- service_quotations: Project quotes and pricing
-- quotes: General quotation system

-- Marketplace & E-commerce Tables
-- products: 10 marketplace items
-- orders: 10 completed transactions (₫47,700,000 total revenue)
-- order_items: Individual order line items
-- cart_items: Shopping cart functionality
-- payments: Payment processing records
-- sales_analytics: Revenue and performance tracking

-- Software Catalog Tables
-- softwares: 93 approved applications
-- categories: 21 software categories
-- user_downloads: Download tracking

-- Communication & Support Tables
-- chat_rooms: Real-time messaging system
-- chat_messages: Chat history
-- chat_room_members: Room membership
-- messages: General messaging
-- support_tickets: Customer support system

-- Review & Rating Tables
-- reviews: General review system
-- product_reviews: Marketplace product reviews  
-- portfolio_reviews: Developer portfolio reviews

-- Portfolio & Developer Tables
-- portfolios: Developer showcase projects

-- Session & Authentication Tables
-- session: User session management
-- user_presence: Online status tracking

-- Financial & Service Tables
-- service_payments: Development service payments

-- Key Statistics:
-- - Total Revenue: ₫47,700,000 VND
-- - Commission Earned: ₫1,327,992 VND (10% average rate)
-- - Software Catalog: 93 applications across 21 categories
-- - User Base: 5 users (1 admin, 2 sellers, 1 buyer, 1 regular user)
-- - Order Completion Rate: 100% (10/10 orders completed)
-- - Seller Verification Rate: 100% (2/2 sellers verified)

-- Vietnamese Market Focus:
-- - VND currency integration
-- - Vietnamese language support in product descriptions
-- - Local banking integration (Vietcombank)
-- - Vietnamese phone number formats supported

-- Technical Infrastructure:
-- - PostgreSQL for relational data
-- - Cloudflare R2 for file storage
-- - SendGrid for email services  
-- - Stripe for payment processing
-- - Firebase for push notifications
-- - Socket.IO for real-time features

-- Platform Capabilities:
-- - Multi-role user system (admin/seller/buyer)
-- - Real-time chat and notifications
-- - File upload and management
-- - Payment processing with commission tracking
-- - Software catalog with categorization
-- - Custom development project requests
-- - Seller verification and approval system
-- - Order management and fulfillment

-- Export completed successfully
-- All foreign key relationships preserved
-- Data integrity maintained across all tables