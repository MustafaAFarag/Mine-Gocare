import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { PromoCodesService } from '../../services/promo-codes.service';
import { PromoCode } from '../../model/PromoCodes';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-billing-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule, ToastModule, ReactiveFormsModule],
  providers: [MessageService],
  templateUrl: './billing-summary.component.html',
  styleUrls: ['./billing-summary.component.css'],
})
export class BillingSummaryComponent implements OnInit, OnDestroy {
  @Input() subTotal: number = 0;
  @Input() shipping: number = 0;
  @Input() tax: number = 0;
  @Input() total: number = 0;
  promoForm!: FormGroup;
  discountAmount: number = 0;
  @Input() orderProducts: Array<{
    productVariantId: number;
    quantity: number;
    price: number;
  }> = [];
  finalTotal: number = 0;
  isPromoApplied: boolean = false;
  @Input() isLoading: boolean = false;
  isApplyingPromo: boolean = false;
  promoCodes: PromoCode[] = [];
  accessToken = localStorage.getItem('accessToken');
  appliedPromoCode: PromoCode | null = null;

  @Output() placeOrderEvent = new EventEmitter<void>();
  @Output() promoApplied = new EventEmitter<{
    promoCodeId: number;
    discount: number;
  }>();

  currentLang: string = 'en';
  private langSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService,
    private promoCodeService: PromoCodesService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.promoForm = this.fb.group({
      couponCode: [''],
    });
    this.finalTotal = this.total;
    this.langSubscription = this.languageService.language$.subscribe((lang) => {
      this.currentLang = lang;
    });
    this.fetchPromoCodes();
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  placeOrder(): void {
    this.placeOrderEvent.emit();
  }

  copyPromoCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied!',
        detail: 'Promo code copied to clipboard',
        life: 2000,
        styleClass: 'black-text-toast',
      });
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
        const percentageDiscount = (this.total * promoCode.offerAmount) / 100;
        return promoCode.uptoAmount
          ? Math.min(percentageDiscount, promoCode.uptoAmount)
          : percentageDiscount;
      case 1: // Fixed amount
        if (this.total >= (promoCode.minimumCheckoutAmount || 0)) {
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
        summary: 'Empty Code',
        detail: 'Please enter a promo code.',
        life: 3000,
      });
      return;
    }

    this.isApplyingPromo = true;
    this.promoCodeService
      .validatePromoCode(this.accessToken!, code, this.orderProducts)
      .subscribe({
        next: (response) => {
          if (response.result.isValid) {
            const matchedPromo = this.promoCodes.find((p) => p.code === code);
            if (matchedPromo) {
              // Check if it's a type 3 promo and has less than 2 products
              if (
                matchedPromo.type === 3 &&
                this.orderProducts.reduce(
                  (sum, item) => sum + item.quantity,
                  0,
                ) < 2
              ) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Invalid Promo',
                  detail:
                    'Type 3 promo codes require at least 2 products in your cart.',
                  life: 3000,
                });
                return;
              }

              this.appliedPromoCode = matchedPromo;
              this.discountAmount = this.calculateDiscount(matchedPromo);
              this.finalTotal = this.total - this.discountAmount;
              this.isPromoApplied = true;

              // Emit the promo code ID and discount for the parent component
              this.promoApplied.emit({
                promoCodeId: matchedPromo.id,
                discount: this.discountAmount,
              });

              let message = `Discount of ${this.discountAmount.toFixed(2)} EGP applied.`;
              if (matchedPromo.type === 3) {
                message = `You will receive ${matchedPromo.getCount} points in your wallet after purchasing ${matchedPromo.buyCount} worth of products.`;
              }

              this.messageService.add({
                severity: 'success',
                summary: 'Promo Applied',
                detail: message,
                life: 3000,
              });
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Invalid Promo',
              detail: 'The promo code is not valid for your order.',
              life: 3000,
            });
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to validate promo code.',
            life: 3000,
          });
        },
        complete: () => {
          this.isApplyingPromo = false;
        },
      });
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
