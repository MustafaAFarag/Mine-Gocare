import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletService } from '../../../services/wallet.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WalletTransactionList } from '../../../model/Wallet';

type Language = 'en' | 'ar';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, LoadingComponent, TranslateModule],
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
})
export class WalletComponent implements OnInit {
  token: string | null;
  clientId: number;
  walletBalance: number = 0;
  transactions: WalletTransactionList[] = [];
  isLoading: boolean = true;
  isPaginationLoading: boolean = false;
  currentLang: Language = 'en';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  constructor(
    private walletService: WalletService,
    private translateService: TranslateService,
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

    this.currentLang = this.translateService.currentLang as Language;
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang = event.lang as Language;
    });
  }

  ngOnInit(): void {
    this.fetchClientWalletAPI();
    this.fetchClientWalletTransactionAPI();
  }

  fetchClientWalletAPI() {
    if (this.token && this.clientId) {
      this.walletService.getWallet(this.token, this.clientId, 224).subscribe({
        next: (res) => {
          console.log('WALLET', res.result);
          if (res.result) {
            this.walletBalance = res.result.walletAmount || 0;
          }
        },
        error: (err) => {
          console.error('Error fetching wallet:', err);
          this.isLoading = false;
        },
      });
    } else {
      console.error('Missing token or clientId');
      this.isLoading = false;
    }
  }

  fetchClientWalletTransactionAPI() {
    if (this.token) {
      this.isPaginationLoading = true;
      this.walletService
        .getWalletTransactionList(this.token, this.currentPage, this.pageSize)
        .subscribe({
          next: (res) => {
            this.transactions = res.result.items;
            this.totalPages = Math.ceil(res.result.totalCount / this.pageSize);
            this.isLoading = false;
            this.isPaginationLoading = false;
          },
          error: (err) => {
            console.error('Error fetching transactions:', err);
            this.isLoading = false;
            this.isPaginationLoading = false;
          },
        });
    } else {
      console.error('Missing token');
      this.isLoading = false;
      this.isPaginationLoading = false;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1 && !this.isPaginationLoading) {
      this.currentPage--;
      this.fetchClientWalletTransactionAPI();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages && !this.isPaginationLoading) {
      this.currentPage++;
      this.fetchClientWalletTransactionAPI();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && !this.isPaginationLoading) {
      this.currentPage = page;
      this.fetchClientWalletTransactionAPI();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
