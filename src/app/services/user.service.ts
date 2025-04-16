import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  balance: number;
  totalPoints: number;
  totalOrders: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userDataSubject = new BehaviorSubject<UserProfile | null>(null);
  userData$: Observable<UserProfile | null> =
    this.userDataSubject.asObservable();

  constructor() {}

  setUserData(user: UserProfile): void {
    this.userDataSubject.next(user);
  }

  getUserData(): UserProfile | null {
    return this.userDataSubject.getValue();
  }
}
