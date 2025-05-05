import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDetails } from '../../../../model/Order';
import { LoadingComponent } from '../../../../shared/loading/loading.component';
import { getFullImageUrl } from '../../../../lib/utils';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  imports: [CommonModule, LoadingComponent, TranslateModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css',
})
export class OrderDetailsComponent implements OnInit {
  @Input() orderId: number | null = null;
  @Input() orderDetails: OrderDetails | null = null;
  @Output() backClicked = new EventEmitter<void>();

  currentLang: string = 'en';

  constructor(private translateService: TranslateService) {
    // Get initial language
    this.currentLang = this.translateService.currentLang || 'en';

    // Subscribe to language changes
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });
  }

  orderNumber: string = '#1020';
  orderDate: string = '06 Jul 2024';

  orderStatuses: OrderStatus[] = [
    { name: 'Pending', isActive: true, date: '06 Jul 2024' },
    { name: 'Processing', isActive: false },
    { name: 'Shipped', isActive: false },
    { name: 'Out For Delivery', isActive: false },
    { name: 'Delivered', isActive: false },
  ];

  getImageFullUrl = getFullImageUrl;

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
    // Set initial language
    this.currentLang = this.translateService.currentLang || 'en';
  }

  goBack(): void {
    this.backClicked.emit();
  }

  // Helper method to get the correct language suffix
  getLangSuffix(): string {
    return this.currentLang === 'ar' ? '.ar' : '.en';
  }

  // Helper methods to handle order status display
  getOrderStatuses() {
    const statuses = [
      { id: 1, name: 'Pending', isActive: false },
      { id: 2, name: 'Processing', isActive: false },
      { id: 3, name: 'Shipped', isActive: false },
      { id: 4, name: 'Delivered', isActive: false },
      { id: 5, name: 'Cancelled', isActive: false },
    ];

    if (this.orderDetails) {
      // Set active status based on orderDetails.orderStatus
      statuses.forEach((status) => {
        status.isActive = status.id === this.orderDetails?.orderStatus;
      });
    }

    return statuses;
  }

  // Format amount with currency
  formatAmount(amount: number): string {
    if (this.orderDetails && this.orderDetails.orderPayment.currency) {
      const lang = this.currentLang === 'ar' ? 'ar' : 'en';
      return `${amount} ${this.orderDetails.orderPayment.currency.name[lang]}`;
    }
    return `${amount}`;
  }
}
