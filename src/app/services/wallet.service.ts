import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { ApiEndPoint } from '../constants/api.constant';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private getWalletUrl = `${environment.apiUrl}/${ApiEndPoint.GetWallet}`;
  private getTransactionListUrl = `${environment.apiUrl}/${ApiEndPoint.GetWalletTransactionList}`;

  constructor(private http: HttpClient) {}

  getWallet(
    token: string,
    clientId: number,
    countryId: number,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const url = `${this.getWalletUrl}?ClientId=${clientId}&CountryId=${countryId}`;
    return this.http.get(url, { headers });
  }

  getWalletTransactionList(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const body = {
      paging: {
        pageNumber: 1,
        pageSize: 10,
      },
      searchText: 'string',
      countryId: 224,
      clientId: 49224,
      startDate: '2025-04-22T13:47:43.261Z',
      endDate: '2025-04-22T13:47:43.261Z',
      transactionType: [1],
    };

    return this.http.post(this.getTransactionListUrl, body, { headers });
  }
}
