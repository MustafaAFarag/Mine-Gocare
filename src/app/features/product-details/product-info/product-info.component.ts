import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDetails } from '../../../model/ProductDetail';
import { CartService } from '../../../services/cart.service';
import { CartItem } from '../../../model/Cart';

@Component({
  selector: 'app-product-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-info.component.html',
  styleUrl: './product-info.component.css',
})
export class ProductInfoComponent {
  private _productDetails!: ProductDetails;

  @Input()
  set productDetails(value: ProductDetails) {
    this._productDetails = value;
    if (value && value.productVariants?.length > 0) {
      this.unitPrice = value.productVariants[0]?.priceAfterDiscount ?? 0;
      this.totalPrice = this.unitPrice;
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

  constructor(private cartService: CartService) {}

  addToCart(product: ProductDetails): void {
    // Log the incoming product details for debugging
    console.log('Product Details:', product);

    // Create the CartItem object
    const item: CartItem = {
      productId: product.id, // Product ID
      name: product.productName.en, // Product name (assuming the product name is in an object with `en` as key)
      afterPrice: product.productVariants[0].priceAfterDiscount, // Price after discount
      beforePrice: product.productVariants[0].priceBeforeDiscount,
      quantity: 1, // Default quantity of 1 (you can adjust this as needed)
      image: product.mainImageUrl, // Image URL
    };

    // Log the created CartItem for debugging
    console.log('Item to be added to Cart:', item);

    // Add the item to the cart using the CartService
    this.cartService.addToCart(item);
  }
}
