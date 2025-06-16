import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userIdSubject = new BehaviorSubject<string | null>(null);

  constructor(private cookieService: CookieService) {
    // Vérifier si un userId existe dans les cookies au démarrage
    const savedUserId = this.cookieService.getUserId();
    if (savedUserId) {
      this.userIdSubject.next(savedUserId);
    }
  }

  // Obtenir l'observable du userId
  getUserId$() {
    return this.userIdSubject.asObservable();
  }

  // Obtenir la valeur actuelle du userId
  getUserId(): string | null {
    return this.userIdSubject.value;
  }

  // Définir le userId et le sauvegarder dans les cookies
  setUserId(userId: string, rememberMe: boolean = true): void {
    if (!userId || userId.trim() === '') {
      console.error('Le userId ne peut pas être vide');
      return;
    }
    
    // Sauvegarder dans les cookies
    if (rememberMe) {
      this.cookieService.setUserId(userId);
    }
    
    this.userIdSubject.next(userId);
  }

  // Vérifier si un utilisateur est connecté
  isLoggedIn(): boolean {
    return !!this.userIdSubject.value;
  }

  // Déconnecter l'utilisateur
  logout(): void {
    this.cookieService.deleteUserId();
    this.userIdSubject.next(null);
  }
}
