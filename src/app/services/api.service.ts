import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

// Interfaces communes
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string | Date;
  isUser: boolean;
  isLoading?: boolean;
  error?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  title: string;
  messages: Message[];
  messageCount: number;
  updatedAt: string | Date;
  lastMessage?: string;
  createdAt: string | Date;
}

// Alias pour maintenir la compatibilité
// Discussion est maintenant identique à Conversation
export type Discussion = Conversation;

export interface PromptRequest {
  prompt: string;
  model: string;
  discussionId: string | null;
  userId: string;
}

export interface PromptResponse {
  response: string;
  discussionId: string;
  discussionName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'http://localhost:8080/api';
  
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  private getHttpOptions() {
    // En-têtes HTTP de base
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inconnue est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else if (error.status) {
      // Erreur côté serveur
      errorMessage = `Erreur ${error.status}: ${error.statusText || 'Erreur inconnue'}`;
      if (error.error?.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    }
    
    console.error('Erreur API:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Crée une nouvelle discussion avec un message initial
   * @param message Le message initial
   * @param model Le modèle à utiliser (par défaut: llama3-8b-8192)
   * @returns Un Observable contenant la réponse du serveur
   */
  /**
   * Crée une nouvelle discussion avec un message initial
   * @param message Le message initial
   * @param model Le modèle à utiliser (par défaut: llama3-8b-8192)
   * @returns Un Observable contenant la réponse du serveur
   */
  createDiscussion(message: string, model: string = 'llama3-8b-8192'): Observable<PromptResponse> {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }
    
    // Créer la requête avec les paramètres attendus par le backend
    const request = {
      prompt: message,
      model: model,
      discussionId: null, // null pour indiquer une nouvelle discussion
      userId: userId
    };

    // Utiliser l'endpoint /api/prompt comme spécifié dans l'exemple Postman
    return this.http.post<PromptResponse>(
      `${this.apiUrl}/prompt`,
      request,
      this.getHttpOptions()
    ).pipe(
      catchError(error => {
        console.error('Erreur lors de la création de la discussion:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Envoie un prompt à l'API et retourne la réponse
   * @param prompt Le message de l'utilisateur
   * @param model Le modèle à utiliser (par défaut: llama3-8b-8192)
   * @param discussionId L'ID de la discussion en cours
   * @returns Un Observable contenant la réponse du serveur
   */
  /**
   * Envoie un prompt à l'API et retourne la réponse
   * @param prompt Le message de l'utilisateur
   * @param model Le modèle à utiliser (par défaut: llama3-8b-8192)
   * @param discussionId L'ID de la discussion en cours
   * @returns Un Observable contenant la réponse du serveur
   */
  sendPrompt(prompt: string, model: string, discussionId: string): Observable<PromptResponse> {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }
    
    // Créer la requête avec les paramètres attendus par le backend
    const request = {
      prompt: prompt,
      model: model || 'llama3-8b-8192',
      discussionId: discussionId,
      userId: userId
    };

    // Utiliser l'endpoint /api/prompt comme spécifié dans l'exemple Postman
    return this.http.post<PromptResponse>(
      `${this.apiUrl}/prompt`,
      request,
      this.getHttpOptions()
    ).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'envoi du message:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Récupère les discussions d'un utilisateur
   * @param userId L'identifiant de l'utilisateur
   * @returns Un Observable contenant la liste des discussions de l'utilisateur
   */
  getDiscussions(userId: string): Observable<Discussion[]> {
    return this.http.get<Discussion[]>(
      `${this.apiUrl}/discussions/user/${userId}`,
      this.getHttpOptions()
    ).pipe(
      map((discussions: any[]) => 
        (discussions || []).map((discussion: any) => ({
          id: discussion.id,
          name: discussion.name || 'Nouvelle discussion',
          title: discussion.title,
          lastMessage: discussion.lastMessage,
          updatedAt: discussion.updatedAt || new Date().toISOString(),
          messageCount: discussion.messageCount || 0,
          messages: discussion.messages || [],
          createdAt: discussion.createdAt || new Date().toISOString()
        }))
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les messages d'une discussion
   * @param discussionId L'identifiant de la discussion
   * @returns Un Observable contenant la liste des messages
   */
  getDiscussionMessages(discussionId: string): Observable<Message[]> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }
    
    // Ajouter le paramètre userId à l'URL
    const params = new HttpParams().set('userId', userId);
    
    return this.http.get<Message[]>(
      `${this.apiUrl}/discussions/${discussionId}/messages`,
      { ...this.getHttpOptions(), params }
    ).pipe(
      map((messages: any[]) => 
        (messages || []).map((msg: any) => ({
          id: msg.id?.toString() || Date.now().toString(),
          role: msg.role || (msg.isUser ? 'user' : 'assistant'),
          content: msg.content || msg.message || '',
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          isUser: msg.role === 'user'
        }))
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Supprime une discussion
   * @param discussionId L'identifiant de la discussion à supprimer
   * @returns Un Observable qui se complète une fois la suppression effectuée
   */
  deleteDiscussion(discussionId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/discussions/${discussionId}`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les informations de l'utilisateur connecté
   * @returns Un Observable contenant les informations de l'utilisateur
   */
  getCurrentUser(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/users/me`,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError)
    );
  }
}
