import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../model/Product';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly WISHLIST_KEY = 'wishlist';
  private wishlistItemsSubject = new BehaviorSubject<Product[]>([]);
  wishlistItems$ = this.wishlistItemsSubject.asObservable();

  constructor() {
    this.loadWishlistFromStorage();
  }

  private loadWishlistFromStorage(): void {
    const storedWishlist = localStorage.getItem(this.WISHLIST_KEY);
    if (storedWishlist) {
      try {
        const wishlistItems = JSON.parse(storedWishlist);
        this.wishlistItemsSubject.next(wishlistItems);
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
        this.wishlistItemsSubject.next([]);
      }
    }
  }

  private saveWishlistToStorage(wishlistItems: Product[]): void {
    localStorage.setItem(this.WISHLIST_KEY, JSON.stringify(wishlistItems));
  }

  addToWishlist(product: Product): boolean {
    const currentWishlist = this.wishlistItemsSubject.value;

    // Check if product already exists in wishlist
    const productExists = currentWishlist.some(
      (item) =>
        item.productId === product.productId &&
        item.variantId === product.variantId,
    );

    if (productExists) {
      return false; // Product already in wishlist
    }

    // Add product to wishlist
    const updatedWishlist = [...currentWishlist, product];
    this.wishlistItemsSubject.next(updatedWishlist);
    this.saveWishlistToStorage(updatedWishlist);

    return true; // Product added successfully
  }

  removeFromWishlist(productId: number, variantId: number): void {
    const currentWishlist = this.wishlistItemsSubject.value;
    const updatedWishlist = currentWishlist.filter(
      (item) => !(item.productId === productId && item.variantId === variantId),
    );

    this.wishlistItemsSubject.next(updatedWishlist);
    this.saveWishlistToStorage(updatedWishlist);
  }

  isInWishlist(productId: number, variantId: number): boolean {
    const currentWishlist = this.wishlistItemsSubject.value;
    return currentWishlist.some(
      (item) => item.productId === productId && item.variantId === variantId,
    );
  }

  getWishlistItems(): Product[] {
    return this.wishlistItemsSubject.value;
  }
}
