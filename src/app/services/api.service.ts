import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, tap, map } from 'rxjs/operators';

// Interface pour les messages du frontend
export interface Message {
  id: number | string;  // Peut être un nombre ou une chaîne (UUID)
  conversationId: string;  // Toujours une chaîne pour supporter les UUID
  content: string;
  sender: string;
  timestamp: Date | string;  // Peut être une chaîne ISO ou un objet Date
  sent: boolean;
  isUser?: boolean; // Pour indiquer si le message provient de l'utilisateur
  isLoading?: boolean; // Pour afficher un indicateur de chargement
  error?: boolean; // Pour indiquer une erreur d'envoi
}

// Interface pour les messages de l'API
export interface ApiMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Interface pour les conversations renvoyées par l'API
export interface Conversation {
  id: string;  // UUID
  name: string;  // Le titre de la conversation
  createdAt: string;  // Date de création
  messageCount: number;  // Nombre de messages
  // Champs optionnels pour le frontend
  title?: string;  // Alias pour name pour la compatibilité
  updatedAt?: string | Date;  // Alias pour createdAt
  lastMessage?: string;  // Dernier message (optionnel)
  unreadCount?: number;  // Nombre de messages non lus (optionnel)
  messages?: Message[];  // Messages de la conversation (optionnel)
  participants?: string[];  // Participants (optionnel pour la compatibilité)
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // URL directe vers le serveur backend
  private apiUrl = 'http://localhost:8080/api';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Gestion des erreurs HTTP
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => errorMessage);
  }

  // Gestion des conversations
  getConversations(userId: string): Observable<Conversation[]> {
    // Utilisation de l'endpoint correct pour récupérer les conversations d'un utilisateur
    const url = `${this.apiUrl}/discussions/user/${userId}`;
    console.log('URL de récupération des conversations:', url);
    
    return this.http.get<any[]>(url, this.httpOptions)
      .pipe(
        tap(conversations => {
          console.log('Données brutes des conversations reçues:', conversations);
        }),
        // Transformer les données pour correspondre à l'interface Conversation
        map(apiConversations => {
          if (!apiConversations || !Array.isArray(apiConversations)) {
            console.warn('La réponse de l\'API n\'est pas un tableau valide:', apiConversations);
            return [];
          }
          
          return apiConversations.map(conv => ({
            id: conv.id?.toString() || Math.random().toString(36).substr(2, 9),
            name: conv.name || 'Nouvelle conversation',
            title: conv.title || conv.name || 'Nouvelle conversation',
            createdAt: conv.createdAt || new Date().toISOString(),
            updatedAt: conv.updatedAt || conv.createdAt || new Date().toISOString(),
            messageCount: conv.messageCount || 0,
            lastMessage: conv.lastMessage,
            participants: conv.participants || [userId],
            messages: conv.messages || [],
            unreadCount: conv.unreadCount || 0
          } as Conversation));
        }),
        tap(conversations => {
          console.log('Conversations transformées:', conversations);
        }),
        catchError(error => {
          console.error('Erreur lors de la récupération des conversations:', error);
          // Afficher un message d'erreur plus détaillé
          if (error.status === 404) {
            console.error('Endpoint non trouvé. Vérifiez que le backend est en cours d\'exécution et que l\'URL est correcte.');
          } else if (error.status === 0) {
            console.error('Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d\'exécution et accessible.');
          }
          // Retourner un tableau vide en cas d'erreur
          return of([]);
        })
      );
    
  }

  getConversation(conversationId: number): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/discussions/${conversationId}`, this.httpOptions)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  createConversation(participants: string[], title: string): Observable<Conversation> {
    return this.http.post<Conversation>(
      `${this.apiUrl}/discussions`,
      { participants, title },
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Gestion des messages
  getMessages(conversationId: string, userId: string): Observable<Message[]> {
    // Construire l'URL avec le paramètre userId
    const url = `${this.apiUrl}/discussions/${conversationId}/messages?userId=${encodeURIComponent(userId)}`;
    console.log('Tentative de récupération des messages depuis:', url);
    console.log('Type de conversationId:', typeof conversationId, 'Valeur:', conversationId);
    
    return this.http.get<ApiMessage[]>(
      url,
      this.httpOptions
    ).pipe(
      tap({
        next: (response: ApiMessage[]) => console.log('Réponse reçue:', response),
        error: (error: any) => console.error('Erreur lors de la récupération des messages:', error)
      } as any),
      // Convertir les messages de l'API vers le format du frontend
      map((apiMessages: ApiMessage[]) => 
        apiMessages.map(msg => ({
          id: msg.id.toString(), // Convertir en chaîne
          conversationId: conversationId, // Utiliser l'ID de conversation fourni
          content: msg.content,
          sender: msg.role,
          timestamp: msg.timestamp, // Laisser en tant que chaîne, sera converti si nécessaire
          sent: true,
          isUser: msg.role === 'user'
        } as Message))
      ),
      retry(3),
      catchError(this.handleError)
    );
  }

  sendMessage(conversationId: string | number, content: string): Observable<Message> {
    // Convertir l'ID en chaîne pour l'URL
    const id = conversationId.toString();
    const userId = 'leonel'; // Remplacer par l'ID utilisateur réel si disponible
    
    // Créer le corps de la requête selon le format attendu par le backend
    const requestBody = {
      prompt: content,
      model: 'llama3-8b-8192', // Modèle par défaut
      discussionId: id,
      userId: userId
    };

    return this.http.post<{
      response: string;
      discussionId: string;
      discussionName: string;
    }>(
      `${this.apiUrl}/prompt`,
      requestBody,
      this.httpOptions
    ).pipe(
      map(response => {
        // Créer un objet Message à partir de la réponse
        const message: Message = {
          id: Date.now().toString(), // ID temporaire
          conversationId: response.discussionId,
          content: response.response,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          sent: true,
          isUser: false
        };
        return message;
      }),
      catchError(this.handleError)
    );
  }

  // Authentification
  login(credentials: { username: string; password: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.apiUrl}/auth/login`,
      credentials,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  register(user: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/register`,
      user,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Gestion des utilisateurs
  getCurrentUser(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/users/me`,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }
}
