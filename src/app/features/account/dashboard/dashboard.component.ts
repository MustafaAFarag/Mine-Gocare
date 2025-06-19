import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileResponse } from '../../../model/Auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../../services/wallet.service';
import { AuthService } from '../../../services/auth.service';
import { Wallet } from '../../../model/Wallet';
import { OrderService } from '../../../services/order.service';
import { LanguageService } from '../../../services/language.service';
import { Subscription, forkJoin } from 'rxjs';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, TranslateModule, LoadingComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentLang: 'en' | 'ar' = 'en';
  private langSubscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();
  token: string | null;
  ordersCount: number = 0;
  clientId: number;
  wallet!: Wallet;
  isLoading: boolean = true;
  isLoadingProfile: boolean = true;
  isLoadingWallet: boolean = true;
  isLoadingOrders: boolean = true;
  user!: UserProfileResponse;

  constructor(
    private walletService: WalletService,
    private authService: AuthService,
    private orderService: OrderService,
    private languageService: LanguageService,
    private messageService: MessageService,
    private translateService: TranslateService,
  ) {
    this.token = this.authService.getLocalStorageItem('accessToken');

    const userString = this.authService.getLocalStorageItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.clientId = user.userId;
    } else {
      console.error('User not found in localStorage');
      this.clientId = 0;
    }
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.isLoading = true;
    // Fetch all data in parallel
    this.fetchAllData();

    this.langSubscription = this.languageService.language$.subscribe((lang) => {
      this.currentLang = lang as 'en' | 'ar';
    });

    // Subscribe to user changes
    this.userSubscription = this.authService.user$.subscribe((userData) => {
      if (userData) {
        this.user = userData;
        // Update clientId if it changed
        if (userData.userId !== this.clientId) {
          this.clientId = userData.userId;
          // Refresh wallet data if clientId changed
          this.fetchWalletData();
        }
      }
    });
  }

  fetchAllData(): void {
    this.isLoadingProfile = true;
    this.isLoadingWallet = true;
    this.isLoadingOrders = true;

    // Create an array of observables
    const observables = [];

    // Add profile fetch
    observables.push(
      this.authService.getClientProfile().subscribe({
        next: (response) => {
          if (response.success && response.result) {
            this.user = response.result;
          }
          this.isLoadingProfile = false;
          this.checkAllLoadingComplete();
        },
        error: (error) => {
          console.error('Error fetching client profile:', error);
          this.isLoadingProfile = false;
          this.checkAllLoadingComplete();
        },
      }),
    );

    // Add wallet fetch if token and clientId are available
    if (this.token && this.clientId) {
      observables.push(
        this.walletService.getWallet(this.token, this.clientId).subscribe({
          next: (res) => {
            this.wallet = res.result;
            this.isLoadingWallet = false;
            this.checkAllLoadingComplete();
          },
          error: (error) => {
            console.error('Error fetching wallet:', error);
            this.isLoadingWallet = false;
            this.checkAllLoadingComplete();
          },
        }),
      );
    } else {
      this.isLoadingWallet = false;
      this.checkAllLoadingComplete();
    }

    // Add orders fetch if token is available
    if (this.token) {
      observables.push(
        this.orderService.getClientOrders(this.token).subscribe({
          next: (response) => {
            this.ordersCount = response.result.totalCount;
            this.isLoadingOrders = false;
            this.checkAllLoadingComplete();
          },
          error: (error) => {
            console.error('Error loading orders:', error);
            this.isLoadingOrders = false;
            this.checkAllLoadingComplete();
          },
        }),
      );
    } else {
      this.isLoadingOrders = false;
      this.checkAllLoadingComplete();
    }
  }

  checkAllLoadingComplete(): void {
    if (
      !this.isLoadingProfile &&
      !this.isLoadingWallet &&
      !this.isLoadingOrders
    ) {
      this.isLoading = false;
    }
  }

  updateFullName(): void {
    // Prompt for first and last name
    const firstName = prompt(
      'Enter your first name:',
      this.user.firstName || '',
    );
    const lastName = prompt('Enter your last name:', this.user.lastName || '');

    if (firstName && lastName) {
      this.authService.updateFullName(firstName, lastName).subscribe({
        next: (response) => {
          if (response.success) {
            this.user.firstName = firstName;
            this.user.lastName = lastName;
            alert('Name updated successfully');
          }
        },
        error: (error) => {
          console.error('Error updating name:', error);
          alert('Failed to update name. Please try again.');
        },
      });
    }
  }

  updateGender(): void {
    const newGender = this.user.gender === 1 ? 0 : 1; // Toggle between 0 (male) and 1 (female)

    this.authService.updateGender(newGender).subscribe({
      next: (response) => {
        if (response.success) {
          this.user.gender = newGender;
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant(
              'dashboard-account.genderUpdated',
            ),
            detail: this.translateService.instant(
              'dashboard-account.genderUpdatedSuccess',
            ),
            life: 2000,
            styleClass: 'black-text-toast',
          });
        }
      },
      error: (error) => {
        console.error('Error updating gender:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('dashboard-account.error'),
          detail: this.translateService.instant(
            'dashboard-account.genderUpdateFailed',
          ),
          life: 2000,
          styleClass: 'black-text-toast',
        });
      },
    });
  }

  updatePhone(): void {
    const phoneNumber = prompt(
      'Enter your phone number:',
      this.user.mobileNumber || '',
    );

    if (phoneNumber) {
      this.authService.updatePhoneNumber(Number(phoneNumber)).subscribe({
        next: (response) => {
          if (response.success) {
            this.user.mobileNumber = phoneNumber;
            alert('Phone number updated successfully');
          }
        },
        error: (error) => {
          console.error('Error updating phone number:', error);
          alert('Failed to update phone number. Please try again.');
        },
      });
    }
  }

  updateEmail(): void {
    const email = prompt(
      'Enter your email address:',
      this.user.emailAddress || '',
    );

    if (email) {
      this.authService.updateEmailAddress(email).subscribe({
        next: (response) => {
          if (response.success) {
            this.user.emailAddress = email;
            alert('Email address updated successfully');
          }
        },
        error: (error) => {
          console.error('Error updating email:', error);
          alert('Failed to update email. Please try again.');
        },
      });
    }
  }

  updatePassword(): void {
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;

    const newPassword = prompt('Enter your new password:');
    if (!newPassword) return;

    const confirmPassword = prompt('Confirm your new password:');
    if (!confirmPassword) return;

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    this.authService
      .changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Password updated successfully');
          }
        },
        error: (error) => {
          console.error('Error updating password:', error);
          alert('Failed to update password. Please try again.');
        },
      });
  }

  // Helper method to get full name from firstName and lastName
  getFullName(): string {
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
  }

  fetchWalletData(): void {
    if (this.token && this.clientId) {
      this.isLoadingWallet = true;
      this.walletService.getWallet(this.token, this.clientId).subscribe({
        next: (res) => {
          this.wallet = res.result;
          this.isLoadingWallet = false;
          this.checkAllLoadingComplete();
        },
        error: (error) => {
          console.error('Error fetching wallet:', error);
          this.isLoadingWallet = false;
          this.checkAllLoadingComplete();
        },
      });
    }
  }
}
