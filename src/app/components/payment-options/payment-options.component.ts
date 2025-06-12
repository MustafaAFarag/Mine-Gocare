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
import { PointingSystemService } from '../../services/pointing-system.service';

@Component({
  selector: 'app-payment-options',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './payment-options.component.html',
  styleUrls: ['./payment-options.component.css'],
})
export class PaymentOptionsComponent implements OnInit, OnDestroy {
  @Input() paymentMethod: 'cod' | 'wallet' | 'points' = 'cod';
  @Input() walletBalance: number = 0;
  @Input() totalPrice: number = 0;

  @Output() paymentMethodSelected = new EventEmitter<
    'cod' | 'wallet' | 'points'
  >();

  currentLang: string = 'en';
  private langSubscription: Subscription = new Subscription();
  totalPoints: number = 0;
  pointsValueInEGP: number = 0;
  readonly POINTS_TO_EGP_RATIO = 0.5; // 1 point = 0.5 EGP

  constructor(
    private languageService: LanguageService,
    private pointingSystemService: PointingSystemService,
  ) {}

  ngOnInit(): void {
    // Subscribe to language changes
    this.langSubscription = this.languageService.language$.subscribe((lang) => {
      this.currentLang = lang;
    });

    // Fetch total points
    this.fetchTotalPoints();
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  fetchTotalPoints(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.pointingSystemService.getClientsTotalPoints(token).subscribe({
        next: (response) => {
          if (response.success) {
            this.totalPoints = response.result || 0;
            this.pointsValueInEGP = this.totalPoints * this.POINTS_TO_EGP_RATIO;
          }
        },
        error: (error) => {
          console.error('Error fetching total points:', error);
        },
      });
    }
  }

  selectPaymentMethod(method: 'cod' | 'wallet' | 'points'): void {
    // Don't allow wallet payment if balance is insufficient
    if (method === 'wallet' && this.walletBalance < this.totalPrice) {
      return;
    }

    // Don't allow points payment if points value is insufficient
    if (method === 'points' && this.pointsValueInEGP < this.totalPrice) {
      return;
    }

    this.paymentMethodSelected.emit(method);
  }

  isWalletDisabled(): boolean {
    return this.walletBalance < this.totalPrice;
  }

  isPointsDisabled(): boolean {
    return this.pointsValueInEGP < this.totalPrice;
  }

  getRequiredPoints(): number {
    // Calculate how many points are needed to cover the total price
    return Math.ceil(this.totalPrice / this.POINTS_TO_EGP_RATIO);
  }
}
