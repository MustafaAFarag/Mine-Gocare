import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OrderService } from '../../../services/order.service';
import { ClientOrders } from '../../../model/Order';
import { Router } from '@angular/router';

type Language = 'en' | 'ar';

@Component({
  selector: 'app-refund',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './refund.component.html',
  styleUrls: ['./refund.component.css'],
})
export class RefundComponent implements OnInit {
  token = localStorage.getItem('accessToken');
  orders: ClientOrders[] = [];
  currentLang: Language = 'en';

  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private orderService: OrderService,
    private translateService: TranslateService,
  ) {
    this.currentLang = this.translateService.currentLang as Language;

    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang = event.lang as Language;
    });
  }

  ngOnInit() {
    this.fetchClientOrders();
  }

  fetchClientOrders(): void {
    if (this.token) {
      this.orderService.getClientOrders(this.token).subscribe(
        (response) => {
          this.orders = response.result.items.filter(
            (order: ClientOrders) => order.isCanceled === true,
          );
        },
        (error) => {
          console.error('Error loading orders:', error);
        },
      );
    } else {
      console.error('No access token available');
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  getStatusClass(status: string): string {
    return 'bg-red-100 text-red-600';
  }

  getStatusText(status: number): string {
    return 'Canceled';
  }
}
