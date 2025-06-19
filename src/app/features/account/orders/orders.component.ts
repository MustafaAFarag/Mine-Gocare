import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { OrderService } from '../../../services/order.service';
import { ClientOrders, OrderDetails } from '../../../model/Order';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoadingComponent } from '../../../shared/loading/loading.component';

type Language = 'en' | 'ar';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    OrderDetailsComponent,
    TranslateModule,
    LoadingComponent,
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  token: string | null = null;
  orders: ClientOrders[] = [];
  showOrderDetails = false;
  selectedOrderId: number | null = null;
  orderDetails: OrderDetails | null = null;
  currentLang: Language = 'en';

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  isLoading: boolean = true;

  constructor(
    private orderService: OrderService,
    private translateService: TranslateService,
  ) {
    this.currentLang = this.translateService.currentLang as Language;
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang = event.lang as Language;
    });
  }

  ngOnInit(): void {
    // Safely access localStorage in ngOnInit
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
    this.fetchClientOrders();
  }

  fetchClientOrders(): void {
    this.isLoading = true;
    if (this.token) {
      this.orderService.getClientOrders(this.token).subscribe(
        (response) => {
          this.orders = response.result.items;
          console.log('ORDERS', this.orders);
          this.totalItems = response.result.totalCount;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.isLoading = false;
        },
        (error) => {
          console.error('Error loading orders:', error);
          this.isLoading = false;
        },
      );
    } else {
      console.error('No access token available');
      this.isLoading = false;
    }
  }

  // Get current page items
  get currentPageItems(): ClientOrders[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.orders.slice(startIndex, endIndex);
  }

  // Change page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  fetchOrderDetails(orderId: number): void {
    if (this.token) {
      this.orderService.getClientOrderDetails(orderId, this.token).subscribe(
        (response) => {
          this.orderDetails = response.result;
        },
        (error) => {
          console.error('Error loading order details:', error);
        },
      );
    } else {
      console.error('No access token available');
    }
  }

  viewOrderDetails(orderId: number): void {
    this.selectedOrderId = orderId;
    this.fetchOrderDetails(orderId);
    this.showOrderDetails = true;
  }

  hideOrderDetails(): void {
    this.showOrderDetails = false;
    this.selectedOrderId = null;
    this.orderDetails = null;
  }

  cancelOrder(orderId: number): void {
    if (this.token) {
      // Show confirmation dialog
      if (confirm('Are you sure you want to cancel this order?')) {
        this.orderService
          .cancelOrder(this.token, orderId, 'Order cancelled by user')
          .subscribe(
            (response) => {
              // Refresh the orders list
              this.fetchClientOrders();
            },
            (error) => {
              console.error('Error cancelling order:', error);
              alert('Failed to cancel order. Please try again.');
            },
          );
      }
    } else {
      console.error('No access token available');
    }
  }
}
