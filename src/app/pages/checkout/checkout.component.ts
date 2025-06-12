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
import { PointingSystemService } from '../../services/pointing-system.service';
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
import { TranslateService } from '@ngx-translate/core';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { WalletService } from '../../services/wallet.service';

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
    LoadingComponent,
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

  // Loading states
  loading: boolean = false;
  cartLoading: boolean = true;

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
  paymentMethod: 'cod' | 'wallet' | 'points' = 'cod';
  walletBalance: number = 0;
  totalPoints: number = 0;
  pointsValueInEGP: number = 0;
  readonly POINTS_TO_EGP_RATIO = 0.5; // 1 point = 0.5 EGP

  shippingAddresses: Address[] = [];
  billingAddresses: Address[] = [];

  cartItems: CartItem[] = [];
  subTotal: number = 0;

  shipping: number = 78.0;

  total: number = 0;

  // Loading state
  isPlacingOrder: boolean = false;

  // Promo code state
  appliedPromoCode: { id: number; discount: number } | null = null;

  constructor(
    private cartService: CartService,
    private walletService: WalletService,
    private languageService: LanguageService,
    private addressService: AddressService,
    private orderService: OrderService,
    private pointingSystemService: PointingSystemService,
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    // Subscribe to language changes
    this.langSubscription = this.languageService.language$.subscribe((lang) => {
      this.currentLang = lang;
    });

    // Subscribe to cart changes
    this.cartLoading = true;
    this.cartSubscription = this.cartService.cart$.subscribe((cart) => {
      this.subTotal = cart.total;

      // Transform cart items to match our CartItem interface
      this.cartItems = cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        currency: item.currency,
        afterPrice: item.afterPrice,
        beforePrice: item.beforePrice,
        quantity: item.quantity,
        image: item.image,
        promoCodeDetail: item.promoCodeDetail,
      }));

      this.updateTotal();
      this.cartLoading = false;

      // If cart is empty, we might want to redirect to cart page
      if (this.cartItems.length === 0) {
        // Redirect to cart page
        this.router.navigate(['/cart']);
      }
    });

    // Fetch client addresses
    this.fetchClientAddresses();
    this.fetchClientWallet();
    this.fetchTotalPoints();
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

  fetchClientWallet(): void {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.walletService
        .getWallet(token, JSON.parse(user || '{}').userId, 224)
        .subscribe((response) => {
          if (response.success && response.result) {
            this.walletBalance = response.result.walletAmount || 0;

            // If wallet balance is less than total, make sure wallet isn't selected
            if (
              this.walletBalance < this.total &&
              this.paymentMethod === 'wallet'
            ) {
              this.paymentMethod = 'cod';
            }
          }
        });
    }
  }

  fetchClientAddresses(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        this.loading = true;
        this.addressService.getClientAddresses(token).subscribe({
          next: (response) => {
            if (response.success && response.result) {
              // Transform API addresses to match our Address format and set the first one as selected
              this.transformAddresses(response.result);
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error fetching addresses:', error);
            this.loading = false;
          },
        });
      }
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

    this.shipping = option === 'standard' ? 78.0 : 83.99;
    this.updateTotal();
  }

  selectTimeSlot(slotId: string): void {
    this.selectedTimeSlot = slotId;
  }

  selectPaymentMethod(method: 'cod' | 'wallet' | 'points'): void {
    // Don't allow wallet payment if balance is insufficient
    if (method === 'wallet' && this.walletBalance < this.total) {
      return;
    }

    // Don't allow points payment if no points available
    if (method === 'points' && this.totalPoints <= 0) {
      return;
    }

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
    if (typeof window !== 'undefined' && window.localStorage) {
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
  }

  updateTotal(): void {
    this.total =
      this.subTotal + this.shipping - (this.appliedPromoCode?.discount || 0);
  }

  getSelectedShippingAddressId(): number | undefined {
    const selectedAddress = this.shippingAddresses.find(
      (addr) => addr.isSelected,
    );
    return selectedAddress?.id;
  }

  // Map payment method to API values
  getPaymentMethodValue(): number {
    if (this.paymentMethod === 'cod') return 1;
    if (this.paymentMethod === 'wallet') return 3;
    return 4; // points
  }

  get mappedOrderProducts() {
    return this.cartItems.map((item) => ({
      productVariantId: item.variantId || item.productId,
      quantity: item.quantity,
      price: item.afterPrice,
    }));
  }

  handlePromoCodeApplied(event: { promoCodeId: number; discount: number }) {
    this.appliedPromoCode = {
      id: event.promoCodeId,
      discount: event.discount,
    };
    this.updateTotal();
  }

  fetchTotalPoints(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.pointingSystemService.getClientsTotalPoints(token).subscribe({
        next: (response) => {
          if (response.success) {
            this.totalPoints = response.result || 0;
            this.pointsValueInEGP = this.totalPoints * this.POINTS_TO_EGP_RATIO;
          }
        },
        error: (error) => {
          console.error('Error fetching total points:', error);
        },
      });
    }
  }

  getRequiredPoints(): number {
    // Calculate how many points are needed to cover the total price
    return Math.ceil(this.total / this.POINTS_TO_EGP_RATIO);
  }

  placeOrder(): void {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('User is not authenticated');
      alert(this.translate.instant('alerts.loginRequired'));
      return;
    }

    // Check if cart is empty
    if (this.cartItems.length === 0) {
      console.error('Cart is empty');
      alert(this.translate.instant('alerts.emptyCart'));
      return;
    }

    // Get selected address ID
    const selectedAddressId = this.getSelectedShippingAddressId();
    if (!selectedAddressId) {
      console.error('No address selected');
      alert(this.translate.instant('alerts.selectShippingAddress'));
      return;
    }

    // Set loading state
    this.isPlacingOrder = true;

    // Get payment method value (1 for COD, 3 for Wallet, 4 for Points)
    const paymentMethodValue = this.getPaymentMethodValue();

    // Prepare the order request
    const orderRequest: any = {
      addressId: selectedAddressId,
      orderProducts: this.cartItems.map((item) => ({
        productVariantId: item.variantId || item.productId,
        quantity: item.quantity,
        price: item.afterPrice,
      })),
      paymentMethod: paymentMethodValue,
      promoCodeId: this.appliedPromoCode?.id || null,
      redeemedPointsAmount: 0, // Default to 0
      walletAmount: 0, // Default to 0
    };

    // Add walletAmount only if paying with wallet
    if (paymentMethodValue === 3) {
      orderRequest.walletAmount = Number(this.total.toFixed(2));
    }

    // Add points amount if paying with points
    if (paymentMethodValue === 4) {
      // Calculate required points for the total amount
      const requiredPoints = this.getRequiredPoints();
      orderRequest.redeemedPointsAmount = requiredPoints;
    }

    // Call order service to place order
    this.orderService.placeOrder(token, orderRequest).subscribe({
      next: (response) => {
        if (response.success) {
          // Add points for the order if not paying with points
          if (paymentMethodValue !== 4) {
            this.pointingSystemService.addPoints(token, 3, false);
          }

          // Clear cart
          this.cartService.clearCart();

          // Refresh wallet balance if paid with wallet
          if (paymentMethodValue === 3) {
            this.fetchClientWallet();
          }

          // Refresh points if paid with points
          if (paymentMethodValue === 4) {
            this.fetchTotalPoints();
          }

          // Show success message
          alert(this.translate.instant('alerts.orderSuccess'));

          // Redirect to orders page
          this.router.navigate(['/account/orders']);
        } else {
          console.error('Failed to place order:', response);
          alert(
            this.translate.instant('alerts.orderFailed', {
              error: response.error?.message || 'Unknown error',
            }),
          );
        }
        this.isPlacingOrder = false;
      },
      error: (error) => {
        this.isPlacingOrder = false;
        console.error('Error placing order:', error);
        alert(
          this.translate.instant('alerts.orderError', {
            error: error.message || 'Unknown error',
          }),
        );
      },
    });
  }

  getLanguage(): string {
    const storedLang = localStorage.getItem('language');
    return storedLang || 'en';
  }

  getCurrency(): string {
    const lang = this.getLanguage();
    return (
      this.cartItems[0]?.currency?.[lang] ||
      this.cartItems[0]?.currency?.en ||
      'EGP'
    );
  }

  handleOrderSummaryUpdate(summary: any): void {
    if (summary) {
      console.log('Updating checkout with summary:', summary);
      this.subTotal = summary.subTotal || 0;
      this.shipping = summary.shippingFees || 0;
      this.total = summary.total || 0;

      // Update wallet balance if available
      if (summary.availableWalletAmount !== undefined) {
        this.walletBalance = summary.availableWalletAmount;
      }

      // Update the cart items if they've changed
      if (summary.items) {
        this.cartItems = summary.items.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          currency: item.currency,
          afterPrice: item.afterPrice,
          beforePrice: item.beforePrice,
          quantity: item.quantity,
          image: item.image,
          promoCodeDetail: item.promoCodeDetail,
        }));
      }
    }
  }
}
