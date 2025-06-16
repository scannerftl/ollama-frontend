import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PromptResponse } from '../../services/api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ApiService, Conversation, Message } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatListModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    TruncatePipe
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  newMessage = '';
  isLoading = false;
  
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadConversations();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    // Nettoyage si nécessaire
  }

  loadConversations() {
    this.isLoading = true;
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.showError('Veuillez vous connecter pour accéder aux discussions');
      this.isLoading = false;
      this.router.navigate(['/startup']);
      return;
    }
    
    this.apiService.getDiscussions(userId).subscribe({
      next: (discussions) => {
        try {
          // Transformer les discussions pour correspondre à l'interface Conversation
          this.conversations = (discussions || []).map(discussion => ({
            ...discussion,
            title: discussion.name || 'Sans titre',
            name: discussion.name || 'Sans titre',
            updatedAt: discussion.updatedAt || discussion.createdAt || new Date(),
            createdAt: discussion.createdAt || new Date(),
            messageCount: discussion.messageCount || 0,
            messages: [] // Les messages seront chargés si nécessaire
          }));
          
          // Sélectionner la première conversation si aucune n'est sélectionnée
          if (this.conversations.length > 0 && !this.selectedConversation) {
            this.selectConversation(this.conversations[0]);
          }
          
          this.isLoading = false;
        } catch (error) {
          console.error('Erreur lors du traitement des discussions:', error);
          this.showError('Erreur lors du traitement des discussions');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des discussions:', error);
        this.showError('Impossible de charger les discussions. Veuillez réessayer plus tard.');
        this.isLoading = false;
      }
    });
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.scrollToBottom();
    this.loadMessages(conversation.id);
  }
  
  /**
   * Charge les messages d'une discussion
   * @param discussionId L'identifiant de la discussion
   */
  loadMessages(discussionId: string) {
    if (!discussionId || discussionId.startsWith('new-')) {
      return; // Ne pas charger les messages pour une nouvelle conversation
    }
    
    this.isLoading = true;
    
    this.apiService.getDiscussionMessages(discussionId).subscribe({
      next: (messages) => {
        if (this.selectedConversation) {
          this.selectedConversation.messages = messages;
          this.scrollToBottom();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des messages:', error);
        this.showError('Impossible de charger les messages de la discussion');
        this.isLoading = false;
      }
    });
  }

  createNewConversation() {
    const newConversation: Conversation = {
      id: 'new-' + Date.now(),
      name: 'Nouvelle conversation',
      title: 'Nouvelle conversation',
      messages: [],
      messageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.conversations = [newConversation, ...this.conversations];
    this.selectConversation(newConversation);
  }

  sendMessage() {
    if (!this.selectedConversation || !this.newMessage.trim()) return;
    
    const userId = this.authService.getUserId();
    if (!userId) {
      this.showError('Utilisateur non connecté');
      return;
    }
    
    // Créer le message utilisateur
    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: this.newMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    // Ajouter le message de l'utilisateur à la conversation
    this.selectedConversation.messages = [...(this.selectedConversation.messages || []), userMessage];
    
    const messageContent = this.newMessage;
    this.newMessage = '';
    this.scrollToBottom();
    
    // Envoyer le message au backend
    this.isLoading = true;
    
    // Si c'est une nouvelle conversation, on crée d'abord la discussion
    const isNewConversation = this.selectedConversation.id.startsWith('new-');
    
    // Fonction pour gérer la réponse du serveur
    const handleResponse = (response: PromptResponse) => {
      // Mettre à jour l'ID de la discussion si c'est une nouvelle conversation
      if (isNewConversation && response.discussionId) {
        this.selectedConversation!.id = response.discussionId;
        this.selectedConversation!.name = response.discussionName || 'Nouvelle discussion';
        this.selectedConversation!.title = response.discussionName || 'Nouvelle discussion';
      }
      
      // Créer le message de l'assistant
      const botMessage: Message = {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: response.response || 'Aucune réponse reçue',
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      // Mettre à jour la conversation avec la réponse
      this.selectedConversation!.messages = [...this.selectedConversation!.messages, botMessage];
      this.selectedConversation!.updatedAt = new Date().toISOString();
      this.selectedConversation!.messageCount = (this.selectedConversation?.messageCount || 0) + 1;
      
      this.scrollToBottom();
      this.isLoading = false;
      
      // Si c'est une nouvelle conversation, on recharge la liste des discussions
      if (isNewConversation) {
        this.loadConversations();
      }
    };
    
    // Fonction pour gérer les erreurs
    const handleError = (error: any) => {
      console.error('Erreur lors de l\'envoi du message:', error);
      this.showError('Erreur lors de l\'envoi du message: ' + (error?.message || 'Erreur inconnue'));
      this.isLoading = false;
      
      // Recharger la liste des discussions pour refléter les changements
      this.loadConversations();
    };
    
    // Exécuter la requête appropriée
    if (isNewConversation) {
      // Pour une nouvelle discussion, on utilise l'endpoint /discussions
      this.apiService.createDiscussion(messageContent, 'llama3-8b-8192')
        .subscribe({
          next: handleResponse,
          error: handleError
        });
    } else {
      // Pour une discussion existante, on utilise l'endpoint /chat
      this.apiService.sendPrompt(messageContent, 'llama3-8b-8192', this.selectedConversation.id)
        .subscribe({
          next: handleResponse,
          error: handleError
        });
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Erreur lors du défilement:', err);
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Formate le texte avec support du Markdown basique (gras avec *texte*)
   * @param text Le texte à formater
   * @returns Le texte formaté en HTML sécurisé
   */
  formatMessageText(text: string): SafeHtml {
    if (!text) return '';
    
    // Transformer le formatage Markdown en HTML
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **gras**
      .replace(/\*(.*?)\*/g, '<em>$1</em>')               // *italique*
      .replace(/\n/g, '<br>');                           // Sauts de ligne
    
    // Nettoyer et sécuriser le HTML
    return this.sanitizer.sanitize(SecurityContext.HTML, formattedText) || '';
  }
}
