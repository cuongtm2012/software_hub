/**
 * Storage Module - Main Entry Point
 * 
 * This file provides a centralized export point for all domain-based storage modules.
 * Each domain is organized into its own subfolder with dedicated storage classes.
 * 
 * Domain Structure:
 * - user/         : User authentication, profiles, and management
 * - software/     : Software catalog, downloads, reviews, and categories
 * - project/      : External projects, quotes, and project messages
 * - portfolio/    : Developer portfolios and portfolio reviews
 * - marketplace/  : Products, orders, payments, cart, seller profiles, support
 * - service/      : IT service requests, quotations, projects, and payments
 * - chat/         : Chat rooms, messages, and presence tracking
 * - notification/ : User notifications and alerts
 * 
 * Usage Example:
 * ```typescript
 * import { userStorage, productStorage, chatStorage } from '@/storage';
 * 
 * // Use domain-specific storage
 * const user = await userStorage.getUserById(1);
 * const products = await productStorage.getAllProducts();
 * const messages = await chatStorage.getMessagesByRoomId(roomId);
 * ```
 */

// User Domain
export * from './user';

// Software Domain
export * from './software';

// Project Domain
export * from './project';

// Portfolio Domain
export * from './portfolio';

// Marketplace Domain
export * from './marketplace';

// Service Domain
export * from './service';

// Chat Domain
export * from './chat';

// Notification Domain
export * from './notification';
