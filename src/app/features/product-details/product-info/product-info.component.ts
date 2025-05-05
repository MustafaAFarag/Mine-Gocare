import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDetails } from '../../../model/ProductDetail';
import { CartService } from '../../../services/cart.service';
import { CartItem } from '../../../model/Cart';
import { CartSidebarService } from '../../../services/cart-sidebar.service';
import { LanguageService } from '../../../services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { WishlistService } from '../../../services/wishlist.service';

@Component({
  selector: 'app-product-info',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './product-info.component.html',
  styleUrl: './product-info.component.css',
})
export class ProductInfoComponent {
  private _productDetails!: ProductDetails;
  isInWishlist: boolean = false;

  @Input()
  set productDetails(value: ProductDetails) {
    this._productDetails = value;
    if (value && value.productVariants?.length > 0) {
      this.unitPrice = value.productVariants[0]?.priceAfterDiscount ?? 0;
      this.totalPrice = this.unitPrice;
      this.checkWishlistStatus();
    }
  }
  get productDetails() {
    return this._productDetails;
  }

  counter: number = 1;
  unitPrice: number = 0;
  totalPrice: number = 0;

  increaseCounter() {
    this.counter++;
    this.totalPrice = this.counter * this.unitPrice;
  }

  decreaseCounter() {
    if (this.counter > 1) {
      this.counter--;
      this.totalPrice = this.counter * this.unitPrice;
    }
  }

  constructor(
    private cartService: CartService,
    private cartSidebarService: CartSidebarService,
    public languageService: LanguageService,
    private wishlistService: WishlistService,
  ) {}

  private checkWishlistStatus(): void {
    if (this.productDetails) {
      this.isInWishlist = this.wishlistService.isInWishlist(
        this.productDetails.id,
        this.productDetails.productVariants[0].id,
      );
    }
  }

  toggleWishlist(): void {
    if (this.productDetails) {
      if (this.isInWishlist) {
        this.wishlistService.removeFromWishlist(
          this.productDetails.id,
          this.productDetails.productVariants[0].id,
        );
      } else {
        this.wishlistService.addToWishlist({
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
          variantQuantityInCart: 0,
          variantInCartId: 0,
          isInWishlist: true,
          promoCodeDetail: null,
          productVariants: [],
          rating: this.productDetails.productVariants[0].rating,
        });
      }
      this.checkWishlistStatus();
    }
  }

  addToCart(product: ProductDetails): void {
    // Create the CartItem object
    const item: CartItem = {
      productId: product.id,
      variantId: product.productVariants[0].id,
      name: product.productName,
      afterPrice: product.productVariants[0].priceAfterDiscount,
      beforePrice: product.productVariants[0].priceBeforeDiscount,
      quantity: this.counter,
      image: product.mainImageUrl,
      currency: product.productVariants[0].currency,
    };

    // Add the item to the cart using the CartService
    this.cartService.addToCart(item);

    // Open the cart sidebar
    this.cartSidebarService.openCart();
  }
}
