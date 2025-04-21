import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Product } from '../../model/Product';
import { getFullImageUrl } from '../../lib/utils';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { CartItem } from '../../model/Cart';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, TranslateModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input() product!: Product;
  private langSubscription?: Subscription;
  private translateSubscription?: Subscription;
  currentLang: string = 'en';

  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);

  getFullImageUrl = getFullImageUrl;

  constructor(
    private router: Router,
    private cartService: CartService,
    private cartSidebarService: CartSidebarService,
  ) {}

  ngOnInit(): void {
    this.currentLang = this.languageService.getCurrentLanguage();

    // Subscribe to direction changes
    this.langSubscription = this.languageService.direction$.subscribe(() => {
      this.currentLang = this.languageService.getCurrentLanguage();
      this.cdr.markForCheck();
    });

    // Subscribe to language changes directly from translate service
    this.translateSubscription = this.translateService.onLangChange.subscribe(
      (event) => {
        this.currentLang = event.lang;
        this.cdr.markForCheck();
      },
    );
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.translateSubscription) {
      this.translateSubscription.unsubscribe();
    }
  }

  getLocalizedText(textObj: any): string {
    if (!textObj) return '';
    return this.currentLang === 'ar' && textObj?.ar ? textObj.ar : textObj.en;
  }

  navigateToProductDetails(productId: number, variantId: number): void {
    this.router.navigate([`/product-details/${productId}/${variantId}`]);
  }

  addToCart(product: Product): void {
    console.log('product', product);
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
    console.log('cartItem', cartItem);
    this.cartService.addToCart(cartItem);
    this.cartSidebarService.openCart(); // Open the cart sidebar after adding the item
  }
}
