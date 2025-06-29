import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserProfileResponse } from '../../../model/Auth';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { getFullImageUrl } from '../../../lib/utils';
import { LogoutConfirmModalComponent } from '../../../components/logout-confirm-modal/logout-confirm-modal.component';

interface SidebarItem {
  name: string;
  nameKey: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar-tab',
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    LogoutConfirmModalComponent,
  ],
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
  logoutConfirmVisible: boolean = false;
  isUploadingImage: boolean = false;
  defaultProfileImage =
    'https://gocare-back-testing.salonspace1.com/Attachments/Static/Profile_Images/DefaultUserImage.png';

  sidebarItems: SidebarItem[] = [
    {
      name: 'My Details',
      nameKey: 'account.sidebar.myDetails',
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
      name: 'Shipping Address',
      nameKey: 'account.sidebar.shippingAddress',
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
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Set initial active state based on current URL
    this.setActiveItem(this.router.url);

    // Subscribe to user profile changes
    this.userProfileSubscription = this.authService.user$.subscribe(
      (profile: UserProfileResponse | null) => {
        if (profile) {
          this.user = profile;
          this.isLoading = false;
        } else {
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
    const initials = this.user ? this.user.firstName?.charAt(0) : '';
    return initials;
  }

  getFullName(): string {
    const fullName = this.user
      ? `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim()
      : '';
    return fullName;
  }

  logout(): void {
    this.authService.logout();
  }

  hasEmailAddress(): boolean {
    const hasEmail = this.user && !!this.user.emailAddress;
    return hasEmail;
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

  getFullImageUrl = getFullImageUrl;

  getProfileImageUrl(): string {
    if (this.user?.profileImageUrl) {
      return this.getFullImageUrl(this.user.profileImageUrl);
    }
    return this.defaultProfileImage;
  }

  showLogoutConfirm() {
    this.logoutConfirmVisible = true;
  }

  onLogoutConfirm() {
    this.logout();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        console.error('File size should be less than 5MB');
        return;
      }

      this.uploadProfileImage(file);
    }
  }

  uploadProfileImage(file: File): void {
    this.isUploadingImage = true;
    this.authService.uploadProfileImage(file).subscribe({
      next: (res) => {
        if (res.success && res.result?.url) {
          this.updateProfileImage(res.result.url);
        } else {
          console.error('Failed to upload image:', res.error?.message);
          this.isUploadingImage = false;
        }
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.isUploadingImage = false;
      },
    });
  }

  updateProfileImage(imageUrl: string): void {
    this.authService.updateProfileImage(imageUrl).subscribe({
      next: () => {
        this.isUploadingImage = false;
      },
      error: (error) => {
        console.error('Error updating profile image:', error);
        this.isUploadingImage = false;
      },
    });
  }
}
