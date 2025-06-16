import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiEndPoint } from '../constants/api.constant';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  constructor(private http: HttpClient) {}

  getBrands(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/${ApiEndPoint.getBrands}`);
  }
}
