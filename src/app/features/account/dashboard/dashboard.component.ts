import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../../model/Auth';
import { TranslateModule } from '@ngx-translate/core';
import { WalletService } from '../../../services/wallet.service';
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

  constructor(private walletService: WalletService) {
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

  private getLocalStorageItem(key: string): string | null {
    return typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem(key)
      : null;
  }
}
