import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { ToastService } from '../../../core/services/toast.service';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
}

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PasswordModule,
    ButtonModule,
    ToggleSwitchModule,
    DividerModule,
  ],
  templateUrl: './security-settings.component.html',
})
export class SecuritySettingsComponent {
  private toastService = inject(ToastService);

  isSaving = signal(false);
  showPasswordForm = signal(false);

  passwordForm: PasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  // Security settings
  twoFactorEnabled = signal(false);
  loginNotifications = signal(true);

  // Password strength checker
  passwordStrength = computed(() => {
    const password = this.passwordForm.newPassword;
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 5) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  });

  // Mock active sessions
  sessions: Session[] = [
    {
      id: '1',
      device: 'Windows PC',
      browser: 'Chrome 120',
      location: 'New York, US',
      lastActive: 'Active now',
      current: true,
    },
    {
      id: '2',
      device: 'iPhone 15',
      browser: 'Safari Mobile',
      location: 'New York, US',
      lastActive: '2 hours ago',
      current: false,
    },
    {
      id: '3',
      device: 'MacBook Pro',
      browser: 'Firefox 121',
      location: 'Boston, US',
      lastActive: 'Yesterday',
      current: false,
    },
  ];

  // Password requirement helpers
  hasMinLength(): boolean {
    return this.passwordForm.newPassword.length >= 8;
  }

  hasUpperAndLower(): boolean {
    return /[A-Z]/.test(this.passwordForm.newPassword) && /[a-z]/.test(this.passwordForm.newPassword);
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.passwordForm.newPassword);
  }

  passwordValid = computed(() => {
    const form = this.passwordForm;
    return (
      form.currentPassword.length > 0 &&
      form.newPassword.length >= 8 &&
      form.newPassword === form.confirmPassword
    );
  });

  async changePassword() {
    if (!this.passwordValid()) return;

    this.isSaving.set(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    this.isSaving.set(false);
    this.showPasswordForm.set(false);
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    
    this.toastService.success('Password Changed', 'Your password has been updated successfully');
  }

  toggleTwoFactor() {
    if (this.twoFactorEnabled()) {
      this.toastService.info('2FA Disabled', 'Two-factor authentication has been disabled');
    } else {
      this.toastService.success('2FA Enabled', 'Two-factor authentication is now active');
    }
  }

  revokeSession(session: Session) {
    this.sessions = this.sessions.filter((s) => s.id !== session.id);
    this.toastService.success('Session Revoked', `${session.device} has been signed out`);
  }

  revokeAllSessions() {
    this.sessions = this.sessions.filter((s) => s.current);
    this.toastService.success('All Sessions Revoked', 'All other devices have been signed out');
  }
}
