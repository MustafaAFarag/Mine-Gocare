import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  HostListener,
} from '@angular/core';
import { Product } from '../../model/Product';
import { getFullImageUrl } from '../../lib/utils';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { CartItem } from '../../model/Cart';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WishlistService } from '../../services/wishlist.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { QuickProductViewModalComponent } from '../quick-product-view-modal/quick-product-view-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-card',
  imports: [
    CommonModule,
    TranslateModule,
    ToastModule,
    QuickProductViewModalComponent,
    FormsModule,
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input() product!: Product;
  private langSubscription?: Subscription;
  private translateSubscription?: Subscription;
  private wishlistSubscription?: Subscription;
  currentLang: string = 'en';
  isInWishlist: boolean = false;
  isQuickViewOpen = false;
  selectedVariant: any = null;

  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);
  private wishlistService = inject(WishlistService);
  private messageService = inject(MessageService);

  getFullImageUrl = getFullImageUrl;

  constructor(
    private router: Router,
    private cartService: CartService,
    private cartSidebarService: CartSidebarService,
  ) {}

  ngOnInit(): void {
    this.currentLang = this.languageService.getCurrentLanguage();
    this.isInWishlist = this.wishlistService.isInWishlist(
      this.product.productId,
      this.product.variantId,
    );

    // Set initial selected variant
    this.selectedVariant = this.product.productVariants?.find(
      (v) => v.isSelected,
    );

    // Subscribe to wishlist changes
    this.wishlistSubscription = this.wishlistService.wishlistItems$.subscribe(
      () => {
        this.isInWishlist = this.wishlistService.isInWishlist(
          this.product.productId,
          this.product.variantId,
        );
        this.cdr.markForCheck();
      },
    );

    // Subscribe to direction changes
    this.langSubscription = this.languageService.direction$.subscribe(() => {
      this.currentLang = this.languageService.getCurrentLanguage();
      this.cdr.markForCheck();
    });

    // Subscribe to language changes directly from translate service
    this.translateSubscription = this.translateService.onLangChange.subscribe(
      (event) => {
        this.currentLang = event.lang;
        this.cdr.markForCheck();
      },
    );
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.translateSubscription) {
      this.translateSubscription.unsubscribe();
    }
    if (this.wishlistSubscription) {
      this.wishlistSubscription.unsubscribe();
    }
  }

  getLocalizedText(textObj: any): string {
    if (!textObj) return '';
    return this.currentLang === 'ar' && textObj?.ar ? textObj.ar : textObj.en;
  }

  navigateToProductDetails(productId: number, variantId: number): void {
    this.router.navigate([`/product-details/${productId}/${variantId}`]);
  }

  openQuickView(): void {
    this.isQuickViewOpen = true;
  }

  closeQuickView(): void {
    this.isQuickViewOpen = false;
  }

  addToCart(product: Product): void {
    // Use selectedVariant if available, otherwise fallback to product
    const variant = this.selectedVariant || product;
    const getCartItemName = () => {
      // If variantName exists and is not empty, use it; otherwise fallback to product name
      if (
        variant.variantName &&
        (variant.variantName.en || variant.variantName.ar)
      ) {
        if (
          (typeof variant.variantName.en === 'string' &&
            variant.variantName.en.trim() !== '') ||
          (typeof variant.variantName.ar === 'string' &&
            variant.variantName.ar.trim() !== '')
        ) {
          return variant.variantName;
        }
      }
      return variant.name || product.name;
    };

    // Check current quantity in cart for this variant
    const currentCartItems = this.cartService.getCart().items;
    const existingCartItem = currentCartItems.find(
      (item) =>
        item.productId === product.productId &&
        item.variantId === (variant.variantId || variant.id),
    );
    const currentQuantity = existingCartItem ? existingCartItem.quantity : 0;
    const availableStock = variant.stockCount || product.stockCount;
    if (currentQuantity + 1 > availableStock) {
      this.messageService.add({
        severity: 'error',
        summary: this.translateService.instant(
          'product-card.stockExceeded.summary',
        ),
        detail: this.translateService.instant(
          'product-card.stockExceeded.detail',
          { stock: availableStock },
        ),
        life: 2500,
        styleClass: 'black-text-toast',
      });
      return;
    }

    const cartItem: CartItem = {
      productId: product.productId,
      variantId: variant.variantId || variant.id,
      name: getCartItemName(),
      image: variant.mainImageUrl || product.mainImageUrl,
      afterPrice: variant.priceAfterDiscount || product.priceAfterDiscount,
      beforePrice: variant.priceBeforeDiscount || product.priceBeforeDiscount,
      quantity: 1,
      promoCodeDetail:
        variant.promoCodeDetail ?? product.promoCodeDetail ?? null,
      currency:
        (variant.currency && variant.currency.name) ||
        (product.currency && product.currency.name),
      stockCount: variant.stockCount || product.stockCount,
    };
    this.cartService.addToCart(cartItem);
    this.cartSidebarService.openCart(); // Open the cart sidebar after adding the item
  }

  toggleWishlist(event: Event): void {
    event.stopPropagation();

    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(
        this.product.productId,
        this.product.variantId,
      );
      this.messageService.add({
        severity: 'info',
        summary: this.translateService.instant(
          'wishlist.toast.removedFromWishlist.summary',
        ),
        detail: this.translateService.instant(
          'wishlist.toast.removedFromWishlist.detail',
          {
            name: this.getLocalizedText(this.product.name),
          },
        ),
        life: 2000,
        styleClass: 'black-text-toast',
      });
    } else {
      const added = this.wishlistService.addToWishlist(this.product);
      if (added) {
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant(
            'wishlist.toast.addedToWishlist.summary',
          ),
          detail: this.translateService.instant(
            'wishlist.toast.addedToWishlist.detail',
            {
              name: this.getLocalizedText(this.product.name),
            },
          ),
          life: 2000,
          styleClass: 'black-text-toast',
        });
      }
    }
    this.cdr.markForCheck();
  }

  selectVariant(variant: any): void {
    if (variant) {
      this.selectedVariant = variant;
      this.cdr.markForCheck();
      // Navigate to product details with the selected variant
      console.log('SELECTED VARIANT', variant);
      console.log('PRODUCT', this.product);
      this.navigateToProductDetails(this.product.productId, variant.id);
    }
  }
}
