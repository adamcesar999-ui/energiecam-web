import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PriceComparisonService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/compare/types`);
  }

  getCities(): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/compare/cities`);
  }

  comparePrices(type: string): Observable<any> {
    return this.http.get<any>(`${this.api}/compare/prices?type=${type}`);
  }

  getSuppliers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/suppliers`);
  }
}
