import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
import { SearchService } from './search.service';

export interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: 'navigation' | 'actions' | 'general';
  action: () => void;
}

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutService {
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private searchService = inject(SearchService);

  private sequenceBuffer: string[] = [];
  private sequenceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly SEQUENCE_TIMEOUT = 800;

  /** Emits when the help dialog should be toggled */
  readonly showHelp$ = new Subject<void>();

  /** Emits shortcut key for context-specific actions (e.g. 'b t' on ticket detail) */
  readonly contextAction$ = new Subject<string>();

  private readonly shortcuts: KeyboardShortcut[] = [
    { keys: ['g', 'd'], description: 'Go to Dashboard', category: 'navigation', action: () => this.router.navigate(['/dashboard']) },
    { keys: ['g', 't'], description: 'Go to Tickets', category: 'navigation', action: () => this.router.navigate(['/tickets']) },
    { keys: ['g', 'c'], description: 'Go to Customers', category: 'navigation', action: () => this.router.navigate(['/customers']) },
    { keys: ['g', 'a'], description: 'Go to Agents', category: 'navigation', action: () => this.router.navigate(['/agents']) },
    { keys: ['g', 'k'], description: 'Go to Knowledge Base', category: 'navigation', action: () => this.router.navigate(['/knowledge-base']) },
    { keys: ['g', 's'], description: 'Go to Settings', category: 'navigation', action: () => this.router.navigate(['/settings']) },
    { keys: ['m'], description: 'Toggle sidebar', category: 'general', action: () => {} }, // handled by MainLayout
    { keys: ['?'], description: 'Show keyboard shortcuts', category: 'general', action: () => this.showHelp$.next() },
  ];

  constructor() {
    this.ngZone.runOutsideAngular(() => {
      fromEvent<KeyboardEvent>(document, 'keydown').subscribe((event) => {
        this.handleKeydown(event);
      });
    });
  }

  getShortcuts(): KeyboardShortcut[] {
    return this.shortcuts;
  }

  private handleKeydown(event: KeyboardEvent) {
    // Ignore when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    // Ignore when modifier keys are held (except Shift for ?)
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const key = event.key.toLowerCase();

    // Handle '?' (Shift+/)
    if (event.key === '?') {
      event.preventDefault();
      this.resetSequence();
      this.ngZone.run(() => this.showHelp$.next());
      return;
    }

    // Add to sequence buffer
    this.sequenceBuffer.push(key);

    // Clear previous timer
    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer);
    }

    // Try to match
    const matched = this.tryMatch();
    if (matched) {
      event.preventDefault();
      this.resetSequence();
      this.ngZone.run(() => matched.action());
      return;
    }

    // Check if current buffer could be a prefix of any shortcut
    const couldMatch = this.shortcuts.some((s) =>
      s.keys.length > this.sequenceBuffer.length &&
      s.keys.slice(0, this.sequenceBuffer.length).every((k, i) => k === this.sequenceBuffer[i])
    );

    // Also check context actions (like 'b t')
    const contextPrefix = this.sequenceBuffer.join(' ');
    const couldMatchContext = ['b'].some((prefix) => contextPrefix === prefix);

    if (couldMatch || couldMatchContext) {
      // Wait for more keys
      this.sequenceTimer = setTimeout(() => this.resetSequence(), this.SEQUENCE_TIMEOUT);
    } else {
      // Check context action
      const contextKey = this.sequenceBuffer.join(' ');
      if (contextKey === 'b t') {
        event.preventDefault();
        this.resetSequence();
        this.ngZone.run(() => this.contextAction$.next('browse-tickets'));
        return;
      }
      this.resetSequence();
    }
  }

  private tryMatch(): KeyboardShortcut | null {
    return this.shortcuts.find((s) =>
      s.keys.length === this.sequenceBuffer.length &&
      s.keys.every((k, i) => k === this.sequenceBuffer[i])
    ) ?? null;
  }

  private resetSequence() {
    this.sequenceBuffer = [];
    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer);
      this.sequenceTimer = null;
    }
  }
}
