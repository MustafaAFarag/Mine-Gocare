import {
  Component,
  inject,
  HostListener,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { NgIf, NgClass, isPlatformBrowser } from '@angular/common';
import { CountryService } from '../../services/country.service';
import { PointingSystemService } from '../../services/pointing-system.service';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-navbar-banner',
  standalone: true,
  imports: [TranslateModule, NgIf, NgClass, DialogModule],
  templateUrl: './navbar-banner.component.html',
  styleUrl: './navbar-banner.component.css',
})
export class NavbarBannerComponent implements OnInit {
  private languageService = inject(LanguageService);
  private platformId = inject(PLATFORM_ID);
  private countryService = inject(CountryService);
  private pointingSystemService = inject(PointingSystemService);
  private isBrowser: boolean;

  isLanguageDropdownOpen = false;
  isCountryDropdownOpen = false;
  currentCountry = 'EG';
  showPointsModal = false;
  pointsGained = 0;
  loadingPoints = false;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-dropdown')) {
      this.isLanguageDropdownOpen = false;
    }
    if (!target.closest('.country-dropdown')) {
      this.isCountryDropdownOpen = false;
    }
  }

  ngOnInit() {
    if (this.isBrowser) {
      const savedCountry = localStorage.getItem('country');
      if (savedCountry) {
        this.currentCountry = savedCountry;
      } else {
        this.countryService.setCountry('EG');
      }
    }
  }

  toggleLanguageDropdown() {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  toggleCountryDropdown() {
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
  }

  translateLanguage(lang: string) {
    this.languageService.setLanguage(lang);
    this.isLanguageDropdownOpen = false;
  }

  selectCountry(country: string) {
    // Don't add points if selecting the same country
    if (country === this.currentCountry) {
      this.isCountryDropdownOpen = false;
      return;
    }

    this.currentCountry = country;
    this.countryService.setCountry(country);
    this.isCountryDropdownOpen = false;

    // Add points for country change
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.loadingPoints = true;
      console.log('Attempting to add country change points with token:', token);
      this.pointingSystemService.addPoints(token, 2, false).subscribe({
        next: (pointsResponse) => {
          this.loadingPoints = false;
          console.log('Country change points response:', pointsResponse);
          if (pointsResponse.success && pointsResponse.result > 0) {
            this.pointsGained = pointsResponse.result;
            this.showPointsModal = true;
          }
        },
        error: (error) => {
          this.loadingPoints = false;
          console.error('Error adding country change points:', error);
        },
      });
    }
  }

  handlePointsModalClose() {
    this.showPointsModal = false;
  }

  getCurrentLanguage(): string {
    return this.languageService.getCurrentLanguage();
  }
}
