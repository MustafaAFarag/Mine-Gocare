// src/app/services/address.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { ApiEndPoint } from '../constants/api.constant';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private getAddressUrl = `${environment.apiUrl}/${ApiEndPoint.GetClientAddresses}`;
  private createAddressUrl = `${environment.apiUrl}/${ApiEndPoint.CreateAddress}`;
  private deleteAddressBaseUrl = `${environment.apiUrl}/${ApiEndPoint.DeleteAddress}`;
  private updateAddressUrl = `${environment.apiUrl}/${ApiEndPoint.UpdateAddress}`;

  constructor(private http: HttpClient) {}

  getClientAddresses(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(this.getAddressUrl, { headers });
  }

  createAddress(token: string, body: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(this.createAddressUrl, body, { headers });
  }

  deleteAddress(token: string, id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const url = `${this.deleteAddressBaseUrl}?id=${id}`;
    return this.http.delete(url, { headers });
  }

  updateAddress(token: string, body: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.put(this.updateAddressUrl, body, { headers });
  }
}
