import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletService } from '../../../services/wallet.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { TranslateModule } from '@ngx-translate/core';

interface Transaction {
  id: number;
  date: string;
  amount: number;
  remark: string;
  status: 'debit' | 'credit';
  orderId?: string;
}

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
  transactions: Transaction[] = [];
  isLoading: boolean = true;

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
      this.walletService.getWalletTransactionList(this.token).subscribe({
        next: (res) => {
          console.log('Wallet Transaction History:', res.result);
          this.isLoading = false;

          if (res.result && Array.isArray(res.result.items)) {
            // Transform API data to match our Transaction interface
            this.transactions = res.result.items.map((item: any) => {
              return {
                id: item.id || 0,
                date: new Date(item.transactionDate).toLocaleString(),
                amount: item.amount || 0,
                remark: item.remark || '',
                status: item.transactionType === 1 ? 'credit' : 'debit',
                orderId: item.orderId,
              };
            });
          }
        },
        error: (err) => {
          console.error('Error fetching transactions:', err);
          this.isLoading = false;
        },
      });
    } else {
      console.error('Missing token');
      this.isLoading = false;
    }
  }

  // Fallback data in case API doesn't work during development
  private fallbackTransactions: Transaction[] = [
    {
      id: 1,
      date: '06 Jul 2024 12:45:PM',
      amount: 39.4,
      remark: 'Wallet amount successfully debited for Order #1017',
      status: 'debit',
      orderId: '1017',
    },
    {
      id: 2,
      date: '25 Jun 2024 04:04:PM',
      amount: 375.0,
      remark: 'Wallet amount successfully debited for Order #1015',
      status: 'debit',
      orderId: '1015',
    },
    {
      id: 3,
      date: '24 Jun 2024 11:59:AM',
      amount: 34.44,
      remark: 'Wallet amount successfully debited for Order #1013',
      status: 'debit',
      orderId: '1013',
    },
    {
      id: 4,
      date: '21 Jun 2024 01:59:PM',
      amount: 75.21,
      remark: 'Wallet amount successfully debited for Order #1010',
      status: 'debit',
      orderId: '1010',
    },
    {
      id: 5,
      date: '21 Jun 2024 01:27:PM',
      amount: 30.52,
      remark: 'Wallet amount successfully debited for Order #1009',
      status: 'debit',
      orderId: '1009',
    },
    {
      id: 6,
      date: '21 Jun 2024 01:18:PM',
      amount: 109.97,
      remark: 'Wallet amount successfully debited for Order #1006',
      status: 'debit',
      orderId: '1006',
    },
    {
      id: 7,
      date: '21 Jun 2024 01:12:PM',
      amount: 323.0,
      remark: 'Admin has credited the balance.',
      status: 'credit',
    },
  ];
}
