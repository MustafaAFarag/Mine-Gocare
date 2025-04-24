import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Address } from './models/checkout.models';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

// Import services
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { CreateAddress } from '../../model/Address';

// Import sub-components
import { ShippingAddressComponent } from '../../components/shipping-address/shipping-address.component';
import { DeliveryOptionsComponent } from '../../components/delivery-options/delivery-options.component';
import { PaymentOptionsComponent } from '../../components/payment-options/payment-options.component';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary.component';
import { BillingSummaryComponent } from '../../components/billing-summary/billing-summary.component';
import { AddressFormModalComponent } from '../../components/address-form-modal/address-form-modal.component';

// Import models
import { CartItem } from '../../model/Cart';
import { Router } from '@angular/router';

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
    AddressFormModalComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private cartSubscription: Subscription = new Subscription();
  private langSubscription: Subscription = new Subscription();
  currentLang: string = 'en';

  // Address Form Modal
  showAddressFormModal = false;

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
  paymentMethod: 'cod' | 'paytabs' = 'cod';

  shippingAddresses: Address[] = [];
  billingAddresses: Address[] = [];

  cartItems: CartItem[] = [];
  subTotal: number = 0;

  shipping: number = 0.0;
  tax: number = 0;
  total: number = 0;

  // Loading state
  isPlacingOrder: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private languageService: LanguageService,
    private authService: AuthService,
    private addressService: AddressService,
    private orderService: OrderService,
    private router: Router,
  ) {}

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
        // Redirect to cart page
        this.router.navigate(['/cart']);
      }
    });

    // Fetch client addresses
    this.fetchClientAddresses();
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

  fetchClientAddresses(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.addressService.getClientAddresses(token).subscribe({
        next: (response) => {
          if (response.success && response.result) {
            // Transform API addresses to match our Address model format
            this.transformAddresses(response.result);
          }
        },
        error: (error) => {
          console.error('Error fetching addresses:', error);
        },
      });
    }
  }

  transformAddresses(apiAddresses: any[]): void {
    // Clear existing addresses
    this.shippingAddresses = [];
    this.billingAddresses = [];

    if (apiAddresses && apiAddresses.length > 0) {
      // Convert API addresses to our Address format and set the first one as selected
      const transformedAddresses = apiAddresses.map((addr, index) => {
        return {
          id: addr.id,
          type: addr.type,
          label: this.getAddressTypeLabel(addr.type),
          street: addr.address,
          city: addr.city?.name?.[this.currentLang] || '',
          state: addr.district?.name?.[this.currentLang] || '',
          country: addr.country?.name?.[this.currentLang] || '',
          zipCode: '',
          phone: addr.phoneNumber,
          isSelected: index === 0,
        } as Address;
      });

      this.shippingAddresses = [...transformedAddresses];
      this.billingAddresses = [...transformedAddresses];
    }
  }

  getAddressTypeLabel(type: number): string {
    switch (type) {
      case 1:
        return 'Home';
      case 2:
        return 'Work';
      case 3:
        return 'Other';
      default:
        return 'Address';
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

  selectPaymentMethod(method: 'cod' | 'paytabs'): void {
    this.paymentMethod = method;
  }

  addNewShippingAddress(): void {
    this.showAddressFormModal = true;
  }

  addNewBillingAddress(): void {
    this.showAddressFormModal = true;
  }

  onCloseAddressModal(): void {
    this.showAddressFormModal = false;
  }

  onSaveAddress(addressData: CreateAddress): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.addressService.createAddress(token, addressData).subscribe({
        next: (response) => {
          if (response.success) {
            // Refresh addresses
            this.fetchClientAddresses();
          }
        },
        error: (error) => {
          console.error('Error creating address:', error);
        },
      });
    }
  }

  updateTotal(): void {
    this.total = this.subTotal + this.shipping + this.tax;
  }

  getSelectedShippingAddressId(): number | null {
    const selectedAddress = this.shippingAddresses.find(
      (addr) => addr.isSelected,
    );
    return selectedAddress ? selectedAddress.id : null;
  }

  // Map payment method to API values
  getPaymentMethodValue(): number {
    return this.paymentMethod === 'cod' ? 0 : 1;
  }

  placeOrder(): void {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('User is not authenticated');
      alert('Please log in to place an order');
      // Redirect to login page
      return;
    }

    // Check if cart is empty
    if (this.cartItems.length === 0) {
      console.error('Cart is empty');
      alert('Your cart is empty');
      return;
    }

    // Get selected address ID
    const selectedAddressId = this.getSelectedShippingAddressId();
    if (!selectedAddressId) {
      console.error('No address selected');
      alert('Please select a shipping address');
      return;
    }

    // Prepare order products data
    const orderProducts = this.cartItems.map((item) => ({
      productVariantId: item.productId,
      quantity: item.quantity,
      price: item.afterPrice,
    }));

    // Set loading state
    this.isPlacingOrder = true;

    // Get payment method value (0 for COD, 1 for PayTabs)
    const paymentMethodValue = this.getPaymentMethodValue();

    // Call order service to place order
    this.orderService
      .placeOrder(token, selectedAddressId, orderProducts, paymentMethodValue)
      .subscribe({
        next: (response) => {
          this.isPlacingOrder = false;
          if (response.success) {
            console.log('Order placed successfully:', response);

            // Clear cart
            this.cartService.clearCart();

            // Show success message
            alert('Order placed successfully!');

            // Redirect to orders page
            this.router.navigate(['/account/orders']);
          } else {
            console.error('Failed to place order:', response);
            alert(
              'Failed to place order: ' +
                (response.error?.message || 'Unknown error'),
            );
          }
        },
        error: (error) => {
          this.isPlacingOrder = false;
          console.error('Error placing order:', error);
          alert('Error placing order: ' + (error.message || 'Unknown error'));
        },
      });
  }
}
