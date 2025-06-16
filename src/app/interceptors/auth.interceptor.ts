import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Récupérer le token depuis le stockage local
    const token = localStorage.getItem('auth_token');
    
    // Si le token existe, on l'ajoute au header Authorization
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Si l'erreur est une non-authentification (401), on redirige vers la page de connexion
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}

export { AuthInterceptor };
