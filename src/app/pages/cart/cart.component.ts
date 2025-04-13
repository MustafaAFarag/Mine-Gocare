import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem, CART_STORAGE_KEY } from '../../model/Cart';
import { getFullImageUrl } from '../../lib/utils';
import { BreadcrumbComponent } from '../../features/product-details/breadcrumb/breadcrumb.component';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal.component';
import { CartNoProductsComponent } from '../../components/cart-no-products/cart-no-products.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    AuthModalComponent,
    CartNoProductsComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  showAuthModal: boolean = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService,
  ) {}

  // Add the utility function to the component
  getFullImageUrl = getFullImageUrl;

  // Calculate savings for an item
  getSavings(item: CartItem): number {
    return item.beforePrice - item.afterPrice;
  }

  // Calculate total for an item
  getItemTotal(item: CartItem): number {
    return item.afterPrice * item.quantity;
  }

  // Calculate cart total
  getCartTotal(): number {
    return this.cartItems.reduce(
      (total, item) => total + this.getItemTotal(item),
      0,
    );
  }

  // Remove item from cart
  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
    this.cartItems = this.cartItems.filter(
      (item) => item.productId !== productId,
    );
  }

  // Update item quantity
  updateQuantity(productId: number, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(productId);
      return;
    }
    this.cartService.updateQuantity(productId, newQuantity);
    const item = this.cartItems.find((item) => item.productId === productId);
    if (item) {
      item.quantity = newQuantity;
    }
  }

  // Navigate to product details
  continueShopping(): void {
    this.router.navigate(['/product-details/1/2']);
  }

  // Handle checkout
  handleCheckout(): void {
    if (this.authService.isAuthenticated) {
      // TODO: Implement checkout logic for authenticated users
      console.log('Proceeding to checkout...');
    } else {
      // Show auth modal instead of redirecting
      this.showAuthModal = true;
    }
  }

  ngOnInit() {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const cart = JSON.parse(storedCart);
        this.cartItems = cart.items;
        console.log('Cart loaded from localStorage:', cart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    } else {
      console.log('No cart found in localStorage');
    }
  }
}
