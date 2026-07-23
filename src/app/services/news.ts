import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NewsItem {
  id?: number;
  category: string;
  title: string;
  content: string;
  news_date: string;
  url?: string;
  image?: string;
  source?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
 private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<NewsItem[]> {
    return this.http.get<NewsItem[]>(`${this.apiUrl}/news`);
  }

  getLiveNews(): Observable<NewsItem[]> {
    return this.http.get<NewsItem[]>(`${this.apiUrl}/news/live`);
  }
}
