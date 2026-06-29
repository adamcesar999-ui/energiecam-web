import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PvgisData {
  source: string;
  lat: number;
  lon: number;
  sun_hours_per_day: number;
  monthly: any[];
  yearly_total_kwh: number;
  note?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PvgisService {
  private apiUrl = 'https://zestful-joy-production-291d.up.railway.app/api/pvgis/solar';

  constructor(private http: HttpClient) {}

  getSolarData(lat: number, lon: number): Observable<PvgisData> {
    return this.http.get<PvgisData>(`${this.apiUrl}?lat=${lat}&lon=${lon}`);
  }
}
