import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiEndPoint } from '../constants/api.constant';

@Injectable({
  providedIn: 'root',
})
export class PromoCodesService {
  private getAllPromoCodesURL = `${environment.apiUrl}/${ApiEndPoint.getAllPromoCodes}`;
  private validatePromoCodeURL = `${environment.apiUrl}/${ApiEndPoint.ValidatePromoCode}`;
  constructor(private http: HttpClient) {}

  getAllPromoCodes(
    accessToken: string,
    pageNumber = 1,
    pageSize = 10,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    const body = {
      paging: {
        pageNumber,
        pageSize,
      },
    };

    return this.http.post(this.getAllPromoCodesURL, body, { headers });
  }

  validatePromoCode(
    accessToken: string,
    promoCode: string,
    orderProducts: {
      productVariantId: number;
      quantity: number;
      price: number;
    }[],
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    const body = {
      promoCode,
      orderProducts,
    };

    return this.http.post(this.validatePromoCodeURL, body, { headers });
  }
}
