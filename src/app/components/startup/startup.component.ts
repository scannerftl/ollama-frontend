import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-startup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  template: `
    <div class="startup-container">
      <div class="startup-card">
        <h1>Bienvenue sur Ollama Chat</h1>
        <p>Veuillez entrer votre identifiant utilisateur pour commencer</p>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Identifiant utilisateur</mat-label>
            <input matInput formControlName="userId" placeholder="Entrez votre ID" required>
            <mat-error *ngIf="loginForm.get('userId')?.hasError('required')">
              L'identifiant est requis
            </mat-error>
          </mat-form-field>
          
          <mat-checkbox formControlName="rememberMe" class="remember-me">
            Se souvenir de moi
          </mat-checkbox>
          
          <button 
            mat-raised-button 
            color="primary" 
            type="submit" 
            [disabled]="!loginForm.valid || isLoading"
            class="submit-button"
          >
            <span *ngIf="!isLoading">Commencer</span>
            <mat-spinner *ngIf="isLoading" diameter="24"></mat-spinner>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .startup-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
      padding: 20px;
    }
    
    .startup-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    
    h1 {
      color: #3f51b5;
      margin-bottom: 0.5rem;
    }
    
    p {
      color: #666;
      margin-bottom: 2rem;
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .full-width {
      width: 100%;
    }
    
    .remember-me {
      align-self: flex-start;
      margin-bottom: 1rem;
    }
    
    .submit-button {
      height: 48px;
      font-size: 1rem;
    }
    
    mat-spinner {
      margin: 0 auto;
    }
  `]
})
export class StartupComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userId: ['', [Validators.required, Validators.minLength(3)]],
      rememberMe: [true]
    });
  }


  ngOnInit(): void {
    // Si l'utilisateur est déjà connecté, rediriger vers la page de chat
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/chat']);
    }
  }

  /**
   * Gère la soumission du formulaire de connexion
   * Valide le formulaire, enregistre l'utilisateur et redirige vers la page de chat
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { userId, rememberMe } = this.loginForm.value;
      
      try {
        // Enregistrer l'ID utilisateur dans le service d'authentification
        this.authService.setUserId(userId, rememberMe);
        
        // Rediriger vers la page de chat
        this.router.navigate(['/chat'])
          .then(success => {
            if (!success) {
              console.error('Échec de la navigation vers /chat');
              this.showError('Impossible de charger la page de chat');
            }
          })
          .catch(error => {
            console.error('Erreur lors de la navigation:', error);
            this.showError('Une erreur est survenue lors de la redirection');
          });
      } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        this.showError('Une erreur est survenue lors de la connexion');
      } finally {
        this.isLoading = false;
      }
    }
  }
  
  /**
   * Affiche un message d'erreur à l'utilisateur
   * @param message Le message d'erreur à afficher
   */
  private showError(message: string): void {
    // Ici, vous pouvez utiliser un service de notification ou une autre méthode d'affichage
    console.error(message);
    // Exemple avec une alerte simple
    alert(message);
  }
}
