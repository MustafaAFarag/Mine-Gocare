import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  amount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent {
  orders: Order[] = [
    {
      id: 1,
      orderNumber: '#1020',
      date: '06 Jul 2024 01:21:PM',
      amount: 61.73,
      paymentStatus: 'pending',
      paymentMethod: 'COD',
    },
    {
      id: 2,
      orderNumber: '#1017',
      date: '06 Jul 2024 12:45:PM',
      amount: 1.97,
      paymentStatus: 'pending',
      paymentMethod: 'COD',
    },
    {
      id: 3,
      orderNumber: '#1016',
      date: '26 Jun 2024 07:53:AM',
      amount: 46.14,
      paymentStatus: 'pending',
      paymentMethod: 'COD',
    },
    {
      id: 4,
      orderNumber: '#1015',
      date: '25 Jun 2024 04:04:PM',
      amount: 18.75,
      paymentStatus: 'pending',
      paymentMethod: 'COD',
    },
    {
      id: 5,
      orderNumber: '#1013',
      date: '24 Jun 2024 11:59:AM',
      amount: 1.72,
      paymentStatus: 'pending',
      paymentMethod: 'COD',
    },
    {
      id: 6,
      orderNumber: '#1012',
      date: '21 Jun 2024 02:48:PM',
      amount: 6.23,
      paymentStatus: 'pending',
      paymentMethod: 'COD',
    },
    {
      id: 7,
      orderNumber: '#1011',
      date: '21 Jun 2024 02:48:PM',
      amount: 39.72,
      paymentStatus: 'pending',
      paymentMethod: 'COD',
    },
    {
      id: 8,
      orderNumber: '#1010',
      date: '21 Jun 2024 01:59:PM',
      amount: 3.76,
      paymentStatus: 'pending',
      paymentMethod: 'COD',
    },
    {
      id: 9,
      orderNumber: '#1009',
      date: '21 Jun 2024 01:27:PM',
      amount: 1.52,
      paymentStatus: 'pending',
      paymentMethod: 'COD',
    },
    {
      id: 10,
      orderNumber: '#1006',
      date: '21 Jun 2024 01:18:PM',
      amount: 5.49,
      paymentStatus: 'pending',
      paymentMethod: 'COD',
    },
  ];

  viewOrderDetails(orderId: number): void {
    console.log('View order details for order ID:', orderId);
    // This would typically navigate to an order details page
  }
}
