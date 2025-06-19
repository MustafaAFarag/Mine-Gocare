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
    this.authService.getClientProfile().subscribe();
  }
}
