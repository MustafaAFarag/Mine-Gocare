import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { getFullImageUrl } from '../../lib/utils';
import { CartItem } from '../../model/Cart';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css'],
})
export class OrderSummaryComponent implements OnInit, OnDestroy {
  @Input() cartItems: CartItem[] = [];

  currentLang: string = 'en';
  private langSubscription: Subscription = new Subscription();

  getfullImageUrl = getFullImageUrl;

  constructor(
    private languageService: LanguageService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    // Subscribe to language changes
    this.langSubscription = this.languageService.language$.subscribe((lang) => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  incrementQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.quantity + 1);
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.productId, item.quantity - 1);
    } else {
      this.cartService.removeFromCart(item.productId);
    }
  }
}
