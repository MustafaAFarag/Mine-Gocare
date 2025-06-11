import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { PromoCodesService } from '../../services/promo-codes.service';
import { PromoCode } from '../../model/PromoCodes';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../model/Cart';
import { OrderService } from '../../services/order.service';

type Language = 'en' | 'ar';

@Component({
  selector: 'app-billing-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule, ToastModule, ReactiveFormsModule],
  providers: [MessageService],
  templateUrl: './billing-summary.component.html',
  styleUrls: ['./billing-summary.component.css'],
})
export class BillingSummaryComponent implements OnInit, OnDestroy {
  @Input() shipping: number = 0;
  @Input() tax: number = 0;
  @Input() total: number = 0;
  @Input() subTotal: number = 0;
  @Input() isLoading: boolean = false;
  @Input() set selectedAddressId(value: number | undefined) {
    if (value !== undefined) {
      this._selectedAddressId = value;
      this.fetchOrderSummary();
    }
  }
  get selectedAddressId(): number | undefined {
    return this._selectedAddressId;
  }
  private _selectedAddressId: number | undefined = undefined;
  @Input() orderProducts: Array<{
    productVariantId: number;
    quantity: number;
    price: number;
  }> = [];

  promoForm!: FormGroup;
  currentLang: Language = 'en';
  discountAmount: number = 0;
  hasPromoCodeInCart: boolean = false;
  finalTotal: number = 0;
  cartItems: CartItem[] = [];
  isPromoApplied: boolean = false;
  isApplyingPromo: boolean = false;
  promoCodes: PromoCode[] = [];
  accessToken = localStorage.getItem('accessToken');
  appliedPromoCode: PromoCode | null = null;
  private cartSubscription: Subscription = new Subscription();
  orderSummary: any = null;
  loading: boolean = false;

