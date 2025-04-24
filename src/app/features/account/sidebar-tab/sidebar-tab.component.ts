import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserProfile } from '../../../model/Auth';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language.service';
import { Subscription } from 'rxjs';

interface SidebarItem {
  name: string;
  nameKey: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar-tab',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './sidebar-tab.component.html',
  styleUrl: './sidebar-tab.component.css',
})
export class SidebarTabComponent implements OnInit, OnDestroy {
  user!: UserProfile;
  private langSubscription!: Subscription;
  currentLang: string = 'en';
  isLoading: boolean = true;

  sidebarItems: SidebarItem[] = [
    {
      name: 'Dashboard',
      nameKey: 'account.sidebar.dashboard',
      icon: 'ri-dashboard-line',
      route: '/account/dashboard',
      active: false,
    },
    {
      name: 'Notifications',
      nameKey: 'account.sidebar.notifications',
      icon: 'ri-notification-line',
      route: '/account/notifications',
      active: false,
    },
    {
      name: 'My Wallet',
      nameKey: 'account.sidebar.wallet',
      icon: 'ri-wallet-line',
      route: '/account/wallet',
      active: false,
    },
    {
      name: 'My Orders',
      nameKey: 'account.sidebar.orders',
      icon: 'ri-file-list-line',
      route: '/account/orders',
      active: false,
    },

    {
      name: 'Bank Details',
      nameKey: 'account.sidebar.bankDetails',
      icon: 'ri-bank-line',
      route: '/account/bank-details',
      active: false,
    },
    {
      name: 'Refund History',
      nameKey: 'account.sidebar.refundHistory',
      icon: 'ri-refund-line',
      route: '/account/refund',
      active: false,
    },
    {
      name: 'Saved Address',
      nameKey: 'account.sidebar.savedAddress',
      icon: 'ri-map-pin-line',
      route: '/account/address',
      active: false,
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    public languageService: LanguageService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    // Set initial active state based on current URL
    this.setActiveItem(this.router.url);

    // Subscribe to router events to update active state when route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.setActiveItem(event.url);
      });

    // Load user data from localStorage
    this.loadUserFromLocalStorage();

    // Get current language
    this.currentLang = this.languageService.getCurrentLanguage();

    // Subscribe to language changes
    this.langSubscription = this.languageService.language$.subscribe((lang) => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  loadUserFromLocalStorage(): void {
    this.isLoading = true;
    const savedUser = this.getLocalStorageItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        this.user = {
          userId: userData.userId,
          fullName: userData.fullName,
          thumbImageUrl: userData.thumbImageUrl,
          profileImageUrl: userData.profileImageUrl,
          gender: userData.gender,
          emailAddress: userData.emailAddress,
          mobileNumber: userData.mobileNumber,
        };
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    this.isLoading = false;
  }

  private getLocalStorageItem(key: string): string | null {
    return typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem(key)
      : null;
  }

  setActiveItem(url: string): void {
    // Reset all items
    this.sidebarItems.forEach((item) => {
      item.active = false;
    });

    // Find and set the active item
    const activeItem = this.sidebarItems.find((item) =>
      url.includes(item.route),
    );
    if (activeItem) {
      activeItem.active = true;
    }
  }

  getInitials(): string {
    return this.user ? this.user.fullName.charAt(0) : '';
  }

  getFullName(): string {
    return this.user ? this.user.fullName : '';
  }

  logout(): void {
    this.authService.logout();
  }
}
