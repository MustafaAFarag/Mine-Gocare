import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartSidebarService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  openCart(): void {
    this.isOpenSubject.next(true);
  }

  closeCart(): void {
    this.isOpenSubject.next(false);
  }

  toggleCart(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }
}
