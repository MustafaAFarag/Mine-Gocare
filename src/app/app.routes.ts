import { Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { CartComponent } from './pages/cart/cart.component';
import { CollectionsComponent } from './pages/collections/collections.component';
import { AccountComponent } from './pages/account/account.component';
import { DashboardComponent } from './features/account/dashboard/dashboard.component';
import { NotificationsComponent } from './features/account/notifications/notifications.component';
import { OrdersComponent } from './features/account/orders/orders.component';
import { AddressComponent } from './features/account/address/address.component';
import { BankDetailsComponent } from './features/account/bank-details/bank-details.component';
import { WalletComponent } from './features/account/wallet/wallet.component';
import { PointsComponent } from './features/account/points/points.component';
import { RefundComponent } from './features/account/refund/refund.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: HomepageComponent,
      },
      {
        path: 'product-details/:productId/:variantId',
        component: ProductDetailsComponent,
      },
      {
        path: 'cart',
        component: CartComponent,
      },
      {
        path: 'collections',
        component: CollectionsComponent,
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
      },
      {
        path: 'account',
        component: AccountComponent,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            component: DashboardComponent,
          },
          {
            path: 'notifications',
            component: NotificationsComponent,
          },
          {
            path: 'wallet',
            component: WalletComponent,
          },
          {
            path: 'points',
            component: PointsComponent,
          },
          {
            path: 'orders',
            component: OrdersComponent,
          },
          {
            path: 'refund',
            component: RefundComponent,
          },
          {
            path: 'address',
            component: AddressComponent,
          },
          {
            path: 'bank-details',
            component: BankDetailsComponent,
          },
        ],
      },
      {
        path: 'contact-us',
        loadComponent: () =>
          import('./pages/contact-us/contact-us.component').then(
            (m) => m.ContactUsComponent,
          ),
      },
      {
        path: 'privacy-policy',
        loadComponent: () =>
          import('./pages/privacy-policy/privacy-policy.component').then(
            (m) => m.PrivacyPolicyComponent,
          ),
      },
      {
        path: 'refund-policy',
        loadComponent: () =>
          import('./pages/refund-policy/refund-policy.component').then(
            (m) => m.RefundPolicyComponent,
          ),
      },
      {
        path: 'terms-and-conditions',
        loadComponent: () =>
          import(
            './pages/terms-and-conditions/terms-and-conditions.component'
          ).then((m) => m.TermsAndConditionsComponent),
      },
      {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',
      },
    ],
  },
];
