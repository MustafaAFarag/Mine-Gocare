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
import { WishlistService } from '../../services/wishlist.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { QuickProductViewModalComponent } from '../quick-product-view-modal/quick-product-view-modal.component';

@Component({
  selector: 'app-product-card',
  imports: [
    CommonModule,
    TranslateModule,
    ToastModule,
    QuickProductViewModalComponent,
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input() product!: Product;
  private langSubscription?: Subscription;
  private translateSubscription?: Subscription;
  currentLang: string = 'en';
  isInWishlist: boolean = false;
  isQuickViewOpen = false;

  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);
  private wishlistService = inject(WishlistService);
  private messageService = inject(MessageService);

  getFullImageUrl = getFullImageUrl;

  constructor(
    private router: Router,
    private cartService: CartService,
    private cartSidebarService: CartSidebarService,
  ) {}

  ngOnInit(): void {
    this.currentLang = this.languageService.getCurrentLanguage();
    this.isInWishlist = this.wishlistService.isInWishlist(
      this.product.productId,
      this.product.variantId,
    );

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

  openQuickView(): void {
    this.isQuickViewOpen = true;
  }

  closeQuickView(): void {
    this.isQuickViewOpen = false;
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

  toggleWishlist(event: Event): void {
    event.stopPropagation();

    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(
        this.product.productId,
        this.product.variantId,
      );
      this.isInWishlist = false;
      this.messageService.add({
        severity: 'info',
        summary: 'Removed from Wishlist',
        detail: `${this.getLocalizedText(this.product.name)} has been removed from your wishlist`,
        life: 2000,
        styleClass: 'black-text-toast',
      });
    } else {
      const added = this.wishlistService.addToWishlist(this.product);
      if (added) {
        this.isInWishlist = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Added to Wishlist',
          detail: `${this.getLocalizedText(this.product.name)} has been added to your wishlist`,
          life: 2000,
          styleClass: 'black-text-toast',
        });
      }
    }
    this.cdr.markForCheck();
  }
}
