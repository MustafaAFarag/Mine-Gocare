import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { WishlistService } from '../../services/wishlist.service';
import { Product } from '../../model/Product';
import { Subscription } from 'rxjs';
import { getFullImageUrl } from '../../lib/utils';
import { CartService } from '../../services/cart.service';
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { CartItem } from '../../model/Cart';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    RouterModule,
    ToastModule,
    TranslateModule,
    LoadingComponent,
  ],
  providers: [MessageService],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlistItems: Product[] = [];
  isLoading: boolean = true;
  private wishlistSubscription?: Subscription;
  private langSubscription?: Subscription;
  currentLang: string = 'en';
  getFullImageUrl = getFullImageUrl;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private cartSidebarService: CartSidebarService,
    private messageService: MessageService,
    private router: Router,
    private languageService: LanguageService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.wishlistSubscription = this.wishlistService.wishlistItems$.subscribe(
      (items) => {
        this.wishlistItems = items;
        this.isLoading = false;
      },
    );

    // Get current language
    this.currentLang = this.languageService.getCurrentLanguage();

    // Subscribe to language changes
    this.langSubscription = this.languageService.language$.subscribe((lang) => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy(): void {
    if (this.wishlistSubscription) {
      this.wishlistSubscription.unsubscribe();
    }
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  getLocalizedText(textObj: any): string {
    if (!textObj) return '';
    return this.currentLang === 'ar' && textObj?.ar ? textObj.ar : textObj.en;
  }

  removeFromWishlist(productId: number, variantId: number): void {
    this.wishlistService.removeFromWishlist(productId, variantId);
    this.messageService.add({
      severity: 'info',
      summary: this.translateService.instant(
        'wishlist.toast.removedFromWishlist.summary',
      ),
      detail: this.translateService.instant(
        'wishlist.toast.removedFromWishlist.detail',
      ),
      life: 2000,
      styleClass: 'black-text-toast',
    });
  }

  addToCart(product: Product): void {
    const cartItem: CartItem = {
      productId: product.productId,
      variantId: product.variantId,
      name: product.name,
      image: product.mainImageUrl,
      afterPrice: product.priceAfterDiscount,
      beforePrice: product.priceBeforeDiscount,
      quantity: 1,
      promoCodeDetail: product.promoCodeDetail ?? null,
      currency: product.currency.name,
      stockCount: product.stockCount,
    };

    this.cartService.addToCart(cartItem);
    this.cartSidebarService.openCart();

    // this.messageService.add({
    //   severity: 'success',
    //   summary: this.translateService.instant(
    //     'wishlist.toast.addedToCart.summary',
    //   ),
    //   detail: this.translateService.instant(
    //     'wishlist.toast.addedToCart.detail',
    //   ),
    //   life: 2000,
    //   styleClass: 'black-text-toast',
    // });
  }

  continueShopping(): void {
    this.router.navigate(['/collections']);
  }

  clearWishlist(): void {
    if (this.wishlistItems.length > 0) {
      // Remove all items from wishlist
      this.wishlistItems.forEach((item) => {
        this.wishlistService.removeFromWishlist(item.productId, item.variantId);
      });

      this.messageService.add({
        severity: 'info',
        summary: this.translateService.instant(
          'wishlist.toast.wishlistCleared.summary',
        ),
        detail: this.translateService.instant(
          'wishlist.toast.wishlistCleared.detail',
        ),
        life: 2000,
        styleClass: 'black-text-toast',
      });
    }
  }
}
