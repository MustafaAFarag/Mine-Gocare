import { NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bottom-mobile-navigation',
  imports: [RouterModule, NgIf],
  templateUrl: './bottom-mobile-navigation.component.html',
  styleUrl: './bottom-mobile-navigation.component.css',
})
export class BottomMobileNavigationComponent implements OnInit, OnDestroy {
  cartCount: number = 0;
  private cartSubscription?: Subscription;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cartItems$.subscribe((items) => {
      this.cartCount = items.reduce((total, item) => total + item.quantity, 0);
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
}
