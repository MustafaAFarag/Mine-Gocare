import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDetails } from '../../../model/ProductDetail';
import { CartService } from '../../../services/cart.service';
import { CartItem } from '../../../model/Cart';
import { CartSidebarService } from '../../../services/cart-sidebar.service';
import { LanguageService } from '../../../services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { WishlistService } from '../../../services/wishlist.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-info',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './product-info.component.html',
  styleUrl: './product-info.component.css',
})
export class ProductInfoComponent {
  private _productDetails!: ProductDetails;
  isInWishlist: boolean = false;
  selectedVariant: any;
  selectedColor: string = '';
  selectedSize: string = '';

  @Input()
  set productDetails(value: ProductDetails) {
    this._productDetails = value;
    if (value && value.productVariants?.length > 0) {
      // Set initial selected variant
      this.selectedVariant =
        value.productVariants.find((v) => v.isSelected) ||
        value.productVariants[0];
      this.unitPrice = this.selectedVariant?.priceAfterDiscount ?? 0;
      this.totalPrice = this.unitPrice;
      this.counter = 1; // Reset counter when variant changes
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
    if (this.counter < this.selectedVariant?.stockCount) {
      this.counter++;
      this.totalPrice = this.counter * this.unitPrice;
    }
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
        this.selectedVariant.id,
      );
    }
  }

  toggleWishlist(): void {
    if (this.productDetails) {
      if (this.isInWishlist) {
        this.wishlistService.removeFromWishlist(
          this.productDetails.id,
          this.selectedVariant.id,
        );
      } else {
        this.wishlistService.addToWishlist({
          productId: this.productDetails.id,
          variantId: this.selectedVariant.id,
          mainImageUrl:
            this.selectedVariant.mainImageUrl ||
            this.productDetails.mainImageUrl,
          name: this.productDetails.productName,
          brand: this.productDetails.brandName,
          priceBeforeDiscount: this.selectedVariant.priceBeforeDiscount,
          priceAfterDiscount: this.selectedVariant.priceAfterDiscount,
          discountAmount: this.selectedVariant.discountAmount,
          discountPercentage: this.selectedVariant.discountPercentage,
          currency: this.selectedVariant.currency,
          stockCount: this.selectedVariant.stockCount,
          variantProductNumber: 0,
          lowQuantity: this.selectedVariant.hasLowQuantity,
          variantQuantityInCart: 0,
          variantInCartId: 0,
          isInWishlist: true,
          promoCodeDetail: null,
          productVariants: [],
          rating: this.selectedVariant.rating,
        });
      }
      this.checkWishlistStatus();
    }
  }

  onVariantSelect(variant: any): void {
    this.selectedVariant = variant;
    this.unitPrice = variant.priceAfterDiscount;
    this.totalPrice = this.counter * this.unitPrice;
    this.counter = 1; // Reset counter when variant changes
    this.checkWishlistStatus();
  }

  addToCart(product: ProductDetails): void {
    const item: CartItem = {
      productId: product.id,
      variantId: this.selectedVariant.id,
      name: product.productName,
      afterPrice: this.selectedVariant.priceAfterDiscount,
      beforePrice: this.selectedVariant.priceBeforeDiscount,
      quantity: this.counter,
      image: this.selectedVariant.mainImageUrl || product.mainImageUrl,
      currency: this.selectedVariant.currency.name,
    };

    this.cartService.addToCart(item);
    this.cartSidebarService.openCart();
  }
}
