import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthModalService {
  private showModalSubject = new BehaviorSubject<boolean>(false);
  private showCongratsModalSubject = new BehaviorSubject<boolean>(false);

  showModal$ = this.showModalSubject.asObservable();
  showCongratsModal$ = this.showCongratsModalSubject.asObservable();

  constructor(private router: Router) {}

  showModal() {
    this.showModalSubject.next(true);
  }

  hideModal() {
    this.showModalSubject.next(false);

    // Check if there's a redirect URL stored
    const redirectUrl = localStorage.getItem('redirectUrl');
    if (redirectUrl) {
      localStorage.removeItem('redirectUrl');
      this.router.navigate([redirectUrl]);
    }
  }

  showCongratsModal() {
    this.showCongratsModalSubject.next(true);
  }

  hideCongratsModal() {
    this.showCongratsModalSubject.next(false);
  }
}
