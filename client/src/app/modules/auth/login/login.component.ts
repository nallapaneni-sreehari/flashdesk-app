import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    DividerModule,
    MessageModule,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Form fields
  email = '';
  password = '';
  rememberMe = false;
  showPassword = signal(false);

  // State from service
  isLoading = this.authService.isLoading;
  error = this.authService.error;
  ssoProviders = this.authService.ssoProviders;

  // SSO loading state
  ssoLoadingProvider = signal<string | null>(null);

  async onSubmit() {
    if (!this.email || !this.password) {
      return;
    }

    this.authService.clearError();
    
    const success = await this.authService.login({
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe,
    });

    if (success) {
      this.navigateAfterLogin();
    }
  }

  async onSSOLogin(providerId: string) {
    this.ssoLoadingProvider.set(providerId);
    this.authService.clearError();

    const success = await this.authService.ssoLogin(providerId);
    
    this.ssoLoadingProvider.set(null);
    
    if (success) {
      this.navigateAfterLogin();
    }
  }

  private navigateAfterLogin() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    this.router.navigateByUrl(returnUrl || this.authService.getDefaultRoute());
  }

  togglePasswordVisibility() {
    this.showPassword.update((v) => !v);
  }
}
