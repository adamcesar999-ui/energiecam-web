import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = 'https://zestful-joy-production-291d.up.railway.app/api/ai';

  constructor(private http: HttpClient) {}

  chat(message: string, history: ChatHistoryEntry[] = []): Observable<{ response: string }> {
    return this.http.post<{ response: string }>(`${this.apiUrl}/chat`, { message, history });
  }

  recommend(data: {
    consumption: number;
    city: string;
    sun_hours: number;
    wind_speed: number;
    budget?: number;
  }): Observable<{ recommendation: string }> {
    return this.http.post<{ recommendation: string }>(`${this.apiUrl}/recommend`, data);
  }

  predict(data: {
    appliances: any[];
    current_consumption: number;
  }): Observable<{ prediction: string }> {
    return this.http.post<{ prediction: string }>(`${this.apiUrl}/predict`, data);
  }
}