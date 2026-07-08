import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { User, LoginResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly #http = inject(HttpClient);
  readonly #router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly #token = signal<string | null>(null);

  constructor() {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      this.#token.set(savedToken);
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.#http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      tap((res) => this.#handleAuth(res))
    );
  }

  register(name: string, email: string, password: string): Observable<LoginResponse> {
    return this.#http.post<LoginResponse>('/api/auth/register', { name, email, password }).pipe(
      tap((res) => this.#handleAuth(res))
    );
  }

  getProfile(): Observable<User> {
    return this.#http.get<User>('/api/auth/profile');
  }

  updateProfile(name: string): Observable<User> {
    return this.#http.patch<User>('/api/auth/profile', { name });
  }

  getToken(): string | null {
    return this.#token();
  }

  logout(): void {
    this.#token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.#router.navigate(['/login']);
  }

  #handleAuth(res: LoginResponse): void {
    this.#token.set(res.token);
    this.currentUser.set(res.user);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }
}
