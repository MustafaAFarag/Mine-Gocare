import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PromoCode } from '../../pages/checkout/models/checkout.models';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-billing-summary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './billing-summary.component.html',
  styleUrls: ['./billing-summary.component.css'],
})
export class BillingSummaryComponent implements OnInit, OnDestroy {
  @Input() promoCodes: PromoCode[] = [];
  @Input() subTotal: number = 0;
  @Input() shipping: number = 0;
  @Input() tax: number = 0;
  @Input() points: number = 0;
  @Input() walletBalance: number = 0;
  @Input() total: number = 0;
  @Input() usePoints: boolean = false;
  @Input() useWallet: boolean = false;

  @Output() couponApplied = new EventEmitter<string>();
  @Output() promoCodeCopied = new EventEmitter<string>();
  @Output() togglePointsEvent = new EventEmitter<void>();
  @Output() toggleWalletEvent = new EventEmitter<void>();
  @Output() placeOrderEvent = new EventEmitter<void>();

  couponForm: FormGroup;
  currentLang: string = 'en';
  private langSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService,
  ) {
    this.couponForm = this.fb.group({
      couponCode: ['', Validators.required],
    });
  }

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

  copyPromoCode(code: string): void {
    this.promoCodeCopied.emit(code);
  }

  applyCoupon(): void {
    if (this.couponForm.valid) {
      const couponCode = this.couponForm.get('couponCode')?.value;
      this.couponApplied.emit(couponCode);
    }
  }

  toggleUsePoints(): void {
    this.togglePointsEvent.emit();
  }

  toggleUseWallet(): void {
    this.toggleWalletEvent.emit();
  }

  placeOrder(): void {
    this.placeOrderEvent.emit();
  }
}
