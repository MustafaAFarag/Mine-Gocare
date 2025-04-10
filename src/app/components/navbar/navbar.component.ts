import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  PLATFORM_ID,
  Signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarBannerComponent } from '../navbar-banner/navbar-banner.component';
import { isPlatformBrowser } from '@angular/common';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    NavbarBannerComponent,
    AuthModalComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  // Using signal instead of boolean
  isMobileMenuOpen = signal(false);
  authVisible = false;

  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Only add event listener if in browser environment
    if (this.isBrowser) {
      window.addEventListener('resize', this.handleResize);
    }
  }

  ngOnDestroy(): void {
    // Only remove event listener if in browser environment
    if (this.isBrowser) {
      window.removeEventListener('resize', this.handleResize);
    }
  }

  // Handle resize events
  handleResize = (): void => {
    if (this.isBrowser && window.innerWidth >= 768 && this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  };

  // Toggle the mobile menu
  toggleGocare(): void {
    if (this.isBrowser) {
      const body = document.body;
      body.classList.toggle('gocare');
    }
  }

  // Toggle mobile menu with signal update
  toggleMobileMenu(): void {
    console.log('Toggling mobile menu'); // Debugging line
    const newState = !this.isMobileMenuOpen();
    this.isMobileMenuOpen.set(newState);

    // Toggle body scroll lock
    if (this.isBrowser) {
      if (newState) {
        document.body.classList.add('menu-open');
      } else {
        document.body.classList.remove('menu-open');
      }
    }
  }

  // Close mobile menu
  closeMobileMenu(): void {
    if (this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);

      if (this.isBrowser) {
        document.body.classList.remove('menu-open');
      }
    }
  }

  // Toggle dropdown in mobile menu
  toggleDropdown(event: Event): void {
    if (this.isBrowser) {
      const target = event.currentTarget as HTMLElement;
      const dropdownContent = target.nextElementSibling as HTMLElement;

      if (
        dropdownContent &&
        dropdownContent.classList.contains('mobile-dropdown-content')
      ) {
        dropdownContent.classList.toggle('hidden');
        const arrow = target.querySelector('i');
        if (arrow) {
          arrow.classList.toggle('rotate-180');
        }
      }
    }
  }

  showAuthModal() {
    this.authVisible = true;
  }
}
