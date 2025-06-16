import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatInputModule
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="sidenav.toggle()">
        <mat-icon>menu</mat-icon>
      </button>
      <span>Ollama Chat</span>
      <span class="spacer"></span>
      <button mat-icon-button>
        <mat-icon>account_circle</mat-icon>
      </button>
    </mat-toolbar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" opened>
        <div class="sidenav-header">
          <h2>Conversations</h2>
          <button mat-icon-button>
            <mat-icon>add</mat-icon>
          </button>
        </div>
        <mat-nav-list>
          <mat-list-item *ngFor="let conv of conversations" (click)="selectConversation(conv)">
            <mat-icon matListItemIcon>chat_bubble_outline</mat-icon>
            <div matListItemTitle>{{ conv.title }}</div>
            <div matListItemLine>{{ conv.lastMessage }}</div>
          </mat-list-item>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <div class="chat-container">
          <div class="messages">
            <div *ngFor="let msg of messages" class="message" [class.sent]="msg.sent">
              <div class="message-content">{{ msg.content }}</div>
              <div class="message-time">{{ msg.time | date:'shortTime' }}</div>
            </div>
          </div>
          <div class="message-input">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Écrivez un message...</mat-label>
              <input matInput [(ngModel)]="newMessage" (keyup.enter)="sendMessage()">
              <button mat-icon-button matSuffix (click)="sendMessage()">
                <mat-icon>send</mat-icon>
              </button>
            </mat-form-field>
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    .sidenav-container {
      height: calc(100vh - 64px);
    }
    .sidenav {
      width: 300px;
      border-right: 1px solid #e0e0e0;
    }
    .sidenav-header {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e0e0e0;
    }
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #f5f5f5;
    }
    .messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
    }
    .message {
      max-width: 70%;
      margin-bottom: 12px;
      padding: 8px 12px;
      border-radius: 18px;
      background: #e3f2fd;
      align-self: flex-start;
    }
    .message.sent {
      align-self: flex-end;
      background: #e8f5e9;
    }
    .message-time {
      font-size: 0.75rem;
      color: #666;
      text-align: right;
    }
    .message-input {
      padding: 16px;
      background: white;
      border-top: 1px solid #e0e0e0;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class AppComponent {
  conversations = [
    { id: 1, title: 'Discussion 1', lastMessage: 'Dernier message...' },
    { id: 2, title: 'Discussion 2', lastMessage: 'Salut ! Comment ça va ?' },
  ];

  messages = [
    { id: 1, content: 'Bonjour !', sent: false, time: new Date() },
    { id: 2, content: 'Comment puis-je vous aider ?', sent: false, time: new Date() },
  ];

  newMessage = '';

  selectConversation(conversation: any) {
    console.log('Conversation sélectionnée:', conversation);
    // Implémentez la logique pour charger les messages de la conversation
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        id: this.messages.length + 1,
        content: this.newMessage,
        sent: true,
        time: new Date()
      });
      this.newMessage = '';
      // Faites défiler vers le bas de la zone de messages
      setTimeout(() => {
        const messagesContainer = document.querySelector('.messages');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      });
    }
  }
}
