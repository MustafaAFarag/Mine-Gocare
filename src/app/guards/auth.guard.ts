import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthModalService } from '../auth-modal.service';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.user$.pipe(
      map((user) => {
        const isLoggedIn = !!user;

        // Additional check for access token
        const hasToken =
          isPlatformBrowser(this.platformId) &&
          localStorage.getItem('accessToken');

        if (isLoggedIn || hasToken) {
          return true;
        }

        if (isPlatformBrowser(this.platformId)) {
          // Store the current URL for redirect after login
          const currentUrl = this.router.url;
          if (currentUrl !== '/') {
            localStorage.setItem('redirectUrl', currentUrl);
          }

          // Small delay to prevent interference with signup flow
          setTimeout(() => {
            this.authModalService.showModal();
          }, 100);
        }

        return this.router.createUrlTree(['/']);
      }),
    );
  }
}
