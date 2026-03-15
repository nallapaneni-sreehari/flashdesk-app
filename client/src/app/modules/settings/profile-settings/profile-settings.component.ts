import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { AvatarModule } from 'primeng/avatar';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  timezone: string;
  bio: string;
  jobTitle: string;
  department: string;
}

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    SelectModule,
    AvatarModule,
  ],
  templateUrl: './profile-settings.component.html',
})
export class ProfileSettingsComponent {
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  // Parse name into first/last
  firstName = computed(() => {
    const name = this.currentUser()?.name ?? '';
    return name.split(' ')[0] ?? '';
  });

  lastName = computed(() => {
    const name = this.currentUser()?.name ?? '';
    const parts = name.split(' ');
    return parts.slice(1).join(' ') ?? '';
  });

  isSaving = signal(false);
  avatarHover = signal(false);

  form: ProfileForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '+1 (555) 123-4567',
    timezone: 'America/New_York',
    bio: '',
    jobTitle: 'Support Agent',
    department: 'Customer Success',
  };

  timezones = [
    { label: 'Eastern Time (ET)', value: 'America/New_York' },
    { label: 'Central Time (CT)', value: 'America/Chicago' },
    { label: 'Mountain Time (MT)', value: 'America/Denver' },
    { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
    { label: 'UTC', value: 'UTC' },
    { label: 'London (GMT)', value: 'Europe/London' },
    { label: 'Paris (CET)', value: 'Europe/Paris' },
  ];

  departments = [
    { label: 'Customer Success', value: 'Customer Success' },
    { label: 'Technical Support', value: 'Technical Support' },
    { label: 'Sales', value: 'Sales' },
    { label: 'Engineering', value: 'Engineering' },
    { label: 'Product', value: 'Product' },
  ];

  constructor() {
    // Initialize form with current user data
    setTimeout(() => {
      const user = this.currentUser();
      if (user) {
        this.form.firstName = this.firstName();
        this.form.lastName = this.lastName();
        this.form.email = user.email;
      }
    });
  }

  onAvatarUpload() {
    // Trigger file input (mock implementation)
    this.toastService.info('Avatar Upload', 'File upload will be available soon');
  }

  async saveProfile() {
    this.isSaving.set(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.isSaving.set(false);
    this.toastService.success('Profile Updated', 'Your changes have been saved successfully');
  }
}
