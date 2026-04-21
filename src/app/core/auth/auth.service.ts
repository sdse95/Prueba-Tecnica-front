import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser, LoginRequest, RefreshRequest, RegisterRequest } from './models/auth.models';

const STORAGE_TOKEN = 'auth_token';
const STORAGE_REFRESH_TOKEN = 'auth_refresh_token';
const STORAGE_USER = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly authStateSubject = new BehaviorSubject<boolean>(this.hasStoredToken());
  readonly isAuthenticated$ = this.authStateSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, payload)
      .pipe(tap((response) => this.setSession(response)));
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, payload)
      .pipe(tap((response) => this.setSession(response)));
  }

  refresh(payload?: RefreshRequest): Observable<AuthResponse> {
    const body: RefreshRequest = payload ?? { refreshToken: this.getRefreshToken() ?? '' };
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/refresh`, body)
      .pipe(tap((response) => this.setSession(response)));
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_REFRESH_TOKEN);
  }

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_USER);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  getRoles(): string[] {
    const fromUser = this.getUser()?.roles ?? [];
    const fromToken = this.extractRolesFromToken(this.getToken());
    const merged = [...fromUser, ...fromToken]
      .filter((role): role is string => typeof role === 'string' && role.trim().length > 0)
      .map((role) => role.toLowerCase());
    return Array.from(new Set(merged));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    this.authStateSubject.next(false);
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem(STORAGE_TOKEN, response.token);
    if (response.refreshToken) {
      localStorage.setItem(STORAGE_REFRESH_TOKEN, response.refreshToken);
    } else {
      localStorage.removeItem(STORAGE_REFRESH_TOKEN);
    }
    if (response.user) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(response.user));
    } else {
      localStorage.removeItem(STORAGE_USER);
    }
    this.authStateSubject.next(true);
  }

  private hasStoredToken(): boolean {
    return !!localStorage.getItem(STORAGE_TOKEN);
  }

  private extractRolesFromToken(token: string | null): string[] {
    if (!token) {
      return [];
    }
    const parts = token.split('.');
    if (parts.length < 2) {
      return [];
    }
    try {
      const payloadJson = this.base64UrlDecode(parts[1]);
      const payload = JSON.parse(payloadJson) as Record<string, unknown>;
      const roleKeys = [
        'role',
        'roles',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
      ];
      const roles: string[] = [];
      for (const key of roleKeys) {
        const value = payload[key];
        if (typeof value === 'string') {
          roles.push(value);
        } else if (Array.isArray(value)) {
          roles.push(...value.filter((v): v is string => typeof v === 'string'));
        }
      }
      return roles;
    } catch {
      return [];
    }
  }

  private base64UrlDecode(input: string): string {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
  }
}
