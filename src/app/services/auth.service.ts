import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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
      throw new Error('Email/Phone and Password are required');
    }

    const headers = new HttpHeaders({
      'accept-language': 'en',
      countryid: '224',
      'abp.tenantid': '1',
    });

    const body = {
      emailAddress: emailOrPhone.includes('@') ? emailOrPhone : null, // Assumes email if '@' is present
      mobileNumber: emailOrPhone.includes('@') ? null : emailOrPhone, // Assumes phone if no '@'
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
        }
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
