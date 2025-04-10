import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { ApiEndPoint } from '../../constants/api.constant';

interface LoginRequest {
  emailAddress: string;
  mobileNumber: string;
  password: string;
  deviceToken: string;
  rememberClient: boolean;
}

interface LoginResponse {
  result: {
    accessToken: string;
    expireInSeconds: number;
    userId: number;
    userName: string;
  };
  success: boolean;
  error?: any;
}

interface SignupRequest {
  emailAddress: string;
  phoneCode: string;
  mobileNumber: number;
  countryCode: string;
  deviceToken: string;
  isEmailConfirmed: boolean;
  isPhoneConfirmed: boolean;
  isAutomaticSignIn: boolean;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  gender: number;
  profileImageUrl: string;
  thumbImageUrl: string;
}

interface SignupResponse {
  success: boolean;
  error?: any;
  result?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/${ApiEndPoint.SignInManually}`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasToken(),
  );
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
      tap((response) => {
        if (response.success && response.result?.accessToken) {
          this.storeToken(
            response.result.accessToken,
            credentials.rememberClient,
          );
          this.isAuthenticatedSubject.next(true);
        }
      }),
    );
  }

  logout(): void {
    this.clearToken();
    this.isAuthenticatedSubject.next(false);
  }

  private storeToken(token: string, remember: boolean): void {
    if (this.isBrowser()) {
      if (remember) {
        localStorage.setItem('accessToken', token);
      } else {
        sessionStorage.setItem('accessToken', token);
      }
    }
  }

  private clearToken(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
    }
  }

  private hasToken(): boolean {
    return (
      this.isBrowser() &&
      !!(
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken')
      )
    );
  }

  getToken(): string | null {
    return this.isBrowser()
      ? localStorage.getItem('accessToken') ||
          sessionStorage.getItem('accessToken')
      : null;
  }

  signup(data: SignupRequest): Observable<SignupResponse> {
    const signupUrl = `${environment.apiUrl}/${ApiEndPoint.SignUpManually}`;
    return this.http.post<SignupResponse>(signupUrl, data).pipe(
      tap((response) => {
        if (response.success && data.isAutomaticSignIn) {
          this.isAuthenticatedSubject.next(true);
          // Optional: handle auto-login token here if API returns one
        }
      }),
    );
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined'; // Ensures code runs only in the browser
  }
}
