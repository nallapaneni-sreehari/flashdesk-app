import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, ApiResponse } from './api.service';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'admin' | 'agent' | 'customer';
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  token: string;
  user: User;
  workspace: Workspace;
}

export interface SSOProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const STORAGE_KEY = 'flashdesk_auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private api = inject(ApiService);

  // SSO Providers
  readonly ssoProviders: SSOProvider[] = [
    { id: 'google', name: 'Google', icon: 'pi pi-google', color: 'bg-white hover:bg-gray-50 border border-gray-300 text-gray-700' },
    { id: 'microsoft', name: 'Microsoft', icon: 'pi pi-microsoft', color: 'bg-[#2F2F2F] hover:bg-[#1F1F1F] text-white' },
  ];

  // State
  private _currentUser = signal<User | null>(null);
  private _workspace = signal<Workspace | null>(null);
  private _token = signal<string | null>(null);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  // Public computed values
  readonly currentUser = this._currentUser.asReadonly();
  readonly workspace = this._workspace.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly userRole = computed(() => this._currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');
  readonly isAgent = computed(() => this._currentUser()?.role === 'agent' || this._currentUser()?.role === 'admin');

  constructor() {
    this.loadStoredSession();
  }

  /**
   * Load session from localStorage on app init
   */
  private loadStoredSession(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        if (session.user && session.token && session.expiry > Date.now()) {
          this._currentUser.set(session.user);
          this._workspace.set(session.workspace ?? null);
          this._token.set(session.token);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Store session in localStorage
   */
  private storeSession(user: User, token: string, workspace: Workspace | null, rememberMe: boolean): void {
    const session = {
      user,
      token,
      workspace,
      // Remember me = 30 days, otherwise 24 hours
      expiry: Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const res = await firstValueFrom(
        this.api.post<LoginResponse>('/auth/login', {
          email: credentials.email,
          password: credentials.password,
        })
      );

      const { token, user, workspace } = res.data;

      this._currentUser.set(user);
      this._workspace.set(workspace);
      this._token.set(token);
      this.storeSession(user, token, workspace, credentials.rememberMe ?? false);
      this._isLoading.set(false);
      return true;
    } catch (err: any) {
      const message =
        err?.error?.error?.message || 'An error occurred. Please try again.';
      this._error.set(message);
      this._isLoading.set(false);
      return false;
    }
  }

  /**
   * SSO Login (not yet implemented on backend)
   */
  async ssoLogin(providerId: string): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    // TODO: Implement real SSO flow when backend supports it
    this._error.set(`SSO login with ${providerId} is not yet available.`);
    this._isLoading.set(false);
    return false;
  }

  /**
   * Logout
   */
  logout(): void {
    this._currentUser.set(null);
    this._workspace.set(null);
    this._token.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  /**
   * Clear error
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Check if user has required role
   */
  hasRole(roles: ('admin' | 'agent' | 'customer')[]): boolean {
    const userRole = this._currentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Get redirect URL after login based on role
   */
  getDefaultRoute(): string {
    const role = this._currentUser()?.role;
    switch (role) {
      case 'customer':
        return '/portal';
      default:
        return '/dashboard';
    }
  }
}
