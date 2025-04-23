import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../../model/Auth';
import { TranslateModule } from '@ngx-translate/core';
import { WalletService } from '../../../services/wallet.service';
import { AuthService } from '../../../services/auth.service';
import { Wallet } from '../../../model/Wallet';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  token: string | null;
  clientId: number;
  walletAmount: number = 0;
  user: UserProfile = {
    userId: 0,
    fullName: '',
    thumbImageUrl: '',
    profileImageUrl: '',
    gender: 0,
    emailAddress: '',
    mobileNumber: '',
  };

  constructor(
    private walletService: WalletService,
    private authService: AuthService,
  ) {
    this.token = localStorage.getItem('accessToken');

    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.clientId = user.userId;
    } else {
      console.error('User not found in localStorage');
      this.clientId = 0;
    }
  }

  ngOnInit(): void {
    this.loadUserFromLocalStorage();
    this.fetchClientProfile();
    this.fetchClientWalletAPI();
  }

  loadUserFromLocalStorage(): void {
    const savedUser = this.getLocalStorageItem('user');
    if (savedUser) {
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
    }
  }

  fetchClientProfile(): void {
    this.authService.getClientProfile().subscribe({
      next: (response) => {
        if (response.success && response.result) {
          // Update user data with latest from server
          this.user = {
            ...this.user,
            ...response.result,
          };
        }
      },
      error: (error) => {
        console.error('Error fetching client profile:', error);
      },
    });
  }

  fetchClientWalletAPI() {
    if (this.token && this.clientId) {
      this.walletService
        .getWallet(this.token, this.clientId, 224)
        .subscribe((res) => {
          this.walletAmount = res.result.walletAmount;
        });
    } else {
      console.error('Missing token or clientId');
    }
  }

  updateFullName(): void {
    // Prompt for first and last name
    const fullName = this.user.fullName || '';
    const nameParts = fullName.split(' ');
    const firstName = prompt('Enter your first name:', nameParts[0] || '');
    const lastName = prompt(
      'Enter your last name:',
      nameParts.slice(1).join(' ') || '',
    );

    if (firstName && lastName) {
      this.authService.updateFullName(firstName, lastName).subscribe({
        next: (response) => {
          if (response.success) {
            this.user.fullName = `${firstName} ${lastName}`;
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
    const newGender = this.user.gender === 1 ? 2 : 1; // Toggle between 1 (male) and 2 (female)

    this.authService.updateGender(newGender).subscribe({
      next: (response) => {
        if (response.success) {
          this.user.gender = newGender;
          alert('Gender updated successfully');
        }
      },
      error: (error) => {
        console.error('Error updating gender:', error);
        alert('Failed to update gender. Please try again.');
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

  private getLocalStorageItem(key: string): string | null {
    return typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem(key)
      : null;
  }
}
