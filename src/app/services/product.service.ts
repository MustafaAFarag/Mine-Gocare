import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  getProductDetails() {
    return this.http.get(
      'https://gocare-back-develop.salonspace1.com/api/services/WebApp/Product/GetProductDetails?productId=1&ProductVariantId=2'
    );
  }
}
