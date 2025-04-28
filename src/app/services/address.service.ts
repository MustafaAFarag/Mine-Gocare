// src/app/services/address.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { ApiEndPoint } from '../constants/api.constant';
import { CreateAddress, UpdateAddress } from '../model/Address';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private getAddressUrl = `${environment.apiUrl}/${ApiEndPoint.GetClientAddresses}`;
  private createAddressUrl = `${environment.apiUrl}/${ApiEndPoint.CreateAddress}`;
  private deleteAddressBaseUrl = `${environment.apiUrl}/${ApiEndPoint.DeleteAddress}`;
  private updateAddressUrl = `${environment.apiUrl}/${ApiEndPoint.UpdateAddress}`;
  private getAllCities = `${environment.apiUrl}/${ApiEndPoint.getAllCities}`;
  private getAllDistricts = `${environment.apiUrl}/${ApiEndPoint.getAllDistricts}`;
  private getAllCountries = `${environment.apiUrl}/${ApiEndPoint.getAllCountries}`;

  constructor(private http: HttpClient) {}

  getClientAddresses(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(this.getAddressUrl, { headers });
  }

  createAddress(token: string, body: CreateAddress): Observable<any> {
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

  updateAddress(token: string, body: UpdateAddress): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.put(this.updateAddressUrl, body, { headers });
  }

  GetCities(countryId: number): Observable<any> {
    return this.http.get(`${this.getAllCities}?countryId=${countryId}`);
  }

  getDistricts(cityId: number): Observable<any> {
    return this.http.get(`${this.getAllDistricts}?cityId=${cityId}
`);
  }

  getCountries(): Observable<any> {
    return this.http.get(`${this.getAllCountries}`);
  }
}
