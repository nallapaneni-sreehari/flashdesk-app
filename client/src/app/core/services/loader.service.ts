import { Injectable, inject, signal } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

export type SpinnerType = 
  | 'ball-fussion'
  | 'ball-spin-clockwise'
  | 'ball-scale-multiple'
  | 'ball-pulse-sync'
  | 'line-scale'
  | 'pacman'
  | 'square-jelly-box'
  | 'timer';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private spinner = inject(NgxSpinnerService);
  
  /** Current loading text */
  loadingText = signal<string>('Loading...');
  
  /** Current spinner color */
  spinnerColor = signal<string>('#4f46e5');

  /**
   * Show the spinner with optional customization
   */
  show(name: string = 'primary', options?: { type?: SpinnerType; text?: string }) {
    this.loadingText.set(options?.text ?? 'Loading...');
    
    // Get primary color from CSS variable
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary').trim() || '#4f46e5';
    
    this.spinnerColor.set(primaryColor);
    
    this.spinner.show(name, {
      type: options?.type ?? 'ball-spin-clockwise',
      bdColor: 'rgba(0, 0, 0, 0.4)',
      color: primaryColor,
      size: 'medium',
      fullScreen: true,
    });
  }

  /**
   * Hide the spinner
   */
  hide(name: string = 'primary') {
    this.spinner.hide(name);
  }

  /**
   * Show spinner, execute async action, then hide
   */
  async withLoading<T>(
    action: () => Promise<T>,
    name: string = 'primary',
    options?: { type?: SpinnerType; text?: string }
  ): Promise<T> {
    this.show(name, options);
    try {
      return await action();
    } finally {
      this.hide(name);
    }
  }
}
