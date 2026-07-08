import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  readonly #auth = inject(AuthService);
  readonly #router = inject(Router);

  canActivate(): boolean {
    if (this.#auth.isAuthenticated()) return true;
    this.#router.navigate(['/login']);
    return false;
  }
}
