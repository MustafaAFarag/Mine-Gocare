import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserProfileResponse } from '../../../model/Auth';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

interface SidebarItem {
  name: string;
  nameKey: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar-tab',
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './sidebar-tab.component.html',
  styleUrl: './sidebar-tab.component.css',
})
export class SidebarTabComponent implements OnInit, OnDestroy {
  user!: UserProfileResponse;
  private langSubscription!: Subscription;
  private userProfileSubscription!: Subscription;
  currentLang: string = 'en';
  isLoading: boolean = true;
  isUpdatingEmail: boolean = false;
  emailInput: string = '';
  showEmailInput: boolean = false;

  sidebarItems: SidebarItem[] = [
    {
      name: 'Dashboard',
      nameKey: 'account.sidebar.dashboard',
      icon: 'ri-dashboard-line',
      route: '/account/dashboard',
      active: false,
    },

    {
      name: 'Points',
      nameKey: 'account.sidebar.points',
      icon: 'ri-coins-line',
      route: '/account/points',
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

    // Fetch user profile
    this.fetchUserProfile();

    // Subscribe to user profile changes
    this.userProfileSubscription = this.authService.user$.subscribe(
      (profile: UserProfileResponse | null) => {
        if (profile) {
          this.user = profile;
        }
      },
    );

    // Subscribe to router events to update active state when route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.setActiveItem(event.url);
      });

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
    if (this.userProfileSubscription) {
      this.userProfileSubscription.unsubscribe();
    }
  }

  fetchUserProfile(): void {
    this.isLoading = true;
    this.authService.getClientProfile().subscribe({
      next: (res) => {
        if (res.result) {
          this.user = res.result;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
        this.isLoading = false;
      },
    });
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
    return this.user ? this.user.firstName.charAt(0) : '';
  }

  getFullName(): string {
    return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
  }

  logout(): void {
    this.authService.logout();
  }

  hasEmailAddress(): boolean {
    return this.user && !!this.user.emailAddress;
  }

  addEmail(): void {
    this.showEmailInput = true;
  }

  updateEmail(): void {
    if (!this.emailInput) return;

    this.isUpdatingEmail = true;
    this.authService.updateEmailAddress(this.emailInput).subscribe({
      next: (res) => {
        if (res.success) {
          this.showEmailInput = false;
          this.emailInput = '';
        }
        this.isUpdatingEmail = false;
      },
      error: (error) => {
        console.error('Error updating email:', error);
        this.isUpdatingEmail = false;
      },
    });
  }

  cancelEmailUpdate(): void {
    this.showEmailInput = false;
    this.emailInput = '';
  }
}
