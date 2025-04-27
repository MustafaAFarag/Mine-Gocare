import { Component, inject, HostListener } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar-banner',
  standalone: true,
  imports: [TranslateModule, NgIf],
  templateUrl: './navbar-banner.component.html',
  styleUrl: './navbar-banner.component.css',
})
export class NavbarBannerComponent {
  private languageService = inject(LanguageService);
  isLanguageDropdownOpen = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-dropdown')) {
      this.isLanguageDropdownOpen = false;
    }
  }

  toggleLanguageDropdown() {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  translateLanguage(lang: string) {
    this.languageService.setLanguage(lang);
    this.isLanguageDropdownOpen = false;
  }

  getCurrentLanguage(): string {
    return this.languageService.getCurrentLanguage();
  }
}
