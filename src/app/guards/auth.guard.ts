import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
class AuthGuard implements CanActivate {
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return of(this.router.createUrlTree(['/login']));
    }

    // Vérifier la validité du token auprès du serveur
    return this.apiService.getCurrentUser().pipe(
      map(user => {
        if (user) {
          return true;
        } else {
          localStorage.removeItem('auth_token');
          return this.router.createUrlTree(['/login']);
        }
      }),
      catchError(() => {
        localStorage.removeItem('auth_token');
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}

export { AuthGuard };
