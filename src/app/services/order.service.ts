import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiEndPoint } from '../constants/api.constant';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private getClientOrdersDetailsUrl = `${environment.apiUrl}/${ApiEndPoint.GetClientOrders}`;
  private getClientOrdersUrl = `${environment.apiUrl}/${ApiEndPoint.GetClientOrdersDetails}`;
  private placeOrderUrl = `${environment.apiUrl}/${ApiEndPoint.PlaceOrder}`;
  private cancelOrderUrl = `${environment.apiUrl}/${ApiEndPoint.CancelOrder}`;

  private tenantId = '1';
  private language = 'en';
  private countryId = '224';

  constructor(private http: HttpClient) {}

  getClientOrderDetails(orderId: number, token: string): Observable<any> {
    const url = `${this.getClientOrdersDetailsUrl}/GetClientOrderDetails?id=${orderId}`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'abp.tenantid': this.tenantId,
      'accept-language': this.language,
      countryid: this.countryId,
    });

    return this.http.get(url, { headers });
  }

  getClientOrders(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const body = {
      paging: {
        pageNumber: 1,
        pageSize: 100,
      },
      activeTab: 2,
    };

    return this.http.post(this.getClientOrdersUrl, body, { headers });
  }

  placeOrder(
    token: string,
    orderRequest: {
      addressId: number;
      orderProducts: {
        productVariantId: number;
        quantity: number;
        price: number;
      }[];
      paymentMethod: number;
      promoCodeId?: number | null;
      walletAmount?: number;
    },
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'abp.tenantid': this.tenantId,
      'accept-language': this.language,
      countryid: this.countryId,
    });

    const body = {
      addressId: orderRequest.addressId,
      paymentMethod: orderRequest.paymentMethod,
      orderProducts: orderRequest.orderProducts,
      promoCodeId: orderRequest.promoCodeId || null,
      walletAmount: orderRequest.walletAmount || 0.0,
    };

    return this.http.post(this.placeOrderUrl, body, { headers });
  }

  cancelOrder(token: string, orderId: number, reason: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'abp.tenantid': this.tenantId,
      'accept-language': this.language,
      countryid: this.countryId,
    });

    const body = {
      orderId: orderId,
      reason: reason,
      date: new Date().toISOString(), // Current ISO datetime
      orderStatusFrom: 0,
    };

    return this.http.post(this.cancelOrderUrl, body, { headers });
  }
}
