import { Component, Input } from '@angular/core';
import { Product } from '../../model/Product';
import { getFullImageUrl } from '../../lib/utils';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { CartItem } from '../../model/Cart';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input() product!: Product;

  getFullImageUrl = getFullImageUrl;

  constructor(
    private router: Router,
    private cartService: CartService,
    private cartSidebarService: CartSidebarService,
  ) {}

  navigateToProductDetails(productId: number, variantId: number): void {
    this.router.navigate([`/product-details/${productId}/${variantId}`]);
  }

  addToCart(product: Product): void {
    const cartItem: CartItem = {
      productId: product.productId,
      name: product.name.en,
      image: product.mainImageUrl,
      afterPrice: product.priceAfterDiscount,
      beforePrice: product.priceBeforeDiscount,
      quantity: 1,
    };

    this.cartService.addToCart(cartItem);
    this.cartSidebarService.openCart(); // Open the cart sidebar after adding the item
  }
}
