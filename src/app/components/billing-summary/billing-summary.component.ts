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

@Component({
  selector: 'app-billing-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule, ToastModule],
  providers: [MessageService],
  templateUrl: './billing-summary.component.html',
  styleUrls: ['./billing-summary.component.css'],
})
export class BillingSummaryComponent implements OnInit, OnDestroy {
  @Input() subTotal: number = 0;
  @Input() shipping: number = 0;
  @Input() tax: number = 0;
  @Input() total: number = 0;
  @Input() isLoading: boolean = false;
  promoCodes: PromoCode[] = [];
  accessToken = localStorage.getItem('accessToken');

  @Output() placeOrderEvent = new EventEmitter<void>();

  currentLang: string = 'en';
  private langSubscription: Subscription = new Subscription();

  constructor(
    private languageService: LanguageService,
    private promoCodeService: PromoCodesService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    // Subscribe to language changes
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
