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
  promoCodes: PromoCode[] = [];
  accessToken = localStorage.getItem('accessToken');

  @Output() placeOrderEvent = new EventEmitter<void>();

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

    this.promoCodeService
      .validatePromoCode(this.accessToken!, code, this.orderProducts)
      .subscribe({
        next: (response) => {
          if (response.result.isValid) {
            const matchedPromo = this.promoCodes.find((p) => p.code === code);
            if (matchedPromo) {
              this.discountAmount = matchedPromo.offerAmount;
              this.finalTotal = this.total - this.discountAmount;
              this.isPromoApplied = true;

              this.messageService.add({
                severity: 'success',
                summary: 'Promo Applied',
                detail: `Discount of ${this.discountAmount} EGP applied.`,
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
