import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CustomCity {
  id: number;
  name: string;
  region: string | null;
  latitude: number;
  longitude: number;
  sun_hours: number | null;
  wind_speed: number | null;
  user_id: number;
  user?: { id: number; name: string };
}

@Injectable({
  providedIn: 'root'
})
export class CustomCityService {
  private apiUrl = 'https://zestful-joy-production-291d.up.railway.app/api/custom-cities';

  constructor(private http: HttpClient) {}

  getAll(): Observable<CustomCity[]> {
    return this.http.get<CustomCity[]>(this.apiUrl);
  }

  create(data: { name: string; region?: string | null; latitude: number; longitude: number; sun_hours?: number | null; wind_speed?: number | null }): Observable<CustomCity> {
    return this.http.post<CustomCity>(this.apiUrl, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}