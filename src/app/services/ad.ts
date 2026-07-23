import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Advertisement {
  id: number;
  company_name: string;
  title: string;
  description: string;
  image_url: string;
  target_url: string;
  cta_label: string;
  status?: 'pending' | 'active' | 'rejected';
  contact_email?: string;
  start_date?: string;
  end_date?: string;
  clicks_count?: number;
  rejection_reason?: string;
  created_at?: string;
}

export interface AdSubmission {
  company_name: string;
  title: string;
  description: string;
  target_url: string;
  cta_label?: string;
  contact_email: string;
  image: File;
}

export interface PaginatedAds {
  data: Advertisement[];
  current_page: number;
  last_page: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class AdService {
  private baseUrl = `${environment.apiUrl}/ads`;

  constructor(private http: HttpClient) {}

  // ===== Public =====

  getActiveAds(): Observable<Advertisement[]> {
    return this.http.get<Advertisement[]>(`${this.baseUrl}/active`);
  }

  trackClick(adId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${adId}/click`, {});
  }

  submitAd(payload: AdSubmission): Observable<any> {
    const formData = new FormData();
    formData.append('company_name', payload.company_name);
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('target_url', payload.target_url);
    formData.append('contact_email', payload.contact_email);
    if (payload.cta_label) {
      formData.append('cta_label', payload.cta_label);
    }
    formData.append('image', payload.image);

    return this.http.post(`${this.baseUrl}/submit`, formData);
  }

  // ===== Admin =====

  getAllAds(status?: string, page: number = 1): Observable<PaginatedAds> {
    let url = `${environment.apiUrl}/admin/ads?page=${page}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<PaginatedAds>(url);
  }

  approveAd(adId: number, startDate?: string, endDate?: string): Observable<Advertisement> {
    return this.http.post<Advertisement>(`${environment.apiUrl}/admin/ads/${adId}/approve`, {
      start_date: startDate || null,
      end_date: endDate || null
    });
  }

  rejectAd(adId: number, reason?: string): Observable<Advertisement> {
    return this.http.post<Advertisement>(`${environment.apiUrl}/admin/ads/${adId}/reject`, {
      reason: reason || null
    });
  }

  suspendAd(adId: number): Observable<Advertisement> {
    return this.http.post<Advertisement>(`${environment.apiUrl}/admin/ads/${adId}/suspend`, {});
  }

  deleteAd(adId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/admin/ads/${adId}`);
  }
}