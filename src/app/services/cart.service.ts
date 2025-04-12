import { Injectable, signal } from '@angular/core';
import { Cart, CartItem, CART_STORAGE_KEY } from '../model/Cart';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  cart$ = this.cartSubject.asObservable();

  constructor() {
    // Load cart from localStorage on service initialization
    this.loadCart();
  }

  private getInitialCart(): Cart {
    return {
      items: [],
      total: 0,
    };
  }

  private loadCart(): void {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
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
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  addToCart(item: CartItem): void {
    const currentCart = this.cartSubject.value;
    const existingItem = currentCart.items.find(
      (i) => i.productId === item.productId,
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      currentCart.items.push(item);
    }

    currentCart.total = this.calculateTotal(currentCart.items);
    this.saveCart(currentCart);
  }

  removeFromCart(productId: string): void {
    const currentCart = this.cartSubject.value;
    currentCart.items = currentCart.items.filter(
      (item) => item.productId !== productId,
    );
    currentCart.total = this.calculateTotal(currentCart.items);
    this.saveCart(currentCart);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) {
      this.removeFromCart(productId);
      return;
    }

    const currentCart = this.cartSubject.value;
    const item = currentCart.items.find((i) => i.productId === productId);

    if (item) {
      item.quantity = quantity;
      currentCart.total = this.calculateTotal(currentCart.items);
      this.saveCart(currentCart);
    }
  }

  clearCart(): void {
    const emptyCart = this.getInitialCart();
    this.saveCart(emptyCart);
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getCart(): Cart {
    return this.cartSubject.value;
  }

  // Method to handle user login - merge guest cart with user cart
  handleUserLogin(userId: string): void {
    const currentCart = this.cartSubject.value;
    currentCart.userId = userId;
    this.saveCart(currentCart);
    // Here you would typically also sync with the backend
  }

  // Method to handle user logout - clear userId but keep items
  handleUserLogout(): void {
    const currentCart = this.cartSubject.value;
    delete currentCart.userId;
    this.saveCart(currentCart);
  }
}
