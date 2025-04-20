import { Component } from '@angular/core';
import { SidebarTabComponent } from '../../features/account/sidebar-tab/sidebar-tab.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
export class AccountComponent {}
