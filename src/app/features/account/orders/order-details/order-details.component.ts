import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string;
  refundStatus: string;
}

interface OrderStatus {
  name: string;
  isActive: boolean;
  date?: string;
}
@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css',
})
export class OrderDetailsComponent implements OnInit {
  @Input() orderId: number | null = null;
  @Output() backClicked = new EventEmitter<void>();

  orderNumber: string = '#1020';
  orderDate: string = '06 Jul 2024';

  orderStatuses: OrderStatus[] = [
    { name: 'Pending', isActive: true, date: '06 Jul 2024' },
    { name: 'Processing', isActive: false },
    { name: 'Shipped', isActive: false },
    { name: 'Out For Delivery', isActive: false },
    { name: 'Delivered', isActive: false },
  ];

  orderItems: OrderItem[] = [
    {
      id: 1,
      name: 'Stripped Bodycon Dress',
      price: 11.76,
      quantity: 5,
      subtotal: 58.8,
      image: '/assets/images/stripped-dress.jpg',
      refundStatus: 'Non Refundable',
    },
  ];

  billingAddress = {
    street: '26, Starts Hollow Colony',
    city: 'Denver',
    state: 'Colorado',
    country: 'United States',
    zipCode: '80014',
    phone: '+1 5551855359',
  };

  shippingAddress = {
    street: '538, Claire New Street',
    city: 'San Jose',
    state: 'Colorado',
    country: 'United States',
    zipCode: '94088',
    phone: '+1 5551855359',
  };

  deliverySlot: string = 'Express Delivery/Schedule';
  paymentMode: string = 'COD';
  paymentStatus: string = 'PENDING';

  orderSummary = {
    subtotal: 58.8,
    shipping: 0.0,
    tax: 2.94,
    total: 61.73,
  };

  ngOnInit(): void {
    console.log('Order details loaded for order ID:', this.orderId);
    // Here you would typically load the order details based on orderId
    // For now we'll use the mock data
  }

  goBack(): void {
    this.backClicked.emit();
  }
}
