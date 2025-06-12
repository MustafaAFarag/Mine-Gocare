import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getFullImageUrl } from '../../lib/utils';
import { CartItem } from '../../model/Cart';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css'],
})
export class OrderSummaryComponent implements OnInit, OnDestroy {
  @Input() cartItems: CartItem[] = [];
  @Input() selectedAddressId: number | undefined = undefined;
  @Input() promoCodeId: number | undefined = undefined;
  @Input() loading: boolean = false;
  @Input() currentLang: string = 'en';

  @Output() summaryUpdated = new EventEmitter<any>();
  @Output() deliveryNotesChange = new EventEmitter<string>();

  orderSummary: any = null;
  deliveryNotes: string = '';

  private langSubscription: Subscription = new Subscription();

  getfullImageUrl = getFullImageUrl;

  constructor(
    private languageService: LanguageService,
    private cartService: CartService,
    private orderService: OrderService,
  ) {}

  ngOnInit(): void {
    // Subscribe to language changes
    this.langSubscription = this.languageService.language$.subscribe((lang) => {
      this.currentLang = lang;
    });

    // Fetch order summary when component initializes
    this.fetchOrderSummary();
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  fetchOrderSummary(): void {
    const token = localStorage.getItem('accessToken');
    if (!token || !this.selectedAddressId) return;

    this.loading = true;
    const orderRequest = {
      orderProducts: this.cartItems.map((item) => ({
        productVariantId: item.variantId || item.productId,
        quantity: item.quantity,
        price: item.afterPrice,
      })),
      addressId: this.selectedAddressId,
      promoCodeId: this.promoCodeId,
    };

    console.log('Order Summary Request:', orderRequest);

    this.orderService.getOrderSummary(token, orderRequest).subscribe({
      next: (response) => {
        console.log('Order Summary Response:', response);
        if (response.success) {
          this.orderSummary = response.result;
          this.summaryUpdated.emit(this.orderSummary);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching order summary:', error);
        this.loading = false;
      },
    });
  }

  getCurrency(item: CartItem): string {
    return item.currency?.[this.currentLang] || item.currency?.en || 'EGP';
  }

  incrementQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.quantity + 1);
    this.fetchOrderSummary(); // Refresh summary after quantity change
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.productId, item.quantity - 1);
    } else {
      this.cartService.removeFromCart(item.productId);
    }
    this.fetchOrderSummary(); // Refresh summary after quantity change
  }

  onDeliveryNotesChange(notes: string): void {
    this.deliveryNotesChange.emit(notes);
  }
}
