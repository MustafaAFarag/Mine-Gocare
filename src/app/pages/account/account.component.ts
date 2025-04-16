import { Component } from '@angular/core';
import { SidebarTabComponent } from '../../features/account/sidebar-tab/sidebar-tab.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserProfile, UserService } from '../../services/user.service';

@Component({
  selector: 'app-account',
  imports: [
    SidebarTabComponent,
    BreadcrumbComponent,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent {
  user: UserProfile = {
    firstName: 'John',
    lastName: 'Due',
    email: 'john.customer@example.com',
    phone: '+1 0',
    address: '26, Starts Hollow Colony Denver, Colorado, United States 80014',
    balance: 8.46,
    totalPoints: 1970,
    totalOrders: 16,
  };

  constructor(private userService: UserService) {
    // Share user data with the service so child routes can access it
    this.userService.setUserData(this.user);
  }
}
