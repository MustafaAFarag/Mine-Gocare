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

  addToCart(item: CartItem): void {
    if (item.quantity <= 0) return;

    const currentCart = structuredClone(this.cartSubject.value);
    const existingIndex = currentCart.items.findIndex(
      (i) => i.productId === item.productId,
    );

    if (existingIndex > -1) {
      const existingItem = currentCart.items[existingIndex];
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + item.quantity,
        variantId: item.variantId || existingItem.variantId,
      };
      currentCart.items[existingIndex] = updatedItem;
    } else {
      currentCart.items = [...currentCart.items, item];
    }

    currentCart.total = this.calculateTotal(currentCart.items);
    this.saveCart(currentCart);
  }

  removeFromCart(productId: number): void {
    const currentCart = structuredClone(this.cartSubject.value);
    currentCart.items = currentCart.items.filter(
      (item) => item.productId !== productId,
    );
    currentCart.total = this.calculateTotal(currentCart.items);
    this.saveCart(currentCart);
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) {
      this.removeFromCart(productId);
      return;
    }

    const currentCart = structuredClone(this.cartSubject.value);
    const index = currentCart.items.findIndex((i) => i.productId === productId);

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
