import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDetails } from '../../../../model/Order';
import { LoadingComponent } from '../../../../shared/loading/loading.component';
import { getFullImageUrl } from '../../../../lib/utils';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OrderService } from '../../../../services/order.service';
import { ConfirmationModalComponent } from '../../../../components/confirmation-modal/confirmation-modal.component';
import { Subscription } from 'rxjs';

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
  id: number;
  name: string;
  icon: string;
  isActive: boolean;
  date?: string;
}

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    TranslateModule,
    ConfirmationModalComponent,
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css',
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  @Input() orderId: number | null = null;
  @Input() orderDetails: OrderDetails | null = null;
  @Output() backClicked = new EventEmitter<void>();

  currentLang: string = 'en';

  // Confirmation modal properties
  showConfirmationModal = false;

  private languageSubscription?: Subscription;

  constructor(
    private translateService: TranslateService,
    private orderService: OrderService,
  ) {
    this.currentLang = this.translateService.currentLang || 'en';
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });
  }

  orderNumber: string = '#1020';
  orderDate: string = '06 Jul 2024';

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
    this.currentLang = this.translateService.currentLang || 'en';

    // Subscribe to language changes to reset modal state
    this.languageSubscription = this.translateService.onLangChange.subscribe(
      () => {
        this.currentLang = this.translateService.currentLang || 'en';
        // Reset modal state when language changes to prevent issues
        this.showConfirmationModal = false;
      },
    );
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  goBack(): void {
    this.backClicked.emit();
  }

  getOrderStatuses(): OrderStatus[] {
    const statuses: OrderStatus[] = [
      {
        id: 1,
        name: 'New Order',
        icon: 'ri-shopping-cart-line',
        isActive: false,
      },
      {
        id: 2,
        name: 'Pending Order',
        icon: 'ri-time-line',
        isActive: false,
      },
      {
        id: 3,
        name: 'Confirmed Order',
        icon: 'ri-checkbox-circle-line',
        isActive: false,
      },
      {
        id: 4,
        name: 'Pending Shipping Company',
        icon: 'ri-truck-line',
        isActive: false,
      },
      {
        id: 5,
        name: 'Delivery in Progress',
        icon: 'ri-truck-fill',
        isActive: false,
      },
      {
        id: 6,
        name: 'Delivered',
        icon: 'ri-check-double-line',
        isActive: false,
      },
    ];

    if (this.orderDetails) {
      statuses.forEach((status) => {
        status.isActive = status.id === this.orderDetails?.orderStatus;
      });
    }

    return statuses;
  }

  getStatusClasses(status: OrderStatus, index: number): string {
    if (!this.orderDetails) return 'bg-gray-50 text-gray-400';

    // If order is cancelled, return cancelled style
    if (this.orderDetails.orderStatus === 7) {
      return 'bg-red-50 text-red-600';
    }

    const currentStatusIndex = (this.orderDetails.orderStatus || 0) - 1;

    // If order is delivered, all previous and current statuses should be green
    if (this.orderDetails.orderStatus === 6) {
      if (index <= currentStatusIndex) {
        return 'bg-green-50 text-green-600';
      }
      return 'bg-gray-50 text-gray-400';
    }

    // Normal flow
    if (index < currentStatusIndex) {
      return 'bg-green-50 text-green-600'; // Completed statuses
    } else if (index === currentStatusIndex) {
      return 'bg-orange-50 text-orange-600'; // Current status
    } else {
      return 'bg-gray-50 text-gray-400'; // Upcoming statuses
    }
  }

  getStatusIndicatorClasses(status: OrderStatus, index: number): string {
    if (!this.orderDetails) return 'bg-gray-200';

    // If order is cancelled, return cancelled style
    if (this.orderDetails.orderStatus === 7) {
      return 'bg-red-500';
    }

    const currentStatusIndex = (this.orderDetails.orderStatus || 0) - 1;

    // If order is delivered, all previous and current statuses should be green
    if (this.orderDetails.orderStatus === 6) {
      if (index <= currentStatusIndex) {
        return 'bg-green-500';
      }
      return 'bg-gray-200';
    }

    // Normal flow
    if (index < currentStatusIndex) {
      return 'bg-green-500'; // Completed statuses
    } else if (index === currentStatusIndex) {
      return 'bg-orange-500'; // Current status
    } else {
      return 'bg-gray-200'; // Upcoming statuses
    }
  }

  getCurrentStatus(): OrderStatus | undefined {
    if (!this.orderDetails) return undefined;
    return this.getOrderStatuses().find(
      (s) => s.id === this.orderDetails?.orderStatus,
    );
  }

  getPaymentMethodIcon(method: number): string {
    switch (method) {
      case 1:
        return 'ri-money-dollar-circle-line';
      case 2:
        return 'ri-bank-card-line';
      case 3:
        return 'ri-wallet-3-line';
      case 4:
        return 'ri-coins-line';
      default:
        return 'ri-question-line';
    }
  }

  getPaymentMethodColor(method: number): string {
    switch (method) {
      case 1:
        return 'bg-green-100 text-green-600';
      case 2:
        return 'bg-blue-100 text-blue-600';
      case 3:
        return 'bg-purple-100 text-purple-600';
      case 4:
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  formatAmount(amount: number): string {
    if (this.orderDetails && this.orderDetails.orderPayment.currency) {
      const lang = this.currentLang === 'ar' ? 'ar' : 'en';
      return `${amount} ${this.orderDetails.orderPayment.currency.name[lang]}`;
    }
    return `${amount}`;
  }

  canCancelOrder(): boolean {
    if (!this.orderDetails) return false;
    return (
      this.orderDetails.orderStatus === 1 ||
      (this.orderDetails.orderStatus === 2 && !this.orderDetails.canReturn)
    );
  }

  cancelOrder(): void {
    this.showConfirmationModal = true;
  }

  onConfirmCancel(): void {
    if (!this.orderId) return;

    const token = localStorage.getItem('accessToken');
    if (token) {
      this.orderService
        .cancelOrder(token, this.orderId, 'Order cancelled by user')
        .subscribe(
          (response) => {
            // Refresh the order details
            this.orderService
              .getClientOrderDetails(this.orderId!, token)
              .subscribe(
                (response) => {
                  this.orderDetails = response.result;
                },
                (error) => {
                  console.error('Error refreshing order details:', error);
                },
              );
          },
          (error) => {
            console.error('Error cancelling order:', error);
            alert('Failed to cancel order. Please try again.');
          },
        );
    }
  }

  onCancelConfirmation(): void {
    // User cancelled the confirmation, do nothing
  }
}
