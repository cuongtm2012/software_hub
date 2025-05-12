import { pgTable, text, serial, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Role enum for user roles
export const roleEnum = pgEnum('role', ['user', 'admin']);

// Platform enum for software platforms
export const platformEnum = pgEnum('platform', ['windows', 'mac', 'linux', 'android', 'ios', 'web']);

// Status enum for software status
export const statusEnum = pgEnum('status', ['pending', 'approved', 'rejected']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default('user').notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  parent_id: integer("parent_id").references(() => categories.id),
});

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

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  softwares: many(softwares),
  reviews: many(reviews),
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

// Schemas for inserting
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  role: true,
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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Software = typeof softwares.$inferSelect;
export type InsertSoftware = z.infer<typeof insertSoftwareSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