  @Output() placeOrderEvent = new EventEmitter<void>();
  @Output() promoApplied = new EventEmitter<{
    promoCodeId: number;
    discount: number;
  }>();
  @Output() summaryUpdated = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private promoCodeService: PromoCodesService,
    private messageService: MessageService,
    private cartService: CartService,
    private translateService: TranslateService,
    private orderService: OrderService,
  ) {
    this.currentLang = this.translateService.currentLang as Language;
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang = event.lang as Language;
    });
  }

  ngOnInit(): void {
    this.promoForm = this.fb.group({
      couponCode: [{ value: '', disabled: false }],
    });

    // Subscribe to cart changes
    this.cartSubscription = this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
      this.calculateTotals();
      this.fetchOrderSummary(); // Fetch order summary when cart changes
    });

    this.fetchPromoCodes();
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  fetchOrderSummary(): void {
    if (!this.accessToken || !this.selectedAddressId) return;

    this.loading = true;
    const orderRequest = {
      orderProducts: this.orderProducts,
      addressId: this.selectedAddressId,
      promoCodeId: this.appliedPromoCode?.id
    };

    this.orderService.getOrderSummary(this.accessToken, orderRequest).subscribe({
      next: (response) => {
        console.log('Order Summary Response:', response.result);
        if (response.success) {
          this.orderSummary = response.result;
          
          this.updateTotalsFromSummary();
          this.summaryUpdated.emit(this.orderSummary);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching order summary:', error);
        this.loading = false;
      }
    });
  }

  updateTotalsFromSummary(): void {
    if (this.orderSummary) {
      // Only update shipping fees from API response
      this.shipping = this.orderSummary.shippingFees || 0;
      
      // Recalculate final total with new shipping
      this.finalTotal = this.subTotal + this.shipping + this.tax;
      if (this.appliedPromoCode) {
        this.discountAmount = this.calculateDiscount(this.appliedPromoCode);
        this.finalTotal -= this.discountAmount;
      }
    }
  }

  placeOrder(): void {
    this.placeOrderEvent.emit();
  }

  copyPromoCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant(
          'checkout.toast.codeCopied.summary',
        ),
        detail: this.translateService.instant(
          'checkout.toast.codeCopied.detail',
        ),
        life: 2000,
        styleClass: 'black-text-toast',
      });
    });
  }

  clearPromoCode(): void {
    this.promoForm.get('couponCode')?.setValue('');
    this.isPromoApplied = false;
    this.appliedPromoCode = null;
    this.discountAmount = 0;
    this.calculateTotals();
    this.promoApplied.emit({ promoCodeId: 0, discount: 0 });

    // Show toast message
    this.messageService.add({
      severity: 'info',
      summary: this.translateService.instant('checkout.toast.promoRemoved.summary'),
      detail: this.translateService.instant('checkout.toast.promoRemoved.detail'),
      life: 2000,
      styleClass: 'black-text-toast',
    });
  }

  calculateDiscount(promoCode: PromoCode): number {
    switch (promoCode.type) {
      case 3: // Offer (wallet points)
        if (promoCode.buyCount && promoCode.getCount) {
          // For type 3, we'll add points to wallet after order
          return 0;
        }
        return 0;
      case 2: // Percentage
        const percentageDiscount =
          (this.subTotal * promoCode.offerAmount) / 100;
        return promoCode.uptoAmount
          ? Math.min(percentageDiscount, promoCode.uptoAmount)
          : percentageDiscount;
      case 1: // Fixed amount
        if (this.subTotal >= (promoCode.minimumCheckoutAmount || 0)) {
          return promoCode.offerAmount;
        }
        return 0;
      default:
        return 0;
    }
  }

  applyPromoCode(): void {
    const code = this.promoForm.value.couponCode;
    if (!code) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant(
          'checkout.toast.emptyCode.summary',
        ),
        detail: this.translateService.instant(
          'checkout.toast.emptyCode.detail',
        ),
        life: 3000,
      });
      return;
    }

    // Reset state before applying new promo code
    this.isPromoApplied = false;
    this.appliedPromoCode = null;
    this.discountAmount = 0;
    this.finalTotal = this.subTotal + this.shipping + this.tax;

    this.isApplyingPromo = true;
    this.promoForm.get('couponCode')?.disable();

    this.promoCodeService
      .validatePromoCode(this.accessToken!, code, this.orderProducts)
      .subscribe({
        next: (response) => {
          if (response.result.isValid) {
            const matchedPromo = this.promoCodes.find((p) => p.code === code);
            if (matchedPromo) {
              this.appliedPromoCode = matchedPromo;
              this.discountAmount = this.calculateDiscount(matchedPromo);
              this.isPromoApplied = true;

              // Emit the promo code ID and discount for the parent component
              this.promoApplied.emit({
                promoCodeId: matchedPromo.id,
                discount: this.discountAmount,
              });

              // Fetch updated order summary after applying promo code
              this.fetchOrderSummary();

              let message = '';
              if (matchedPromo.type === 3) {
                message = this.translateService.instant(
                  'checkout.toast.promoWalletPoints.detail',
                  {
                    points: matchedPromo.getCount,
                    amount: matchedPromo.buyCount,
                  },
                );
              } else {
                message = this.translateService.instant(
                  'checkout.toast.promoApplied.detail',
                  {
                    amount: this.discountAmount.toFixed(2),
                  },
                );
              }

              this.messageService.add({
                severity: 'success',
                summary: this.translateService.instant(
                  'checkout.toast.promoApplied.summary',
                ),
                detail: message,
                life: 3000,
              });
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translateService.instant(
                'checkout.toast.invalidPromo.summary',
              ),
              detail:
                response.result.message ===
                'This code is not valid for this product'
                  ? this.translateService.instant(
                      'checkout.toast.codeNotValidForProduct.detail',
                    )
                  : response.result.message ||
                    this.translateService.instant(
                      'checkout.toast.invalidPromo.detail',
                    ),
              life: 3000,
            });
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant(
              'checkout.toast.error.summary',
            ),
            detail: this.translateService.instant(
              'checkout.toast.error.detail',
            ),
            life: 3000,
          });
        },
        complete: () => {
          this.isApplyingPromo = false;
          this.promoForm.get('couponCode')?.enable();
        },
      });
  }

  calculateTotals(): void {
    // Calculate subtotal
    this.subTotal = this.cartItems.reduce(
      (total, item) => total + item.afterPrice * item.quantity,
      0,
    );

    console.log('cartItems', this.cartItems);
    // Check if any cart item has a promoCodeDetail
    this.hasPromoCodeInCart = this.cartItems.some(item => item.promoCodeDetail !== null);

    // Calculate final total including shipping, tax, and any discounts
    let total = this.subTotal + this.shipping + this.tax;

    // If there's an applied promo code, recalculate discount
    if (this.appliedPromoCode) {
      this.discountAmount = this.calculateDiscount(this.appliedPromoCode);
      total -= this.discountAmount;
    }

    this.finalTotal = total;
  }

  fetchPromoCodes(): void {
    if (this.accessToken) {
      this.promoCodeService.getAllPromoCodes(this.accessToken).subscribe({
        next: (response) => {
          this.promoCodes = response.result.items || [];
        },
        error: (err) => {
          console.error('Failed to fetch promo codes:', err);
        },
      });
    }
  }
}
