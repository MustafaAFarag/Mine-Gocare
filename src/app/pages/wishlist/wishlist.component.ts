import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  availability: 'In Stock' | 'Out of Stock' | 'Coming Soon';
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent {
  wishlistItems: WishlistItem[] = [
    {
      id: 1,
      name: 'Chic Mini Dress',
      price: 9.4,
      originalPrice: 10.0,
      image: '/assets/images/chic-mini-dress.jpg',
      availability: 'In Stock',
    },
    {
      id: 2,
      name: 'Stripped Bodycon Dress',
      price: 11.76,
      originalPrice: 12.0,
      image: '/assets/images/stripped-bodycon-dress.jpg',
      availability: 'In Stock',
    },
  ];

  removeFromWishlist(id: number): void {
    this.wishlistItems = this.wishlistItems.filter((item) => item.id !== id);
  }

  addToCart(id: number): void {
    console.log('Adding item to cart:', id);
    // This would typically call a service to add the item to the cart
  }
}
