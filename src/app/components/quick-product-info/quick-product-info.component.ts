import { Component, Input } from '@angular/core';
import { ProductDetails } from '../../model/ProductDetail';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CartService } from '../../services/cart.service';
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { WishlistService } from '../../services/wishlist.service';
import { Product } from '../../model/Product';
import { CartItem } from '../../model/Cart';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LanguageService } from '../../services/language.service';

type Language = 'ar' | 'en';

@Component({
  selector: 'app-quick-product-info',
  imports: [CommonModule, TranslateModule, ToastModule],
  templateUrl: './quick-product-info.component.html',
  styleUrl: './quick-product-info.component.css',
  providers: [MessageService],
})
export class QuickProductInfoComponent {
  @Input() productDetails!: ProductDetails;
  quantity: number = 1;
  currentLang: Language = 'en';

  constructor(
    private cartService: CartService,
    private cartSidebarService: CartSidebarService,
    private wishlistService: WishlistService,
    private translateService: TranslateService,
    private messageService: MessageService,
    public languageService: LanguageService,
  ) {
    this.currentLang = this.translateService.currentLang as Language;
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang = event.lang as Language;
    });
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity(): void {
    // You might want to add a max quantity check here
    this.quantity++;
  }

  get totalPrice(): number {
    return (
      this.productDetails.productVariants[0].priceAfterDiscount * this.quantity
    );
  }

  addToCart(): void {
    const cartItem: CartItem = {
      productId: this.productDetails.id,
      variantId: this.productDetails.productVariants[0].id,
      name: this.productDetails.productName,
      image: this.productDetails.mainImageUrl,
      afterPrice: this.productDetails.productVariants[0].priceAfterDiscount,
      beforePrice: this.productDetails.productVariants[0].priceBeforeDiscount,
      quantity: this.quantity,
      currency: this.productDetails.productVariants[0].currency.name,
      promoCodeDetail:
        this.productDetails.productVariants[0].promoCodeDetail ?? null,
    };

    this.cartService.addToCart(cartItem);
    this.cartSidebarService.openCart();
  }

  toggleWishlist(): void {
    const product: Product = {
      productId: this.productDetails.id,
      variantId: this.productDetails.productVariants[0].id,
      mainImageUrl: this.productDetails.mainImageUrl,
      name: this.productDetails.productName,
      brand: this.productDetails.brandName,
      priceBeforeDiscount:
        this.productDetails.productVariants[0].priceBeforeDiscount,
      priceAfterDiscount:
        this.productDetails.productVariants[0].priceAfterDiscount,
      discountAmount: this.productDetails.productVariants[0].discountAmount,
      discountPercentage:
        this.productDetails.productVariants[0].discountPercentage,
      currency: this.productDetails.productVariants[0].currency,
      stockCount: this.productDetails.productVariants[0].stockCount,
      variantProductNumber: 0,
      lowQuantity: this.productDetails.productVariants[0].hasLowQuantity,
      variantQuantityInCart:
        this.productDetails.productVariants[0].variantQuantityInCart,
      variantInCartId: this.productDetails.productVariants[0].variantInCartId,
      isInWishlist: this.productDetails.productVariants[0].isInWishlist,
      promoCodeDetail: this.productDetails.productVariants[0].promoCodeDetail,
      productVariants: this.productDetails.productVariants,
      rating: this.productDetails.productVariants[0].rating,
    };

    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(
        product.productId,
        product.variantId,
      );
      this.messageService.add({
        severity: 'info',
        summary: this.translateService.instant(
          'wishlist.toast.removedFromWishlist.summary',
        ),
        detail: this.translateService.instant(
          'wishlist.toast.removedFromWishlist.detail',
          {
            name: this.productDetails.productName.en,
          },
        ),
        life: 2000,
        styleClass: 'black-text-toast',
      });
    } else {
      this.wishlistService.addToWishlist(product);
      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant(
          'wishlist.toast.addedToWishlist.summary',
        ),
        detail: this.translateService.instant(
          'wishlist.toast.addedToWishlist.detail',
          {
            name: this.productDetails.productName.en,
          },
        ),
        life: 2000,
        styleClass: 'black-text-toast',
      });
    }
  }

  get isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(
      this.productDetails.id,
      this.productDetails.productVariants[0].id,
    );
  }
}
