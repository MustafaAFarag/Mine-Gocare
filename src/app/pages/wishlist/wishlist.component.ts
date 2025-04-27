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

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlistItems: Product[] = [];
  private wishlistSubscription?: Subscription;
  getFullImageUrl = getFullImageUrl;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private cartSidebarService: CartSidebarService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.wishlistSubscription = this.wishlistService.wishlistItems$.subscribe(
      (items) => {
        this.wishlistItems = items;
      },
    );
  }

  ngOnDestroy(): void {
    if (this.wishlistSubscription) {
      this.wishlistSubscription.unsubscribe();
    }
  }

  removeFromWishlist(productId: number, variantId: number): void {
    this.wishlistService.removeFromWishlist(productId, variantId);
    this.messageService.add({
      severity: 'info',
      summary: 'Removed from Wishlist',
      detail: 'Product has been removed from your wishlist',
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
      currency: product.currency.name,
    };

    this.cartService.addToCart(cartItem);
    this.cartSidebarService.openCart();

    this.messageService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: 'Product has been added to your cart',
      life: 2000,
      styleClass: 'black-text-toast',
    });
  }
}
