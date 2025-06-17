import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointingSystemService } from '../../../services/pointing-system.service';
import { CountryService } from '../../../services/country.service';
import {
  PointsClientPreview,
  PointSettings,
} from '../../../model/PointingSystem';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PointsRedeemModalComponent } from './points-redeem-modal/points-redeem-modal.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type Language = 'en' | 'ar';

@Component({
  selector: 'app-points',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LoadingComponent,
    ToastModule,
    PointsRedeemModalComponent,
  ],
  providers: [MessageService],
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.css'],
})
export class PointsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  token: string | null;
  pointsClientPreview!: PointsClientPreview;
  pointSettings!: PointSettings;
  clientPoints!: number;
  currentLang: Language = 'en';
  isRedeeming: boolean = false;
  showRedeemModal: boolean = false;

  // Loading states
  isLoadingPoints: boolean = false;
  isLoadingSettings: boolean = false;
  isLoadingTotalPoints: boolean = false;

  constructor(
    private pointingService: PointingSystemService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private countryService: CountryService,
  ) {
    this.token = localStorage.getItem('accessToken');

    this.currentLang = this.translateService.currentLang as Language;
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang = event.lang as Language;
    });

    // Subscribe to country changes
    this.countryService.country$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Refetch all data when country changes
        this.fetchPointsClientPreview();
        this.fetchClientsTotalPoints();
      });
  }

  ngOnInit(): void {
    this.fetchPointsClientPreview();
    this.fetchClientsTotalPoints();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchPointsClientPreview(): void {
    if (this.token) {
      this.isLoadingPoints = true;
      this.pointingService
        .getClientPointsPreview(this.token, 1, this.currentPage, this.pageSize)
        .subscribe({
          next: (response) => {
            this.pointsClientPreview = response.result;
            this.totalPages = Math.ceil(
              this.pointsClientPreview.totalCount / this.pageSize,
            );
          },
          error: (error) => {
            console.error('Error fetching points preview:', error);
          },
          complete: () => {
            this.isLoadingPoints = false;
          },
        });
    }
  }

  fetchClientsTotalPoints(): void {
    if (this.token) {
      this.isLoadingTotalPoints = true;
      this.pointingService.getClientsTotalPoints(this.token).subscribe({
        next: (response) => {
          this.clientPoints = response.result;
        },
        error: (error) => {
          console.error('Error fetching total points:', error);
        },
        complete: () => {
          this.isLoadingTotalPoints = false;
        },
      });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchPointsClientPreview();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchPointsClientPreview();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchPointsClientPreview();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getConvertedAmount(): number {
    return this.clientPoints * (this.pointsClientPreview?.exchangeRate || 0.01);
  }

  openRedeemModal(): void {
    this.showRedeemModal = true;
  }

  closeRedeemModal(): void {
    this.showRedeemModal = false;
  }

  getCurrency(): string {
    const country = localStorage.getItem('country');
    const language = localStorage.getItem('language');

    if (country === 'EG') {
      return language === 'ar' ? 'ج.م' : 'EGP';
    } else if (country === 'SA') {
      return language === 'ar' ? 'ر.س' : 'SAR';
    }
    return 'EGP';
  }

  redeemPoints(points: number): void {
    if (this.token && points > 0) {
      this.isRedeeming = true;
      this.pointingService.redeemingPoints(this.token, points).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('points.redeemSuccess'),
            detail: this.translateService.instant(
              'points.redeemSuccessDetail',
              {
                points: points,
                amount:
                  points * (this.pointsClientPreview?.exchangeRate || 0.01),
              },
            ),
            life: 3000,
            styleClass: 'black-text-toast',
          });
          // Refresh points after successful redemption
          this.fetchClientsTotalPoints();
          this.fetchPointsClientPreview();
          this.closeRedeemModal();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('points.redeemError'),
            detail: this.translateService.instant('points.redeemErrorDetail'),
            life: 3000,
            styleClass: 'black-text-toast',
          });
        },
        complete: () => {
          this.isRedeeming = false;
        },
      });
    }
  }

  getFormattedExpiryDate(): string {
    if (this.pointsClientPreview?.nerestExpiryDate) {
      const date = new Date(this.pointsClientPreview.nerestExpiryDate);
      return date.toLocaleDateString(
        this.currentLang === 'en' ? 'en-US' : 'ar-SA',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
      );
    }
    return '';
  }

  hasExpiringPoints(): boolean {
    return this.pointsClientPreview?.nearestExpiredPoints > 0;
  }
}
