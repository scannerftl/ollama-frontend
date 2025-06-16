import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  id: number;
  conversationId: number;
  content: string;
  sender: string;
  timestamp: Date;
  sent: boolean;
  isUser?: boolean; // Propriété optionnelle pour le frontend
}

export interface Conversation {
  id: string | number;
  title: string;
  lastMessage?: string;
  updatedAt: string | Date;
  unreadCount?: number;
  messages?: Message[];
  participants: string[];
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8080/api'; // Remplacez par l'URL de votre backend

  constructor(private http: HttpClient) { }

  // Gestion des conversations
  getConversations(userId: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/discussions/user/${userId}`);
  }

  getConversation(conversationId: number): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/discussions/${conversationId}`);
  }

  createConversation(participants: string[], title: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/discussions`, {
      participants,
      title
    });
  }

  // Gestion des messages
  getMessages(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/discussions/${conversationId}/messages`);
  }

  sendMessage(conversationId: number, content: string): Observable<Message> {
    return this.http.post<Message>(
      `${this.apiUrl}/discussions/${conversationId}/messages`,
      { content }
    );
  }

  // Authentification
  login(credentials: { username: string; password: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/login`, credentials);
  }

  register(user: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, user);
  }

  // Gestion des utilisateurs
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`);
  }
}
