import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem, CART_STORAGE_KEY } from '../../model/Cart';
import { getFullImageUrl } from '../../lib/utils';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalService } from '../../auth-modal.service';
import { CartNoProductsComponent } from '../../components/cart-no-products/cart-no-products.component';
import { CartSidebarComponent } from '../../components/cart-sidebar/cart-sidebar.component';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    CartNoProductsComponent,
    TranslateModule,
    ConfirmationDialogComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  private cartSubscription?: Subscription;
  currentLang: string = 'en';

  // Confirmation dialog properties
  showRemoveOutOfStockDialog = false;
  showOutOfStockWarningDialog = false;
  showStockValidationErrorDialog = false;
  stockValidationError: any;

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService,
    private authModalService: AuthModalService,
    private languageService: LanguageService,
    private translate: TranslateService,
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
    this.router.navigate(['/collections']);
  }

  getLocalizedText(textObj: any): string {
    if (!textObj) return '';
    const currentLang = this.languageService.getCurrentLanguage();
    return currentLang === 'ar' && textObj?.ar ? textObj.ar : textObj.en;
  }

  getLocalizedCurrency(): string {
    const country = localStorage.getItem('country') || 'EG';
    const language = this.languageService.getCurrentLanguage();

    if (country === 'EG') {
      return language === 'ar' ? 'ج.م' : 'EGP';
    } else if (country === 'SA') {
      return language === 'ar' ? 'ر.س' : 'SAR';
    }

    return 'EGP'; // Default fallback
  }

  // Check if there are out-of-stock items
  hasOutOfStockItems(): boolean {
    return this.cartService.hasOutOfStockItems();
  }

  // Get out-of-stock items
  getOutOfStockItems(): CartItem[] {
    return this.cartService.getOutOfStockItems();
  }

  // Check if a specific item is out of stock
  isItemOutOfStock(item: CartItem): boolean {
    return item.stockCount === 0;
  }

  // Handle checkout with stock validation
  handleCheckout(): void {
    // Validate stock levels before proceeding to checkout
    this.cartService.validateStockBeforeCheckout().subscribe({
      next: (validation) => {
        if (!validation.isValid) {
          console.error('Stock validation failed:', validation.invalidItems);
          this.showStockValidationErrorDialog = true;
          this.stockValidationError = validation;
          return;
        }

        // Stock is valid, proceed with checkout
        if (this.authService.isAuthenticated) {
          // TODO: Implement checkout logic for authenticated users
          this.router.navigate(['/checkout']);
        } else {
          // Show auth modal using the service
          this.authModalService.showModal();
        }
      },
      error: (error) => {
        console.error('Error validating stock:', error);
        this.showOutOfStockWarningDialog = true;
      },
    });
  }

  // Remove out-of-stock items from cart
  removeOutOfStockItems(): void {
    if (this.hasOutOfStockItems()) {
      this.showRemoveOutOfStockDialog = true;
    }
  }

  // Dialog event handlers
  onRemoveOutOfStockConfirmed(): void {
    this.cartService.removeOutOfStockItems();
  }

  onRemoveOutOfStockCancelled(): void {
    // User cancelled, do nothing
  }

  onOutOfStockWarningConfirmed(): void {
    // User acknowledged the warning, do nothing
  }

  onOutOfStockWarningCancelled(): void {
    // User cancelled, do nothing
  }

  onStockValidationErrorConfirmed(): void {
    // User acknowledged the error, do nothing
  }

  getStockValidationErrorMessage(): string {
    if (!this.stockValidationError) {
      return this.translate.instant('cart.stockValidationError');
    }

    const invalidItems = this.stockValidationError.invalidItems || [];
    if (invalidItems.length === 0) {
      return this.translate.instant('cart.stockValidationError');
    }

    const messages = invalidItems.map((item: any) => {
      const cartItem = this.cartItems.find(
        (ci) =>
          ci.productId === item.productId && ci.variantId === item.variantId,
      );
      const productName = cartItem?.name
        ? this.currentLang === 'en'
          ? cartItem.name.en
          : cartItem.name.ar
        : 'Unknown Product';

      if (item.currentStock === 0) {
        return `${productName}: ${this.translate.instant('cart.outOfStock')}`;
      } else {
        return `${productName}: ${this.translate.instant(
          'cart.insufficientStock',
          {
            requested: item.requestedQuantity,
            available: item.currentStock,
          },
        )}`;
      }
    });

    return (
      this.translate.instant('cart.stockValidationErrorDetails') +
      '\n\n' +
      messages.join('\n')
    );
  }

  ngOnInit() {
    // Subscribe to cart changes
    this.cartSubscription = this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
    });

    // Set current language
    this.currentLang = this.languageService.getCurrentLanguage();
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
}
