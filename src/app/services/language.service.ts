import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private directionSubject = new BehaviorSubject<'ltr' | 'rtl'>('ltr');
  public direction$ = this.directionSubject.asObservable();

  // Add a behavior subject for language changes
  private languageSubject = new BehaviorSubject<string>('en');
  public language$ = this.languageSubject.asObservable();

  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor(private translateService: TranslateService) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Initialize with default language
    const defaultLang = 'en';

    if (this.isBrowser) {
      // Only access localStorage in browser environment
      const savedLang = localStorage.getItem('language') || defaultLang;
      this.setLanguage(savedLang);
    } else {
      // In SSR, just use default language without DOM manipulation
      this.translateService.use(defaultLang);
      this.languageSubject.next(defaultLang);
    }
  }

  setLanguage(lang: string) {
    // Set the language
    this.translateService.use(lang);
    this.languageSubject.next(lang);

    // Only perform browser-specific operations when in browser environment
    if (this.isBrowser) {
      // Save language preference
      localStorage.setItem('language', lang);

      // Set direction based on language
      const direction = lang === 'ar' ? 'rtl' : 'ltr';
      this.directionSubject.next(direction);

      // Apply direction to document
      document.documentElement.setAttribute('dir', direction);
      document.documentElement.setAttribute('lang', lang);

      // Add or remove RTL class from body
      if (direction === 'rtl') {
        document.body.classList.add('rtl');
      } else {
        document.body.classList.remove('rtl');
      }

      // Let Angular handle the rendering without forcing a visible reflow
      // This avoids the black screen flash
      requestAnimationFrame(() => {
        // The requestAnimationFrame itself is enough to trigger a reflow
        // without any visible flashing
      });
    }
  }

  getCurrentLanguage(): string {
    return this.translateService.currentLang || 'en';
  }

  isRtl(): boolean {
    return this.directionSubject.value === 'rtl';
  }
}
