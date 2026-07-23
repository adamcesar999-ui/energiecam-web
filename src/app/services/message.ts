import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatUser {
  id: number;
  name: string;
  role: string;
  online: boolean;
}

export interface Msg {
  id: number;
  from_user_id: number;
  to_user_id?: number;
  type: string;
  content: string;
  read: boolean;
  created_at: string;
  from_user?: { id: number; name: string; role: string };
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getChatUsers(): Observable<ChatUser[]> {
    return this.http.get<ChatUser[]>(`${this.apiUrl}/chat-users`);
  }

  getConversation(userId: number): Observable<Msg[]> {
    return this.http.get<Msg[]>(`${this.apiUrl}/messages/conversation/${userId}`);
  }

  sendPrivate(toUserId: number, content: string): Observable<Msg> {
    return this.http.post<Msg>(`${this.apiUrl}/messages/private`, { to_user_id: toUserId, content });
  }

  getForum(): Observable<Msg[]> {
    return this.http.get<Msg[]>(`${this.apiUrl}/messages/forum`);
  }

  postForum(content: string): Observable<Msg> {
    return this.http.post<Msg>(`${this.apiUrl}/messages/forum`, { content });
  }

  deleteForum(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/messages/forum/${id}`);
  }

  sendHelp(content: string): Observable<Msg> {
    return this.http.post<Msg>(`${this.apiUrl}/messages/help`, { content });
  }
}
