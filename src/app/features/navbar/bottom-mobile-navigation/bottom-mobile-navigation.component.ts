import { NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { WishlistService } from '../../../services/wishlist.service';
import { Subscription } from 'rxjs';
import { SearchComponent } from '../../../components/search/search.component';

@Component({
  selector: 'app-bottom-mobile-navigation',
  imports: [RouterModule, NgIf, SearchComponent],
  templateUrl: './bottom-mobile-navigation.component.html',
  styleUrl: './bottom-mobile-navigation.component.css',
})
export class BottomMobileNavigationComponent implements OnInit, OnDestroy {
  cartCount: number = 0;
  wishlistCount: number = 0;
  isSearchOpen: boolean = false;
  private cartSubscription?: Subscription;
  private wishlistSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
  ) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cartItems$.subscribe((items) => {
      this.cartCount = items.reduce((total, item) => total + item.quantity, 0);
    });

    this.wishlistSubscription = this.wishlistService.wishlistItems$.subscribe(
      (items) => {
        this.wishlistCount = items.length;
      },
    );
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.wishlistSubscription) {
      this.wishlistSubscription.unsubscribe();
    }
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  closeSearch(): void {
    this.isSearchOpen = false;
  }
}
