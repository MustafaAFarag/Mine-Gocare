import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiEndPoint } from '../constants/api.constant';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private getWalletUrl = `${environment.apiUrl}/${ApiEndPoint.GetWallet}`;
  private getTransactionListUrl = `${environment.apiUrl}/${ApiEndPoint.GetWalletTransactionList}`;

  constructor(private http: HttpClient) {}

  private get countryId(): string {
    const country = localStorage.getItem('country');
    return country === 'SA' ? '103' : '224'; // Default to EG (224) if not SA
  }

  getWallet(token: string, clientId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const url = `${this.getWalletUrl}?ClientId=${clientId}&CountryId=${this.countryId}`;
    return this.http.get(url, { headers });
  }

  getWalletTransactionList(
    token: string,
    pageNumber: number = 1,
    pageSize: number = 5,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      CountryId: this.countryId,
    });

    const body = {
      paging: {
        pageNumber: pageNumber,
        pageSize: pageSize,
      },
    };

    return this.http.post(this.getTransactionListUrl, body, { headers });
  }
}
