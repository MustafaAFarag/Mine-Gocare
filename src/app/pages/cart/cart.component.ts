import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem, CART_STORAGE_KEY } from '../../model/Cart';
import { getFullImageUrl } from '../../lib/utils';
import { BreadcrumbComponent } from '../../features/product-details/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

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

  ngOnInit() {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const cart = JSON.parse(storedCart);
        this.cartItems = cart.items;
        console.log('Cart loaded from localStorage:', cart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    } else {
      console.log('No cart found in localStorage');
    }
  }
}
