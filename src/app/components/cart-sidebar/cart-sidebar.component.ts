import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { getFullImageUrl } from '../../lib/utils';
import { CartSidebarService } from '../../services/cart-sidebar.service';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.css'],
})
export class CartSidebarComponent {
  isOpen = false;

  // Free shipping threshold
  freeShippingThreshold = 1000;

  getFullImageUrl = getFullImageUrl;

  constructor(
    private cartService: CartService,
    private router: Router,
    private cartSidebarService: CartSidebarService,
  ) {
    // Subscribe to the cart sidebar state
    this.cartSidebarService.isOpen$.subscribe((isOpen) => {
      this.isOpen = isOpen;
    });
  }

  get cartItems$() {
    return this.cartService.cartItems$;
  }

  get cartTotal$() {
    return this.cartService.cartTotal$;
  }

  closeCart(): void {
    this.cartSidebarService.closeCart();
  }

  openCart(): void {
    this.cartSidebarService.openCart();
  }

  toggleCart(): void {
    this.cartSidebarService.toggleCart();
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  getRemainingForFreeShipping(total: number): number {
    return Math.max(0, this.freeShippingThreshold - total);
  }

  getProgressPercentage(total: number): number {
    return Math.min(100, (total / this.freeShippingThreshold) * 100);
  }
}
