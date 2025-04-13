import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { getFullImageUrl } from '../../lib/utils';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.css'],
})
export class CartSidebarComponent {
  isOpen = true;

  // Free shipping threshold
  freeShippingThreshold = 1000;

  getFullImageUrl = getFullImageUrl;

  constructor(private cartService: CartService) {}

  get cartItems$() {
    return this.cartService.cartItems$;
  }

  get cartTotal$() {
    return this.cartService.cartTotal$;
  }

  closeCart(): void {
    this.isOpen = false;
  }

  openCart(): void {
    this.isOpen = true;
  }

  toggleCart(): void {
    this.isOpen = !this.isOpen;
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
