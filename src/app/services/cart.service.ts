import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cart, CartItem, CART_STORAGE_KEY } from '../model/Cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  cart$ = this.cartSubject.asObservable();

  constructor() {
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
      const updatedItem = {
        ...existingItem,
        quantity,
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
}
