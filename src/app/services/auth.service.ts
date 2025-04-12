import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../model/Auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl =
    'https://gocare-back-develop.salonspace1.com/api/services/AdminApp/SignIn/SignInManually';

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = this.getLocalStorageItem('user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  login(emailOrPhone: string, password: string): Observable<any> {
    console.log('Trying to login with:', emailOrPhone, password);

    if (!emailOrPhone || !password) {
      return throwError(
        () => new Error('Email/Phone and Password are required'),
      );
    }

    const headers = new HttpHeaders({
      'accept-language': 'en',
      countryid: '224',
      'abp.tenantid': '1',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    const formattedPhone = emailOrPhone.includes('@')
      ? null
      : emailOrPhone.startsWith('+')
        ? emailOrPhone
        : `+2${emailOrPhone}`;

    const body = {
      emailAddress: emailOrPhone.includes('@') ? emailOrPhone : null,
      mobileNumber: formattedPhone,
      password: password,
    };

    console.log('Request body:', body);

    return this.http.post<LoginResponse>(this.apiUrl, body, { headers }).pipe(
      tap((res) => {
        if (res.success) {
          console.log('Login successful:', res);
          this.userSubject.next(res.result);
          this.setLocalStorageItem('accessToken', res.result.accessToken);
          const {
            accessToken,
            encryptedAccessToken,
            refreshToken,
            refreshTokenExpiration,
            expireInSeconds,
            ...safeUserData
          } = res.result;
          this.setLocalStorageItem('user', JSON.stringify(safeUserData));
        } else {
          console.warn('Login failed response:', res);
          throw new Error('Login failed');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login error:', error);
        let errorMessage = 'An error occurred during login';
        if (error.error instanceof ErrorEvent) {
          errorMessage = error.error.message;
        } else {
          errorMessage =
            error.error?.message || `Server returned code ${error.status}`;
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  logout() {
    this.userSubject.next(null);
    this.removeLocalStorageItem('accessToken');
    this.removeLocalStorageItem('user');
  }

  get currentUser() {
    return this.userSubject.value;
  }

  // LocalStorage Helpers
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  private getLocalStorageItem(key: string): string | null {
    return this.isBrowser() ? localStorage.getItem(key) : null;
  }

  private setLocalStorageItem(key: string, value: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(key, value);
    }
  }

  private removeLocalStorageItem(key: string): void {
    if (this.isBrowser()) {
      localStorage.removeItem(key);
    }
  }
}
