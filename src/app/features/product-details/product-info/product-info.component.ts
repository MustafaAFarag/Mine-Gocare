import { Component, Input } from '@angular/core';
import { Product } from '../../../model/Product';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-info',
  imports: [CommonModule],
  templateUrl: './product-info.component.html',
  styleUrl: './product-info.component.css',
})
export class ProductInfoComponent {
  @Input() productDetails!: Product;

  counter: number = 1;
  totalPrice: number = 296.0;

  increaseCounter() {
    this.counter++;
    this.totalPrice = this.counter * 296;
  }

  decreaseCounter() {
    if (this.counter > 1) {
      this.counter--;
      this.totalPrice = this.counter * 296.0;
    }
  }
}
