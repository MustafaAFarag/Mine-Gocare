import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { OrderService } from '../../../services/order.service';
import { ClientOrders, OrderDetails } from '../../../model/Order';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type Language = 'en' | 'ar';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, OrderDetailsComponent, TranslateModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  token = localStorage.getItem('accessToken');
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
    this.fetchClientOrders();
  }

  fetchClientOrders(): void {
    if (this.token) {
      this.orderService.getClientOrders(this.token).subscribe(
        (response) => {
          this.orders = response.result.items;
          this.totalItems = response.result.totalCount;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          console.log('Orders loaded:', this.orders);
          console.log('Total items:', this.totalItems);
          console.log('Total pages:', this.totalPages);
        },
        (error) => {
          console.error('Error loading orders:', error);
        },
      );
    } else {
      console.error('No access token available');
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
          console.log('Order details loaded:', response.result);
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
    console.log('View order details for order ID:', orderId);
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
              console.log('Order cancelled successfully:', response);
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
