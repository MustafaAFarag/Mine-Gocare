import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { LoginResponse } from '../model/Auth';
import { ApiEndPoint } from '../constants/api.constant';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginUrl = `${environment.apiUrl}/${ApiEndPoint.SignInManually}`;
  private signupUrl = `${environment.apiUrl}/${ApiEndPoint.SignUpManually}`;
  private updateNameUrl = `${environment.apiUrl}/${ApiEndPoint.updateClientName}`;
  private getClientProfileUrl = `${environment.apiUrl}/${ApiEndPoint.getClientProfile}`;
  private updatePhoneNumberUrl = `${environment.apiUrl}/${ApiEndPoint.updateClientPhone}`;
  private updateEmailAddressUrl = `${environment.apiUrl}/${ApiEndPoint.updateClientEmail}`;
  private updatePasswordUrl = `${environment.apiUrl}/${ApiEndPoint.updateClientPassword}`;
  private updateGenderUrl = `${environment.apiUrl}/${ApiEndPoint.updateClientGender}`;
  private updateClientPhotoUrl = `${environment.apiUrl}/${ApiEndPoint.UpdateClientPhoto}`;
  private uploadClientImageUrl = `${environment.apiUrl}/${ApiEndPoint.uploadClientImage}`;

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

  login(
    emailOrPhone: string,
    password: string,
    country?: {
      code: string;
      phoneCode: string;
      phoneCodeCountryId: number;
    },
  ): Observable<any> {
    const headers = new HttpHeaders({
      'abp.tenantid': '1',
    });

    const isEmail = emailOrPhone.includes('@');
    let formattedPhone: string | null = null;

    if (!isEmail && country) {
      // Format phone number with the selected country's prefix
      formattedPhone = emailOrPhone.startsWith('0')
        ? country.phoneCode + emailOrPhone.substring(1)
        : country.phoneCode + emailOrPhone;
    }

    const body = {
      emailAddress: isEmail ? emailOrPhone : null,
      mobileNumber: isEmail ? null : formattedPhone,
      password: password,
      rememberClient: true,
    };

    return this.http.post<LoginResponse>(this.loginUrl, body, { headers }).pipe(
      tap((res) => {
        if (res.success) {
          // Store tokens separately
          this.setLocalStorageItem('accessToken', res.result.accessToken);
          this.setLocalStorageItem('refreshToken', res.result.refreshToken);
          this.setLocalStorageItem(
            'refreshTokenExpiration',
            res.result.refreshTokenExpiration,
          );
          this.setLocalStorageItem(
            'expireInSeconds',
            res.result.expireInSeconds.toString(),
          );

          // Create user data object with consistent structure
          const userData = {
            userId: res.result.userId,
            firstName: res.result.fullName.split(' ')[0],
            lastName: res.result.fullName.split(' ').slice(1).join(' '),
            emailAddress: isEmail ? emailOrPhone : null,
            mobileNumber: !isEmail ? formattedPhone : null,
            gender: res.result.gender,
            profileImageUrl: res.result.profileImageUrl,
            thumbImageUrl: res.result.thumbImageUrl,
            isRegisteredExternally: false,
          };

          this.setLocalStorageItem('user', JSON.stringify(userData));
          this.userSubject.next(userData);
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
    phoneCode?: string;
    PhoneCodeCountryId?: number;
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
      isAutomaticSignIn: true,
    };

    if (signupData.emailAddress) {
      body.emailAddress = signupData.emailAddress;
      body.isEmailConfirmed = false;
      body.isPhoneConfirmed = false;
    } else if (signupData.mobileNumber) {
      body.mobileNumber = signupData.mobileNumber;
      body.phoneCode = signupData.phoneCode;
      body.PhoneCodeCountryId = signupData.PhoneCodeCountryId;
      body.isEmailConfirmed = true;
      body.isPhoneConfirmed = true;
    }

    return this.http.post<any>(this.signupUrl, body, { headers }).pipe(
      tap((res) => {
        if (!res.success) {
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

  updateFullName(firstName: string, lastName: string): Observable<any> {
    const token = this.getLocalStorageItem('accessToken');

    if (!token) {
      return throwError(() => new Error('No access token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    const body = { firstName, lastName };

    return this.http.put<any>(this.updateNameUrl, body, { headers }).pipe(
      tap((res) => {
        if (res.success) {
          const updatedUser = {
            ...this.currentUser,
            firstName,
            lastName,
          };
          this.setLocalStorageItem('user', JSON.stringify(updatedUser));
          this.userSubject.next(updatedUser);
        } else {
          throw new Error('Failed to update name.');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred while updating the name.';
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

  getClientProfile(): Observable<any> {
    const token = this.getLocalStorageItem('accessToken');

    if (!token) {
      return throwError(() => new Error('No access token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });

    return this.http.get<any>(this.getClientProfileUrl, { headers }).pipe(
      tap((res) => {
        if (res.success && res.result) {
          // Create user data object with consistent structure
          const userData = {
            userId: this.currentUser?.userId,
            firstName: res.result.firstName,
            lastName: res.result.lastName,
            emailAddress: res.result.emailAddress,
            mobileNumber: res.result.mobileNumber,
            gender: res.result.gender,
            profileImageUrl:
              res.result.profileImageURL || this.currentUser?.profileImageUrl,
            thumbImageUrl:
              res.result.profileImageURL || this.currentUser?.thumbImageUrl,
            isRegisteredExternally: res.result.isRegisteredExternally,
          };

          this.setLocalStorageItem('user', JSON.stringify(userData));
          this.userSubject.next(userData);
        } else {
          throw new Error('Failed to retrieve profile.');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred while retrieving the profile.';
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

  updatePhoneNumber(mobileNumber: number): Observable<any> {
    const token = this.getLocalStorageItem('accessToken');

    if (!token) {
      return throwError(() => new Error('No access token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    const body = {
      countryCode: 'EG',
      mobileNumber: mobileNumber,
      isPhoneNumberConfirmed: true,
    };

    return this.http
      .put<any>(this.updatePhoneNumberUrl, body, { headers })
      .pipe(
        tap((res) => {
          if (res.success) {
            const updatedUser = {
              ...this.currentUser,
              mobileNumber: mobileNumber,
              countryCode: 'EG',
            };
            this.setLocalStorageItem('user', JSON.stringify(updatedUser));
            this.userSubject.next(updatedUser);
          } else {
            throw new Error('Failed to update phone number.');
          }
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage =
            'An error occurred while updating the phone number.';
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

  updateEmailAddress(emailAddress: string): Observable<any> {
    const token = this.getLocalStorageItem('accessToken');

    if (!token) {
      return throwError(() => new Error('No access token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    const body = {
      emailAddress: emailAddress,
      isEmailConfirmed: true,
    };

    return this.http
      .put<any>(this.updateEmailAddressUrl, body, { headers })
      .pipe(
        tap((res) => {
          if (res.success) {
            const updatedUser = {
              ...this.currentUser,
              emailAddress: emailAddress,
            };
            this.setLocalStorageItem('user', JSON.stringify(updatedUser));
            this.userSubject.next(updatedUser);
          } else {
            throw new Error('Failed to update email address.');
          }
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage =
            'An error occurred while updating the email address.';
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

  changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<any> {
    const token = this.getLocalStorageItem('accessToken');

    if (!token) {
      return throwError(() => new Error('No access token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    return this.http
      .post<any>(this.updatePasswordUrl, payload, { headers })
      .pipe(
        tap((res) => {
          if (!res.success) {
            throw new Error('Password change failed.');
          }
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'An error occurred while changing the password.';
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

  updateGender(gender: number): Observable<any> {
    const token = this.getLocalStorageItem('accessToken');

    if (!token) {
      return throwError(() => new Error('No access token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    const body = { gender };

    return this.http.put<any>(this.updateGenderUrl, body, { headers }).pipe(
      tap((res) => {
        if (res.success) {
          const updatedUser = {
            ...this.currentUser,
            gender,
          };
          this.setLocalStorageItem('user', JSON.stringify(updatedUser));
          this.userSubject.next(updatedUser);
        } else {
          throw new Error('Failed to update gender.');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred while updating gender.';
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

  get currentUser() {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  // LocalStorage Helpers
  isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  getLocalStorageItem(key: string): string | null {
    return this.isBrowser() ? localStorage.getItem(key) : null;
  }

  setLocalStorageItem(key: string, value: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(key, value);
    }
  }

  removeLocalStorageItem(key: string): void {
    if (this.isBrowser()) {
      localStorage.removeItem(key);
    }
  }

  uploadProfileImage(file: File): Observable<any> {
    const token = this.getLocalStorageItem('accessToken');
    if (!token) {
      return throwError(() => new Error('No access token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const formData = new FormData();
    formData.append('image', file);

    return this.http
      .post<any>(this.uploadClientImageUrl, formData, {
        headers,
        reportProgress: true,
        observe: 'response',
      })
      .pipe(
        map((response) => response.body),
        tap((res) => {
          if (!res.success) {
            throw new Error(res.error?.message || 'Failed to upload image.');
          }
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'An error occurred while uploading the image.';
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

  updateProfileImage(imageUrl: string): Observable<any> {
    const token = this.getLocalStorageItem('accessToken');
    if (!token) {
      return throwError(() => new Error('No access token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    const body = {
      profileImageURL: imageUrl,
    };

    return this.http
      .put<any>(this.updateClientPhotoUrl, body, { headers })
      .pipe(
        tap((res) => {
          if (res.success) {
            const updatedUser = {
              ...this.currentUser,
              profileImageUrl: imageUrl,
              thumbImageUrl: imageUrl,
            };
            this.setLocalStorageItem('user', JSON.stringify(updatedUser));
            this.userSubject.next(updatedUser);
          } else {
            throw new Error('Failed to update profile image.');
          }
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage =
            'An error occurred while updating the profile image.';
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
}
