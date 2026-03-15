import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastService } from '../../../core/services/toast.service';
import { ThemeService } from '../../../core/services/theme.service';

interface ThemeOption {
  id: string;
  label: string;
  icon: string;
  preview: string;
}

@Component({
  selector: 'app-preferences-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    ToggleSwitchModule,
    ButtonModule,
    RadioButtonModule,
  ],
  templateUrl: './preferences-settings.component.html',
})
export class PreferencesSettingsComponent {
  private toastService = inject(ToastService);
  themeService = inject(ThemeService);

  isSaving = signal(false);

  // Theme options
  themeOptions: ThemeOption[] = [
    { id: 'light', label: 'Light', icon: 'pi pi-sun', preview: 'bg-white border-gray-200' },
    { id: 'dark', label: 'Dark', icon: 'pi pi-moon', preview: 'bg-gray-900 border-gray-700' },
    { id: 'system', label: 'System', icon: 'pi pi-desktop', preview: 'bg-gradient-to-r from-white to-gray-900 border-gray-400' },
  ];

  selectedTheme = signal(this.themeService.isDarkMode() ? 'dark' : 'light');

  // Accent colors
  accentColors = [
    { name: 'Indigo', value: '#4F46E5' },
    { name: 'Blue', value: '#2563EB' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Rose', value: '#E11D48' },
    { name: 'Amber', value: '#D97706' },
    { name: 'Purple', value: '#7C3AED' },
    { name: 'Cyan', value: '#0891B2' },
    { name: 'Pink', value: '#DB2777' },
  ];

  selectedAccent = signal('#4F46E5');

  // Language
  languages = [
    { label: 'English (US)', value: 'en-US', flag: '🇺🇸' },
    { label: 'English (UK)', value: 'en-GB', flag: '🇬🇧' },
    { label: 'Spanish', value: 'es', flag: '🇪🇸' },
    { label: 'French', value: 'fr', flag: '🇫🇷' },
    { label: 'German', value: 'de', flag: '🇩🇪' },
    { label: 'Japanese', value: 'ja', flag: '🇯🇵' },
  ];

  selectedLanguage = signal('en-US');

  // Date/Time formats
  dateFormats = [
    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY', example: '03/08/2026' },
    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY', example: '08/03/2026' },
    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD', example: '2026-03-08' },
  ];

  selectedDateFormat = signal('MM/DD/YYYY');

  timeFormats = [
    { label: '12-hour', value: '12h', example: '2:30 PM' },
    { label: '24-hour', value: '24h', example: '14:30' },
  ];

  selectedTimeFormat = signal('12h');

  // Accessibility
  reducedMotion = signal(false);
  highContrast = signal(false);
  largeText = signal(false);

  // Behavior preferences
  autoRefresh = signal(true);
  soundEffects = signal(true);
  keyboardShortcuts = signal(true);
  compactMode = signal(false);

  setTheme(themeId: string) {
    this.selectedTheme.set(themeId);
    if (themeId === 'dark') {
      this.themeService.setDarkMode(true);
    } else if (themeId === 'light') {
      this.themeService.setDarkMode(false);
    }
    // System mode would need additional logic to detect system preference
  }

  setAccentColor(color: string) {
    this.selectedAccent.set(color);
    // Apply to theme service if needed
  }

  async savePreferences() {
    this.isSaving.set(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.isSaving.set(false);
    this.toastService.success('Preferences Saved', 'Your preferences have been updated');
  }
}
