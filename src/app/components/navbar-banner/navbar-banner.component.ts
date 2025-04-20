import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-navbar-banner',
  standalone: true,
  imports: [TranslateModule, NgClass],
  templateUrl: './navbar-banner.component.html',
  styleUrl: './navbar-banner.component.css',
})
export class NavbarBannerComponent {
  private languageService = inject(LanguageService);

  translateLanguage(lang: string) {
    this.languageService.setLanguage(lang);
  }

  getCurrentLanguage(): string {
    return this.languageService.getCurrentLanguage();
  }
}
