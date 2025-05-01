import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { ApiEndPoint } from '../constants/api.constant';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PointingSystemService {
  private getClientPointsPreviewUrl = `${environment.apiUrl}/${ApiEndPoint.GetClientPointsPreview}`;
  private getAllPointingSettingsUrl = `${environment.apiUrl}/${ApiEndPoint.GetAllPointingSettings}`;
  private getClientsTotalPointsUrl = `${environment.apiUrl}/${ApiEndPoint.GetClientTotalPoints}`;
  private addPointsUrl = `${environment.apiUrl}/${ApiEndPoint.AddPoints}`;

  constructor(private http: HttpClient) {}

  getClientPointsPreview(
    token: string,
    activeTab: number = 1,
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      countryId: 224,
    });

    const body = {
      paging: {
        pageNumber,
        pageSize,
      },
      activeTab,
    };

    return this.http.post(this.getClientPointsPreviewUrl, body, { headers });
  }

  getAllPointingSettings(
    token: string,
    countryId: number = 224,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      countryId: countryId.toString(),
      'Content-Type': 'application/json',
    });

    return this.http.post(this.getAllPointingSettingsUrl, {}, { headers });
  }

  getClientsTotalPoints(
    token: string,
    countryId: number = 224,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      countryId: countryId.toString(),
    });

    return this.http.get(this.getClientsTotalPointsUrl, { headers });
  }

  addPoints(
    token: string,
    pointingCheckpoint: number,
    isHolded: boolean,
    countryId: number = 224,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      countryId: countryId.toString(),
      'Content-Type': 'application/json',
    });

    const body = {
      pointingCheckpoint,
      isHolded,
    };

    return this.http.post(this.addPointsUrl, body, { headers });
  }
}
