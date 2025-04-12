import { Component, Input } from '@angular/core';
import { Product } from '../../../model/Product';
import { CommonModule } from '@angular/common';
import { ProductDetails } from '../../../model/ProductDetail';

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
}
