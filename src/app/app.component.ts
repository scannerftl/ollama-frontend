import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
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

import { ApiService, Conversation, Message, PromptResponse } from './services/api.service';
import { AuthService } from './services/auth.service';
import { TruncatePipe } from './pipes/truncate.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
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
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  newMessage = '';
  isLoading = false;
  
  private apiService = inject(ApiService);
  authService = inject(AuthService); // Rendre public pour le template
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  
  ngOnInit() {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/startup']);
      return;
    }
    
    // Rediriger vers le chat si l'utilisateur est déjà sur la page d'accueil
    if (this.router.url === '/') {
      this.router.navigate(['/chat']);
      return;
    }
    
    this.loadConversations();
  }

  ngOnDestroy() {
    // Nettoyage si nécessaire
  }

  // Déconnexion de l'utilisateur
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/startup']);
  }
  
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  
  loadConversations() {
    this.isLoading = true;
    
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('Aucun utilisateur connecté');
      this.router.navigate(['/startup']);
      return;
    }
    
    this.apiService.getDiscussions(userId).subscribe({
      next: (discussions) => {
        this.conversations = discussions;
        if (discussions.length > 0 && !this.selectedConversation) {
          this.selectConversation(discussions[0]);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des discussions:', error);
        this.showError('Impossible de charger les discussions');
        this.isLoading = false;
      }
    });
  }
  
  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    
    // Charger les messages de la conversation
    if (!conversation.messages || conversation.messages.length === 0) {
      this.loadMessages(conversation.id);
    }
  }
  
  loadMessages(conversationId: string) {
    this.isLoading = true;
    
    // Simuler le chargement des messages
    setTimeout(() => {
      if (this.selectedConversation) {
        this.selectedConversation.messages = [
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Bonjour, comment puis-je vous aider ?',
            timestamp: new Date().toISOString(),
            isUser: false
          }
        ];
      }
      this.isLoading = false;
    }, 500);
  }
  
  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedConversation) return;
    
    // Créer un nouveau message
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: this.newMessage,
      timestamp: new Date().toISOString(),
      isUser: true
    };
    
    // Ajouter le message à la conversation
    if (!this.selectedConversation.messages) {
      this.selectedConversation.messages = [];
    }
    
    this.selectedConversation.messages.push(newMessage);
    this.selectedConversation.lastMessage = this.newMessage;
    this.selectedConversation.updatedAt = new Date().toISOString();
    
    // Réinitialiser le champ de saisie
    this.newMessage = '';
    
    // Utiliser le service API pour envoyer le message
    this.apiService.sendPrompt(
      newMessage.content,
      'llama3-8b-8192',
      this.selectedConversation.id
    ).subscribe({
      next: (response: PromptResponse) => {
        if (this.selectedConversation) {
          const reply: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.response,
            timestamp: new Date().toISOString(),
            isUser: false
          };
          
          this.selectedConversation.messages.push(reply);
          this.selectedConversation.lastMessage = reply.content;
          this.selectedConversation.updatedAt = new Date().toISOString();
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi du message:', error);
        // Afficher un message d'erreur à l'utilisateur si nécessaire
      }
    });
  }
  
  createNewConversation() {
    const title = prompt('Nom de la conversation:');
    if (title) {
      const now = new Date().toISOString();
      const newConversation: Conversation = {
        id: Date.now().toString(),
        name: title,
        title: title,
        createdAt: now,
        updatedAt: now,
        messageCount: 0,
        messages: []
      };
      
      this.conversations = [newConversation, ...this.conversations];
      this.selectConversation(newConversation);
    }
  }
  
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) {
      console.error('Erreur lors du défilement:', err);
    }
  }
  
  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
