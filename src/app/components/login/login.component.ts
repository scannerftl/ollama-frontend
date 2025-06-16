import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  error = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    const { username, password } = this.loginForm.value;

    this.apiService.login({ username, password })
      .pipe(
        finalize(() => this.isLoading = false),
        catchError(error => {
          this.error = 'Nom d\'utilisateur ou mot de passe incorrect';
          return of(null);
        })
      )
      .subscribe(response => {
        if (response && response.token) {
          localStorage.setItem('auth_token', response.token);
          this.router.navigate(['/']);
        }
      });
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }
}
