import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cart, CartItem, CART_STORAGE_KEY } from '../model/Cart';
import {
  StockValidationService,
  StockValidationResponse,
} from './stock-validation.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  cart$ = this.cartSubject.asObservable();

  constructor(private stockValidationService: StockValidationService) {
    this.loadCart();
  }

  get cartItems$(): Observable<CartItem[]> {
    return this.cart$.pipe(map((cart) => cart.items));
  }

  get cartTotal$(): Observable<number> {
    return this.cart$.pipe(map((cart) => cart.total));
  }

  private getStorageKey(): string {
    return CART_STORAGE_KEY;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private getInitialCart(): Cart {
    return {
      items: [],
      total: 0,
    };
  }

  private loadCart(): void {
    if (!this.isBrowser()) return;

    const storedCart = localStorage.getItem(this.getStorageKey());
    if (storedCart) {
      try {
        const cart = JSON.parse(storedCart);
        this.cartSubject.next(cart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        this.clearCart();
      }
    }
  }

  private saveCart(cart: Cart): void {
    if (!this.isBrowser()) return;

    localStorage.setItem(this.getStorageKey(), JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  /**
   * Adds item to cart, enforcing stock limits. Returns the quantity actually added (may be less than requested).
   * If the requested quantity exceeds available stock, only the available amount is added.
   */
  addToCart(item: CartItem): number {
    if (item.quantity <= 0) return 0;

    const currentCart = structuredClone(this.cartSubject.value);
    const existingIndex = currentCart.items.findIndex(
      (i) => i.productId === item.productId && i.variantId === item.variantId,
    );

    let availableStock = item.stockCount ?? Infinity;
    let currentQuantity = 0;
    if (existingIndex > -1) {
      currentQuantity = currentCart.items[existingIndex].quantity;
    }
    const maxAddable = Math.max(0, availableStock - currentQuantity);
    const quantityToAdd = Math.min(item.quantity, maxAddable);
    if (quantityToAdd <= 0) {
      // No stock left to add
      return 0;
    }

    if (existingIndex > -1) {
      const existingItem = currentCart.items[existingIndex];
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + quantityToAdd,
        variantId: item.variantId || existingItem.variantId,
      };
      currentCart.items[existingIndex] = updatedItem;
    } else {
      currentCart.items = [
        ...currentCart.items,
        { ...item, quantity: quantityToAdd },
      ];
    }

    currentCart.total = this.calculateTotal(currentCart.items);
    this.saveCart(currentCart);
    return quantityToAdd;
  }

  removeFromCart(productId: number, variantId?: number): void {
    const currentCart = structuredClone(this.cartSubject.value);
    currentCart.items = currentCart.items.filter(
      (item) => !(item.productId === productId && item.variantId === variantId),
    );
    currentCart.total = this.calculateTotal(currentCart.items);
    this.saveCart(currentCart);
  }

  updateQuantity(
    productId: number,
    quantity: number,
    variantId?: number,
  ): void {
    if (quantity < 1) {
      this.removeFromCart(productId, variantId);
      return;
    }

    const currentCart = structuredClone(this.cartSubject.value);
    const index = currentCart.items.findIndex(
      (i) => i.productId === productId && i.variantId === variantId,
    );

    if (index > -1) {
      const existingItem = currentCart.items[index];
      let newQuantity = quantity;
      if (
        existingItem.stockCount !== undefined &&
        quantity > existingItem.stockCount
      ) {
        newQuantity = existingItem.stockCount;
      }
      const updatedItem = {
        ...existingItem,
        quantity: newQuantity,
        variantId: existingItem.variantId,
      };
      currentCart.items[index] = updatedItem;
      currentCart.total = this.calculateTotal(currentCart.items);
      this.saveCart(currentCart);
    }
  }

  clearCart(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.getStorageKey());
    }
    const emptyCart = this.getInitialCart();
    this.cartSubject.next(emptyCart);
  }

  getCart(): Cart {
    return this.cartSubject.value;
  }

  handleUserLogin(userId: string): void {
    const guestCart = this.getCart();
    guestCart.userId = userId;
    this.saveCart(guestCart);
  }

  handleUserLogout(): void {
    const currentCart = this.cartSubject.value;
    delete currentCart.userId;
    this.saveCart(currentCart);
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce(
      (total, item) => total + item.afterPrice * item.quantity,
      0,
    );
  }

  /**
   * Check if there are any out-of-stock items in the cart
   */
  hasOutOfStockItems(): boolean {
    const cart = this.cartSubject.value;
    return cart.items.some((item) => item.stockCount === 0);
  }

  /**
   * Get all out-of-stock items from the cart
   */
  getOutOfStockItems(): CartItem[] {
    const cart = this.cartSubject.value;
    return cart.items.filter((item) => item.stockCount === 0);
  }

  /**
   * Get all items with stock issues (out of stock or low stock) - local check only
   */
  getItemsWithLocalStockIssues(): CartItem[] {
    const cart = this.cartSubject.value;
    return cart.items.filter(
      (item) =>
        item.stockCount === 0 ||
        (item.stockCount !== undefined && item.quantity > item.stockCount),
    );
  }

  /**
   * Check if a specific item is out of stock
   */
  isItemOutOfStock(productId: number, variantId?: number): boolean {
    const cart = this.cartSubject.value;
    const item = cart.items.find(
      (i) => i.productId === productId && i.variantId === variantId,
    );
    return item ? item.stockCount === 0 : false;
  }

  /**
   * Update stock information for cart items from server data
   * This should be called when product data is refreshed
   */
  updateStockInfo(
    updatedItems: {
      productId: number;
      variantId?: number;
      stockCount: number;
    }[],
  ): void {
    const currentCart = structuredClone(this.cartSubject.value);
    let hasChanges = false;

    currentCart.items = currentCart.items.map((item) => {
      const updatedItem = updatedItems.find(
        (updated) =>
          updated.productId === item.productId &&
          updated.variantId === item.variantId,
      );

      if (updatedItem && updatedItem.stockCount !== item.stockCount) {
        hasChanges = true;
        return { ...item, stockCount: updatedItem.stockCount };
      }

      return item;
    });

    if (hasChanges) {
      this.saveCart(currentCart);
    }
  }

  /**
   * Remove out-of-stock items from cart
   */
  removeOutOfStockItems(): void {
    const currentCart = structuredClone(this.cartSubject.value);
    const originalLength = currentCart.items.length;

    currentCart.items = currentCart.items.filter(
      (item) => item.stockCount !== 0,
    );

    if (currentCart.items.length !== originalLength) {
      currentCart.total = this.calculateTotal(currentCart.items);
      this.saveCart(currentCart);
    }
  }

  /**
   * Validate stock levels for all cart items against current server data
   */
  validateStockBeforeCheckout(): Observable<StockValidationResponse> {
    const cart = this.cartSubject.value;
    return this.stockValidationService.validateCartStock(cart.items);
  }

  /**
   * Get detailed stock validation with product information
   */
  validateStockWithDetails(): Observable<
    StockValidationResponse & { details: any[] }
  > {
    const cart = this.cartSubject.value;
    return this.stockValidationService.validateCartStockWithDetails(cart.items);
  }

  /**
   * Check if cart has stock issues (out of stock or insufficient stock)
   */
  hasStockIssues(): Observable<boolean> {
    return this.validateStockBeforeCheckout().pipe(
      map((validation) => !validation.isValid),
    );
  }

  /**
   * Get items with stock issues (out of stock or insufficient stock)
   */
  getItemsWithStockIssues(): Observable<CartItem[]> {
    return this.validateStockWithDetails().pipe(
      map((validation) => {
        if (validation.isValid) return [];

        const cart = this.cartSubject.value;
        return validation.invalidItems
          .map((invalidItem) => {
            const cartItem = cart.items.find(
              (item) =>
                item.productId === invalidItem.productId &&
                item.variantId === invalidItem.variantId,
            );
            return cartItem
              ? { ...cartItem, currentStock: invalidItem.currentStock }
              : null;
          })
          .filter((item) => item !== null) as CartItem[];
      }),
    );
  }
}
