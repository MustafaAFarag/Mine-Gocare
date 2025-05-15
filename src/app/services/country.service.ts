import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private countrySubject = new BehaviorSubject<string>('EG');
  country$ = this.countrySubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Initialize with stored country or default to 'EG'
    if (isPlatformBrowser(this.platformId)) {
      const storedCountry = localStorage.getItem('country');
      if (storedCountry) {
        this.countrySubject.next(storedCountry);
      }
    }
  }

  setCountry(country: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('country', country);
    }
    this.countrySubject.next(country);
  }

  getCurrentCountry(): string {
    return this.countrySubject.value;
  }
}
