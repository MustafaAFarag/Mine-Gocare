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

  getWalletTransactionList(
    token: string,
    pageNumber: number = 1,
    pageSize: number = 5,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      CountryId: '224',
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
