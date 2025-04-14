import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem, CART_STORAGE_KEY } from '../../model/Cart';
import { getFullImageUrl } from '../../lib/utils';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal.component';
import { CartNoProductsComponent } from '../../components/cart-no-products/cart-no-products.component';
import { CartSidebarComponent } from '../../components/cart-sidebar/cart-sidebar.component';
import { Subscription } from 'rxjs';

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
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  showAuthModal: boolean = false;
  private cartSubscription?: Subscription;

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
  }

  // Update item quantity
  updateQuantity(productId: number, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(productId);
      return;
    }
    this.cartService.updateQuantity(productId, newQuantity);
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
    // Subscribe to cart changes
    this.cartSubscription = this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
    });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
}
