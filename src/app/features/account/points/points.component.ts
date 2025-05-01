import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointingSystemService } from '../../../services/pointing-system.service';
import {
  PointsClientPreview,
  PointSettings,
} from '../../../model/PointingSystem';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoadingComponent } from '../../../shared/loading/loading.component';

type Language = 'en' | 'ar';

@Component({
  selector: 'app-points',
  standalone: true,
  imports: [CommonModule, TranslateModule, LoadingComponent],
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.css'],
})
export class PointsComponent implements OnInit {
  showHowToGetPoints: boolean = false;
  totalPoints: number = 1970;
  conversionRate: number = 0.03;
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  token: string | null;
  pointsClientPreview!: PointsClientPreview;
  pointSettings!: PointSettings;
  clientPoints!: number;
  currentLang: Language = 'en';

  // Loading states
  isLoadingPoints: boolean = false;
  isLoadingSettings: boolean = false;
  isLoadingTotalPoints: boolean = false;

  constructor(
    private pointingService: PointingSystemService,
    private translateService: TranslateService,
  ) {
    this.token = localStorage.getItem('accessToken');

    this.currentLang = this.translateService.currentLang as Language;
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang = event.lang as Language;
    });
  }

  ngOnInit(): void {
    this.fetchPointsClientPreview();
    this.fetchAllPointingSettings();
    this.fetchClientsTotalPoints();
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
            console.log('Points Preview Response:', this.pointsClientPreview);
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

  fetchAllPointingSettings(): void {
    if (this.token) {
      this.isLoadingSettings = true;
      this.pointingService.getAllPointingSettings(this.token).subscribe({
        next: (response) => {
          this.pointSettings = response.result;
          console.log('All Pointing Settings Response:', this.pointSettings);
        },
        error: (error) => {
          console.error('Error fetching point settings:', error);
        },
        complete: () => {
          this.isLoadingSettings = false;
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
          console.log('CLIENTS TOTAL POINTS', this.clientPoints);
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
}
