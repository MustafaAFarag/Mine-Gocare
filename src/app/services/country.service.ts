import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private countrySubject = new BehaviorSubject<string>('EG');
  country$ = this.countrySubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cartService: CartService,
  ) {
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
    // Clear cart when country changes
    this.cartService.clearCart();
  }

  getCurrentCountry(): string {
    return this.countrySubject.value;
  }
}
