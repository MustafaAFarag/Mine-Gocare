import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthModalService } from '../auth-modal.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private platformId = inject(PLATFORM_ID);

  constructor(
    private authService: AuthService,
    private router: Router,
    private authModalService: AuthModalService,
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated) {
      return true;
    }

    // Only show modal in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Store the attempted URL for redirecting
      const currentUrl = this.router.url;
      localStorage.setItem('redirectUrl', currentUrl);

      // Show modal and redirect to home
      this.authModalService.showModal();
      this.router.navigate(['/']);
    } else {
      // In SSR, redirect to home
      this.router.navigate(['/']);
    }

    return false;
  }
}
