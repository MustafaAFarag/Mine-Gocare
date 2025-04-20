import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../../model/Auth';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  user: UserProfile = {
    userId: 0,
    fullName: '',
    thumbImageUrl: '',
    profileImageUrl: '',
    gender: 0,
    emailAddress: '',
    mobileNumber: '',
  };

  constructor() {}

  ngOnInit(): void {
    this.loadUserFromLocalStorage();
  }

  loadUserFromLocalStorage(): void {
    const savedUser = this.getLocalStorageItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      this.user = {
        userId: userData.userId,
        fullName: userData.fullName,
        thumbImageUrl: userData.thumbImageUrl,
        profileImageUrl: userData.profileImageUrl,
        gender: userData.gender,
        emailAddress: userData.emailAddress,
        mobileNumber: userData.mobileNumber,
      };
    }
  }

  private getLocalStorageItem(key: string): string | null {
    return typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem(key)
      : null;
  }
}
