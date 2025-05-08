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

@Component({
  selector: 'app-payment-options',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './payment-options.component.html',
  styleUrls: ['./payment-options.component.css'],
})
export class PaymentOptionsComponent implements OnInit, OnDestroy {
  @Input() paymentMethod: 'cod' | 'paytabs' | 'wallet' = 'cod';
  @Input() walletBalance: number = 0;
  @Input() totalPrice: number = 0;

  @Output() paymentMethodSelected = new EventEmitter<
    'cod' | 'paytabs' | 'wallet'
  >();

  currentLang: string = 'en';
  private langSubscription: Subscription = new Subscription();

  constructor(private languageService: LanguageService) {}

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

  selectPaymentMethod(method: 'cod' | 'paytabs' | 'wallet'): void {
    // Don't allow wallet payment if balance is insufficient
    if (method === 'wallet' && this.walletBalance < this.totalPrice) {
      return;
    }

    this.paymentMethodSelected.emit(method);
  }

  isWalletDisabled(): boolean {
    return this.walletBalance < this.totalPrice;
  }
}
