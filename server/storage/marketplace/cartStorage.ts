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
