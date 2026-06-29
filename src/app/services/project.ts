import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id?: number;
  type: 'solaire' | 'eolien';
  name: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  input_data: any;
  result_data: any;
  total_cost: number;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  static selectedProject: any = null;
  private apiUrl = 'https://zestful-joy-production-291d.up.railway.app/api/projects';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  create(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteAll(): Observable<any> {
    return this.http.delete(this.apiUrl);
  }
}
