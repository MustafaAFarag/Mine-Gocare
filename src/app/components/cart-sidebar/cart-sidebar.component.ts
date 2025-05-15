import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { getFullImageUrl } from '../../lib/utils';
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

type Language = 'en' | 'ar';
interface Currency {
  en: string;
  ar: string;
}

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.css'],
})
export class CartSidebarComponent {
  isOpen = false;
  currentLang: Language = 'en';
  itemCurrency: string = '';

  getFullImageUrl = getFullImageUrl;

  constructor(
    private cartService: CartService,
    private cartSidebarService: CartSidebarService,
    public languageService: LanguageService,
    private translateService: TranslateService,
  ) {
    this.currentLang = this.translateService.currentLang as Language;
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang = event.lang as Language;
    });
    // Subscribe to the cart sidebar state
    this.cartSidebarService.isOpen$.subscribe((isOpen) => {
      this.isOpen = isOpen;
    });
    this.logCartItems();
  }

  private logCartItems(): void {
    this.cartService.cartItems$.subscribe((items) => {
      this.itemCurrency = items[0].currency[this.currentLang];
      console.log('Cart Items in CartSidebar:', this.itemCurrency);
    });
  }

  get cartItems$() {
    return this.cartService.cartItems$;
  }

  get cartTotal$() {
    return this.cartService.cartTotal$;
  }

  closeCart(): void {
    this.cartSidebarService.closeCart();
  }

  openCart(): void {
    this.cartSidebarService.openCart();
  }

  toggleCart(): void {
    this.cartSidebarService.toggleCart();
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  getLocalizedText(textObj: any): string {
    if (!textObj) return '';
    const currentLang = this.languageService.getCurrentLanguage();
    return currentLang === 'ar' && textObj?.ar ? textObj.ar : textObj.en;
  }
}
