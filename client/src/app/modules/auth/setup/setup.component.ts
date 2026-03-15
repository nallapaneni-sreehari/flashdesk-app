import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { StepperModule } from 'primeng/stepper';
import { SetupService } from '../../../core/services/setup.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    StepperModule,
  ],
  templateUrl: './setup.component.html',
})
export class SetupComponent {
  private setupService = inject(SetupService);
  private router = inject(Router);

  // Step tracking
  currentStep = signal(1);
  totalSteps = 3;

  // Step 1 — Workspace
  workspaceName = '';
  slug = '';
  slugManuallyEdited = false;

  // Step 2 — Admin account
  adminName = '';
  adminEmail = '';
  adminPassword = '';
  showPassword = signal(false);

  // State
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Validation
  step1Valid(): boolean {
    return this.workspaceName.trim().length >= 2 && this.slug.trim().length >= 2;
  }

  step2Valid(): boolean {
    return (
      this.adminName.trim().length >= 2 &&
      this.isValidEmail(this.adminEmail) &&
      this.adminPassword.length >= 8
    );
  }

  onWorkspaceNameInput() {
    if (!this.slugManuallyEdited) {
      this.slug = this.setupService.generateSlug(this.workspaceName);
    }
  }

  onSlugInput() {
    this.slugManuallyEdited = this.slug.length > 0;
    this.slug = this.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 48);
  }

  nextStep() {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update((s) => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  async onSubmit() {
    this.error.set(null);
    this.isLoading.set(true);

    try {
      await this.setupService.createWorkspace({
        workspaceName: this.workspaceName.trim(),
        slug: this.slug.trim(),
        adminName: this.adminName.trim(),
        adminEmail: this.adminEmail.trim(),
        adminPassword: this.adminPassword,
      });

      // Move to success step
      this.currentStep.set(3);
    } catch (err: any) {
      this.error.set(
        err?.error?.error?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility() {
    this.showPassword.update((v) => !v);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
