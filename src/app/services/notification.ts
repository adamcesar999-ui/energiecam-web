import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AppNotification {
  id: number;
  text: string;
  read: boolean;
  created_at: string;
  from_user_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.apiUrl);
  }

  markAllRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-read`, {});
  }

  markOneRead(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/read`, {});
  }
}