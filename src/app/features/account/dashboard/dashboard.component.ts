import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserProfile } from '../../../services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  user!: UserProfile;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.userData$.subscribe((userData) => {
      if (userData) {
        this.user = userData;
      }
    });
  }

  getFullName(): string {
    return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
  }
}
