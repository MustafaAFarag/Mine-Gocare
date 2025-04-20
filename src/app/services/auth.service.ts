import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../model/Auth';
import { ApiEndPoint } from '../constants/api.constant';
import { environment } from '../../enviroments/enviroment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginUrl = `${environment.apiUrl}/${ApiEndPoint.SignInManually}`;
  private signupUrl = `${environment.apiUrl}/${ApiEndPoint.SignUpManually}`;

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const savedUser = this.getLocalStorageItem('user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  login(emailOrPhone: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'accept-language': 'en',
      countryid: '224',
      'abp.tenantid': '1',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    const isEmail = emailOrPhone.includes('@');
    let formattedPhone: string | null = null;

    if (!isEmail) {
      // Remove leading 0 from phone numbers like "01069004741" -> "1069004741"
      formattedPhone = emailOrPhone.startsWith('0')
        ? emailOrPhone.substring(1)
        : emailOrPhone;
    }

    const body = {
      emailAddress: isEmail ? emailOrPhone : null,
      mobileNumber: isEmail ? null : formattedPhone,
      password: password,
    };

    return this.http.post<LoginResponse>(this.loginUrl, body, { headers }).pipe(
      tap((res) => {
        if (res.success) {
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

          // Add email or phone info to the user data that gets stored
          const userData = safeUserData as any;
          if (isEmail) {
            userData.emailAddress = emailOrPhone;
          } else {
            userData.mobileNumber = formattedPhone;
          }

          this.setLocalStorageItem('user', JSON.stringify(userData));
        } else {
          throw new Error('Login failed');
        }
      }),
      catchError((error: HttpErrorResponse) => {
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

  signup(signupData: {
    firstName: string;
    lastName: string;
    emailAddress?: string;
    mobileNumber?: string;
    password: string;
    confirmPassword: string;
    countryCode: string;
    gender: number;
  }): Observable<any> {
    const headers = new HttpHeaders({
      'accept-language': 'en',
      countryid: '224',
      'abp.tenantid': '1',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    // Clean up data to send only either email or mobile
    const body: any = {
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      password: signupData.password,
      confirmPassword: signupData.confirmPassword,
      countryCode: signupData.countryCode,
      gender: signupData.gender,
    };

    if (signupData.emailAddress) {
      body.emailAddress = signupData.emailAddress;
    } else if (signupData.mobileNumber) {
      body.mobileNumber = signupData.mobileNumber;
    }

    return this.http.post<any>(this.signupUrl, body, { headers }).pipe(
      tap((res) => {
        if (res.success) {
          // Create user object with the signup data
          const userData = {
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            gender: signupData.gender,
          };

          // Add either email or mobile based on what was used
          if (signupData.emailAddress) {
            Object.assign(userData, { emailAddress: signupData.emailAddress });
          } else if (signupData.mobileNumber) {
            Object.assign(userData, {
              mobileNumber: signupData.mobileNumber,
              countryCode: signupData.countryCode,
            });
          }

          // Save to localStorage and update subject
          this.setLocalStorageItem('user', JSON.stringify(userData));
          this.userSubject.next(userData);
        } else {
          throw new Error('Signup failed');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred during signup';
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
    this.router.navigate(['/']);
  }

  get currentUser() {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
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
