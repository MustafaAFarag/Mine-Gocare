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

@Component({
  selector: 'app-navbar-banner',
  standalone: true,
  imports: [TranslateModule, NgIf, NgClass],
  templateUrl: './navbar-banner.component.html',
  styleUrl: './navbar-banner.component.css',
})
export class NavbarBannerComponent implements OnInit {
  private languageService = inject(LanguageService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  isLanguageDropdownOpen = false;
  isCountryDropdownOpen = false;
  currentCountry = 'EG';

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
        localStorage.setItem('country', 'EG');
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
    this.currentCountry = country;
    if (this.isBrowser) {
      localStorage.setItem('country', country);
    }
    this.isCountryDropdownOpen = false;
  }

  getCurrentLanguage(): string {
    return this.languageService.getCurrentLanguage();
  }
}
