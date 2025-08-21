/**
 * Unified Storage Export
 * 
 * This file provides backward compatibility by re-exporting the storage instance
 * from the main storage.ts file. In the future, this will be refactored to use
 * domain-specific storage modules.
 * 
 * Current structure:
 * - server/storage.ts: Main storage implementation (2606 lines)
 * - server/storage/*: Domain-specific modules (partially implemented)
 * 
 * Migration plan:
 * 1. Gradually move methods from storage.ts to domain modules
 * 2. Update this file to use domain modules instead
 * 3. Eventually delete storage.ts when all methods are migrated
 */

// Re-export from main storage file
export { storage, sessionStore } from '../storage';

// Also export domain-specific storages for direct use
export * from './user';
export * from './software';
export * from './project';
export * from './portfolio';
export * from './marketplace';
export * from './service';
export * from './chat';
export * from './notification';
