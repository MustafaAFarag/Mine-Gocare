import { Component, OnInit } from '@angular/core';
import { SidebarTabComponent } from '../../features/account/sidebar-tab/sidebar-tab.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  imports: [
    SidebarTabComponent,
    BreadcrumbComponent,
    CommonModule,
    RouterModule,
    TranslateModule,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Only fetch profile if user data is not already loaded
    // This prevents race conditions during signup/login flow
    if (!this.authService.currentUser) {
      this.authService.getClientProfile().subscribe({
        error: (error) => {
          console.error('Error fetching client profile:', error);
        },
      });
    }
  }
}
