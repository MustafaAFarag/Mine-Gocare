import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserService, UserProfile } from '../../../services/user.service';

interface SidebarItem {
  name: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar-tab',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-tab.component.html',
  styleUrl: './sidebar-tab.component.css',
})
export class SidebarTabComponent implements OnInit {
  user!: UserProfile;

  sidebarItems: SidebarItem[] = [
    {
      name: 'Dashboard',
      icon: 'ri-dashboard-line',
      route: '/account/dashboard',
      active: false,
    },
    {
      name: 'Notifications',
      icon: 'ri-notification-line',
      route: '/account/notifications',
      active: false,
    },
    {
      name: 'Bank Details',
      icon: 'ri-bank-line',
      route: '/account/bank-details',
      active: false,
    },
    {
      name: 'My Wallet',
      icon: 'ri-wallet-line',
      route: '/account/wallet',
      active: false,
    },
    {
      name: 'Earning Points',
      icon: 'ri-coin-line',
      route: '/account/points',
      active: false,
    },
    {
      name: 'My Orders',
      icon: 'ri-file-list-line',
      route: '/account/orders',
      active: false,
    },

    {
      name: 'Refund History',
      icon: 'ri-refund-line',
      route: '/account/refund',
      active: false,
    },
    {
      name: 'Saved Address',
      icon: 'ri-map-pin-line',
      route: '/account/address',
      active: false,
    },
  ];

  constructor(
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    // Set initial active state based on current URL
    this.setActiveItem(this.router.url);

    // Subscribe to router events to update active state when route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.setActiveItem(event.url);
      });

    // Get user data from service
    this.userService.userData$.subscribe((userData) => {
      if (userData) {
        this.user = userData;
      }
    });
  }

  setActiveItem(url: string): void {
    // Reset all items
    this.sidebarItems.forEach((item) => {
      item.active = false;
    });

    // Find and set the active item
    const activeItem = this.sidebarItems.find((item) =>
      url.includes(item.route),
    );
    if (activeItem) {
      activeItem.active = true;
    }
  }

  getInitials(): string {
    return this.user ? this.user.firstName.charAt(0) : '';
  }

  getFullName(): string {
    return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
  }
}
