import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { getFullImageUrl } from '../../lib/utils';
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type Language = 'en' | 'ar';
type Country = 'EG' | 'SA';

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
export class CartSidebarComponent implements OnInit, OnDestroy {
  isOpen = false;
  currentLang: Language = 'en';
  currentCountry: Country = 'EG';
  private destroy$ = new Subject<void>();
  private isBrowser: boolean;

  getFullImageUrl = getFullImageUrl;

  constructor(
    private cartService: CartService,
    private cartSidebarService: CartSidebarService,
    public languageService: LanguageService,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.currentLang = this.translateService.currentLang as Language;
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.currentLang = event.lang as Language;
        if (this.isBrowser) {
          localStorage.setItem('language', event.lang);
        }
      });

    this.cartSidebarService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        this.isOpen = isOpen;
      });
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Initialize from localStorage
      this.currentCountry =
        (localStorage.getItem('country') as Country) || 'EG';
      this.currentLang = (localStorage.getItem('language') as Language) || 'en';

      // Listen for storage changes from other tabs/windows
      window.addEventListener('storage', this.handleStorageChange.bind(this));

      // Create a MutationObserver to watch for localStorage changes
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function (key: string, value: string) {
        const event = new Event('localStorageChange');
        (event as any).key = key;
        (event as any).newValue = value;
        originalSetItem.apply(this, [key, value]);
        window.dispatchEvent(event);
      };

      // Listen for localStorage changes in the current window
      window.addEventListener(
        'localStorageChange',
        this.handleStorageChange.bind(this),
      );
    }

    // Subscribe to cart items and log them
    this.cartItems$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      console.log('Cart Items:', items);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.isBrowser) {
      window.removeEventListener(
        'storage',
        this.handleStorageChange.bind(this),
      );
      window.removeEventListener(
        'localStorageChange',
        this.handleStorageChange.bind(this),
      );
      // Restore original localStorage.setItem
      localStorage.setItem =
        Object.getOwnPropertyDescriptor(Storage.prototype, 'setItem')?.value ||
        localStorage.setItem;
    }
  }

  private handleStorageChange(event: StorageEvent | Event) {
    const key = (event as any).key;
    const newValue = (event as any).newValue;

    if (key === 'country') {
      this.currentCountry = (newValue as Country) || 'EG';
    } else if (key === 'language') {
      this.currentLang = (newValue as Language) || 'en';
    }
  }

  getCurrencySymbol(): string {
    if (this.currentCountry === 'EG') {
      return this.currentLang === 'en' ? 'EGP' : 'ج.م';
    } else {
      return this.currentLang === 'en' ? 'SAR' : 'ر.س';
    }
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

  removeFromCart(productId: number, variantId?: number): void {
    this.cartService.removeFromCart(productId, variantId);
  }

  updateQuantity(
    productId: number,
    quantity: number,
    variantId?: number,
  ): void {
    this.cartService.updateQuantity(productId, quantity, variantId);
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
