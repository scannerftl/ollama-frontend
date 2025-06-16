import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private readonly COOKIE_NAME = 'ollama_user_id';

  constructor() {}

  setUserId(userId: string, days: number = 30): void {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${this.COOKIE_NAME}=${userId};${expires};path=/`;
  }

  getUserId(): string | null {
    const name = `${this.COOKIE_NAME}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return null;
  }

  deleteUserId(): void {
    document.cookie = `${this.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}
