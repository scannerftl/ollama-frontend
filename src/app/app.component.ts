import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
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

import { ApiService, Conversation, Message } from './services/api.service';
import { TruncatePipe } from './pipes/truncate.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
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
export class AppComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  newMessage = '';
  isLoading = false;
  
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  
  ngOnInit() {
    this.loadConversations();
  }
  
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  
  loadConversations() {
    this.isLoading = true;
    
    // Simuler le chargement des conversations
    setTimeout(() => {
      this.conversations = [
        {
          id: '1',
          name: 'Première conversation',
          title: 'Première conversation',
          lastMessage: 'Bonjour, comment ça va ?',
          updatedAt: new Date().toISOString(),
          participants: [],
          messages: [],
          createdAt: new Date().toISOString(),
          messageCount: 0
        } as Conversation
      ];
      this.isLoading = false;
    }, 1000);
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
            conversationId: conversationId,
            content: 'Bonjour, comment puis-je vous aider ?',
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            sent: true,
            isUser: false
          } as Message
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
      conversationId: this.selectedConversation.id,
      content: this.newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      sent: true,
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
    
    // Simuler une réponse automatique après un délai
    setTimeout(() => {
      if (this.selectedConversation) {
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          conversationId: this.selectedConversation.id,
          content: 'Je suis une réponse automatique. Comment puis-je vous aider ?',
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          sent: true,
          isUser: false
        } as Message;
        
        if (!this.selectedConversation.messages) {
          this.selectedConversation.messages = [];
        }
        
        this.selectedConversation.messages.push(reply);
        this.selectedConversation.lastMessage = reply.content;
        this.selectedConversation.updatedAt = new Date().toISOString();
      }
    }, 1000);
  }
  
  createNewConversation() {
    const title = prompt('Nom de la conversation:');
    if (title) {
      const now = new Date().toISOString();
      const newConversation: Conversation = {
        id: Date.now().toString(),
        name: title,
        title: title,
        participants: [],
        createdAt: now,
        updatedAt: now,
        messageCount: 0,
        messages: []
      } as Conversation;
      
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
