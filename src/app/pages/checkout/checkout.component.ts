import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Address, PromoCode } from './models/checkout.models';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

// Import sub-components
import { ShippingAddressComponent } from '../../components/shipping-address/shipping-address.component';
import { DeliveryOptionsComponent } from '../../components/delivery-options/delivery-options.component';
import { PaymentOptionsComponent } from '../../components/payment-options/payment-options.component';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary.component';
import { BillingSummaryComponent } from '../../components/billing-summary/billing-summary.component';

// Import cart service
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../model/Cart';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ShippingAddressComponent,
    DeliveryOptionsComponent,
    PaymentOptionsComponent,
    OrderSummaryComponent,
    BillingSummaryComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private cartSubscription: Subscription = new Subscription();
  private langSubscription: Subscription = new Subscription();
  currentLang: string = 'en';

  couponForm: FormGroup;

  // Delivery options
  deliveryOption: 'standard' | 'express' = 'standard';
  timeSlots: { id: string; time: { en: string; ar: string } }[] = [
    {
      id: 'morning',
      time: {
        en: '8:00 AM - 12:00 PM',
        ar: '٨:٠٠ ص - ١٢:٠٠ م',
      },
    },
    {
      id: 'lunch',
      time: {
        en: '12:00 PM - 02:00 PM',
        ar: '١٢:٠٠ م - ٢:٠٠ م',
      },
    },
    {
      id: 'afternoon',
      time: {
        en: '02:00 PM - 05:00 PM',
        ar: '٢:٠٠ م - ٥:٠٠ م',
      },
    },
    {
      id: 'evening',
      time: {
        en: '05:00 PM - 08:00 PM',
        ar: '٥:٠٠ م - ٨:٠٠ م',
      },
    },
  ];
  selectedTimeSlot: string | null = null;

  // Payment methods
  paymentMethod: 'cod' | 'paypal' | 'stripe' | 'paytabs' = 'cod';

  shippingAddresses: Address[] = [
    {
      id: 1,
      type: 'new-home',
      label: 'New Home',
      street: '26, Starts Hollow Colony',
      city: 'Denver',
      state: 'Colorado',
      country: 'United States',
      zipCode: '80014',
      phone: '+1 5551855359',
      isSelected: true,
    },
    {
      id: 2,
      type: 'old-home',
      label: 'Old Home',
      street: '538, Claire New Street',
      city: 'San Jose',
      state: 'Colorado',
      country: 'United States',
      zipCode: '94088',
      phone: '+1 5551855359',
      isSelected: false,
    },
    {
      id: 3,
      type: 'office',
      label: 'Office',
      street: '218, Row New Street',
      city: 'San Jose',
      state: 'California',
      country: 'United States',
      zipCode: '94088',
      phone: '+1 5518655359',
      isSelected: false,
    },
  ];

  billingAddresses: Address[] = [
    {
      id: 1,
      type: 'new-home',
      label: 'New Home',
      street: '26, Starts Hollow Colony',
      city: 'Denver',
      state: 'Colorado',
      country: 'United States',
      zipCode: '80014',
      phone: '+1 5551855359',
      isSelected: true,
    },
    {
      id: 2,
      type: 'old-home',
      label: 'Old Home',
      street: '538, Claire New Street',
      city: 'San Jose',
      state: 'Colorado',
      country: 'United States',
      zipCode: '94088',
      phone: '+1 5551855359',
      isSelected: false,
    },
    {
      id: 3,
      type: 'office',
      label: 'Office',
      street: '218, Row New Street',
      city: 'San Jose',
      state: 'California',
      country: 'United States',
      zipCode: '94088',
      phone: '+1 5518655359',
      isSelected: false,
    },
  ];

  cartItems: CartItem[] = [];
  subTotal: number = 0;

  promoCodes: PromoCode[] = [
    {
      code: '#HOLIDAY40',
      description: 'Holiday Savings',
    },
    {
      code: '#FREESHIP50',
      description: 'Free Shipping',
    },
  ];

  shipping: number = 0.0;
  tax: number = 0;
  points: number = 65.66;
  walletBalance: number = 8.47;
  total: number = 0;

  usePoints: boolean = false;
  useWallet: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private languageService: LanguageService,
  ) {
    this.couponForm = this.fb.group({
      couponCode: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.langSubscription = this.languageService.language$.subscribe((lang) => {
      this.currentLang = lang;
    });

    // Subscribe to cart changes
    this.cartSubscription = this.cartService.cart$.subscribe((cart) => {
      this.subTotal = cart.total;

      // Transform cart items to match our CartItem interface
      this.cartItems = cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        afterPrice: item.afterPrice,
        beforePrice: item.beforePrice,
        quantity: item.quantity,
        image: item.image,
      }));

      // Calculate tax (5% of subtotal)
      this.tax = this.subTotal * 0.05;

      this.updateTotal();

      // If cart is empty, we might want to redirect to cart page
      if (this.cartItems.length === 0) {
        console.log('Cart is empty');
        // Uncomment below to redirect when implementing:
        // this.router.navigate(['/cart']);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  selectShippingAddress(id: number): void {
    this.shippingAddresses.forEach((address) => {
      address.isSelected = address.id === id;
    });
  }

  selectBillingAddress(id: number): void {
    this.billingAddresses.forEach((address) => {
      address.isSelected = address.id === id;
    });
  }

  selectDeliveryOption(option: 'standard' | 'express'): void {
    this.deliveryOption = option;

    if (option !== 'express') {
      this.selectedTimeSlot = null;
    }

    this.shipping = option === 'standard' ? 0.0 : 5.99;
    this.updateTotal();
  }

  selectTimeSlot(slotId: string): void {
    this.selectedTimeSlot = slotId;
  }

  selectPaymentMethod(method: 'cod' | 'paypal' | 'stripe' | 'paytabs'): void {
    this.paymentMethod = method;
  }

  addNewShippingAddress(): void {
    console.log('Add new shipping address');
    // This would typically open a modal or navigate to an add address form
  }

  addNewBillingAddress(): void {
    console.log('Add new billing address');
    // This would typically open a modal or navigate to an add address form
  }

  copyPromoCode(code: string): void {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        console.log('Code copied to clipboard:', code);
        // You could show a toast notification here
      })
      .catch((err) => {
        console.error('Failed to copy code:', err);
      });
  }

  applyCoupon(couponCode: string): void {
    console.log('Applying coupon:', couponCode);
    // Logic to apply the coupon would go here
  }

  toggleUsePoints(): void {
    this.usePoints = !this.usePoints;
    this.updateTotal();
  }

  toggleUseWallet(): void {
    this.useWallet = !this.useWallet;
    this.updateTotal();
  }

  updateTotal(): void {
    let calculatedTotal = this.subTotal + this.shipping + this.tax;

    if (this.usePoints) {
      calculatedTotal -= this.points;
    }

    if (this.useWallet) {
      calculatedTotal -= this.walletBalance;
    }

    // Ensure total doesn't go below zero
    this.total = Math.max(0, calculatedTotal);
  }

  placeOrder(): void {
    console.log('Placing order...');
    console.log('Delivery option:', this.deliveryOption);
    if (this.deliveryOption === 'express' && this.selectedTimeSlot) {
      // Find the selected time slot object
      const selectedSlot = this.timeSlots.find(
        (slot) => slot.id === this.selectedTimeSlot,
      );
      if (selectedSlot) {
        console.log(
          'Time slot:',
          selectedSlot.time[this.currentLang as keyof typeof selectedSlot.time],
        );
      }
    }
    console.log('Payment method:', this.paymentMethod);

    // Clear cart after order is placed
    this.cartService.clearCart();

    // Order submission logic would go here
  }
}
