import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService, Theme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-configurator',
  standalone: true,
  imports: [CommonModule, ButtonModule, PopoverModule, TooltipModule],
  templateUrl: './theme-configurator.component.html',
})
export class ThemeConfiguratorComponent {
  themeService = inject(ThemeService);

  selectTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }

  isSelected(theme: Theme): boolean {
    return this.themeService.currentTheme().name === theme.name;
  }
}
