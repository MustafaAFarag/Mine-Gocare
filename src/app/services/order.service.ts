import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private getClientOrdersDetailsUrl =
    'https://gocare-back-develop.salonspace1.com/api/services/ClientApp/ClientOrders';
  private getClientOrdersUrl =
    'https://gocare-back-develop.salonspace1.com/api/services/ClientApp/ClientOrders/GetClientOrders';
  private placeOrderUrl =
    'https://gocare-back-develop.salonspace1.com/api/services/ClientApp/ClientOrders/PlaceOrder';
  private cancelOrderUrl =
    'https://gocare-back-develop.salonspace1.com/api/services/ClientApp/ClientOrders/CancelOrder';

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
        pageSize: 10,
      },
      activeTab: 2,
    };

    return this.http.post(this.getClientOrdersUrl, body, { headers });
  }

  placeOrder(
    token: string,
    addressId: number,
    orderProducts: {
      productVariantId: number;
      quantity: number;
      price: number;
    }[],
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'abp.tenantid': this.tenantId,
      'accept-language': this.language,
      countryid: this.countryId,
    });

    const body = {
      addressId: addressId,
      paymentMethod: 1,
      promoCodeDeduction: 0,
      orderProducts: orderProducts,
      walletAmount: 0.0,
      redeemedPointsAmount: 0.0,
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
