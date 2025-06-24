import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
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
  private RedeemPointsUrl = `${environment.apiUrl}/${ApiEndPoint.RedeemingPoints}`;

  private get countryId(): string {
    const country = localStorage.getItem('country');
    return country === 'SA' ? '103' : '224'; // Default to EG (224) if not SA
  }

  constructor(private http: HttpClient) {}

  getClientPointsPreview(
    token: string,
    activeTab: number = 1,
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Observable<any> {
    if (!token) {
      throw new Error('No access token provided');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      countryId: this.countryId,
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

  getAllPointingSettings(token: string): Observable<any> {
    if (!token) {
      throw new Error('No access token provided');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      countryId: this.countryId,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.getAllPointingSettingsUrl, {}, { headers });
  }

  getClientsTotalPoints(token: string): Observable<any> {
    if (!token) {
      throw new Error('No access token provided');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      countryId: this.countryId,
    });

    return this.http.get(this.getClientsTotalPointsUrl, { headers });
  }

  addPoints(
    token: string,
    pointingCheckpoint: number,
    isHolded: boolean,
  ): Observable<any> {
    if (!token) {
      throw new Error('No access token provided');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      countryId: this.countryId,
      'Content-Type': 'application/json',
    });

    const body = {
      pointingCheckpoint,
      isHolded,
    };

    return this.http.post(this.addPointsUrl, body, { headers });
  }

  redeemingPoints(token: string, points: number): Observable<any> {
    if (!token) {
      throw new Error('No access token provided');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      countryId: this.countryId,
    });

    return this.http.post(
      `${this.RedeemPointsUrl}?NumberOfPoints=${points}`,
      {},
      { headers },
    );
  }
}
