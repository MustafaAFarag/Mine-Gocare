import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { OrderService } from '../../../services/order.service';
import { ClientOrders } from '../../../model/Order';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, OrderDetailsComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  token = localStorage.getItem('accessToken');
  orders: ClientOrders[] = [];
  showOrderDetails = false;
  selectedOrderId: number | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    if (this.token) {
      this.orderService.getClientOrders(this.token).subscribe(
        (response) => {
          this.orders = response.result.items;
          console.log('Orders loaded:', this.orders);
        },
        (error) => {
          console.error('Error loading orders:', error);
        },
      );
    } else {
      console.error('No access token available');
    }
  }

  viewOrderDetails(orderId: number): void {
    this.selectedOrderId = orderId;
    this.showOrderDetails = true;
    console.log('View order details for order ID:', orderId);
  }

  hideOrderDetails(): void {
    this.showOrderDetails = false;
    this.selectedOrderId = null;
  }
}
