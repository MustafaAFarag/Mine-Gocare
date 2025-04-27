import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  PLATFORM_ID,
  Signal,
  Output,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NavbarBannerComponent } from '../navbar-banner/navbar-banner.component';
import { isPlatformBrowser } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { User } from '../../model/User';
import { CartSidebarComponent } from '../cart-sidebar/cart-sidebar.component';
import { TranslateModule } from '@ngx-translate/core';
import { SearchComponent } from '../search/search.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    NavbarBannerComponent,
    DialogModule,
    ButtonModule,
    InputTextModule,
    AuthModalComponent,
    CartSidebarComponent,
    TranslateModule,
    SearchComponent,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  styles: [
    `
      :host ::ng-deep .black-text-toast .p-toast-message-content {
        color: black;
      }
    `,
  ],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild(CartSidebarComponent) cartSidebar!: CartSidebarComponent;

  isMobileMenuOpen = signal(false);
  visible: boolean = false;
  userSubscription!: Subscription;
  cartSubscription!: Subscription;
  currentUser!: User;
  cartCount = 0;
  isPagesDropdownOpen: boolean = false;
  isSearchOpen: boolean = false;

  showDialog() {
    this.visible = !this.visible;
  }

  onVisibleChange(newValue: boolean) {
    console.log('Dialog visibility changed:', newValue);
    this.visible = newValue;
  }

  toggleMode(isLoginMode: boolean) {
    this.visible = true;
  }

  toggleCart(): void {
    this.cartSidebar.toggleCart();
  }

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private messageService: MessageService,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  navigateToCart() {}

  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.currentUser = user;
      console.log('Current user:', this.currentUser);
    });

    this.cartSubscription = this.cartService.cartItems$.subscribe((items) => {
      this.cartCount = items.reduce((total, item) => total + item.quantity, 0);
    });

    if (this.isBrowser) {
      window.addEventListener('resize', this.handleResize);
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }

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

  // Toggle Pages dropdown in mobile menu
  togglePagesDropdown(): void {
    this.isPagesDropdownOpen = !this.isPagesDropdownOpen;
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();

    // Show success toast notification with black text
    this.messageService.add({
      severity: 'success',
      summary: 'Logged Out',
      detail: 'You have been successfully logged out',
      life: 3000,
      styleClass: 'black-text-toast',
    });
  }

  // Scroll to top of the page
  scrollToTop(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Toggle search panel
  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  // Close search panel
  closeSearch(): void {
    this.isSearchOpen = false;
  }
}
