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

  constructor(private http: HttpClient) {}

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

    // Format phone number to include country code if it's a phone number
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
          localStorage.setItem('accessToken', res.result.accessToken);
          localStorage.setItem('user', JSON.stringify(res.result));
        } else {
          console.warn('Login failed response:', res);
          throw new Error('Login failed');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login error:', error);
        let errorMessage = 'An error occurred during login';
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          errorMessage =
            error.error?.message || `Server returned code ${error.status}`;
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  logout() {
    this.userSubject.next(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  get currentUser() {
    return this.userSubject.value;
  }
}
