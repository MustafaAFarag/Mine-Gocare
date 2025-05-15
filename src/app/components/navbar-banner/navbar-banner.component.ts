import { Component, inject, HostListener, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-navbar-banner',
  standalone: true,
  imports: [TranslateModule, NgIf, NgClass],
  templateUrl: './navbar-banner.component.html',
  styleUrl: './navbar-banner.component.css',
})
export class NavbarBannerComponent implements OnInit {
  private languageService = inject(LanguageService);
  isLanguageDropdownOpen = false;
  isCountryDropdownOpen = false;
  currentCountry = 'EG';

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
    const savedCountry = localStorage.getItem('country');
    if (savedCountry) {
      this.currentCountry = savedCountry;
    } else {
      localStorage.setItem('country', 'EG');
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
    localStorage.setItem('country', country);
    this.isCountryDropdownOpen = false;
  }

  getCurrentLanguage(): string {
    return this.languageService.getCurrentLanguage();
  }
}
