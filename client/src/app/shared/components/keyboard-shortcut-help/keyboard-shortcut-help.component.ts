import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { KeyboardShortcutService, KeyboardShortcut } from '../../../core/services/keyboard-shortcut.service';

@Component({
  selector: 'app-keyboard-shortcut-help',
  standalone: true,
  imports: [CommonModule, DialogModule],
  template: `
    <p-dialog
      [visible]="visible()"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '480px' }"
      [dismissableMask]="true"
    >
      <ng-template #header>
        <div class="flex items-center gap-2">
          <i class="pi pi-keyboard text-lg" style="color: var(--color-primary)"></i>
          <span class="text-lg font-semibold text-(--text-primary)">Keyboard Shortcuts</span>
        </div>
      </ng-template>

      @for (category of categories; track category.name) {
        <div class="mb-4">
          <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
            {{ category.name }}
          </h4>
          <div class="flex flex-col gap-1">
            @for (shortcut of category.shortcuts; track shortcut.description) {
              <div class="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-(--hover-bg)">
                <span class="text-sm text-(--text-primary)">{{ shortcut.description }}</span>
                <div class="flex items-center gap-1">
                  @for (key of shortcut.keys; track $index) {
                    @if ($index > 0) {
                      <span class="text-xs text-(--text-muted)">then</span>
                    }
                    <kbd class="inline-flex min-w-6 items-center justify-center rounded-md border border-(--border-default) bg-(--kbd-bg) px-2 py-0.5 text-xs font-medium text-(--text-primary)">
                      {{ formatKey(key) }}
                    </kbd>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Context-specific shortcuts -->
      <div class="mb-2">
        <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
          Ticket Detail
        </h4>
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-(--hover-bg)">
            <span class="text-sm text-(--text-primary)">Browse tickets sidebar</span>
            <div class="flex items-center gap-1">
              <kbd class="inline-flex min-w-6 items-center justify-center rounded-md border border-(--border-default) bg-(--kbd-bg) px-2 py-0.5 text-xs font-medium text-(--text-primary)">B</kbd>
              <span class="text-xs text-(--text-muted)">then</span>
              <kbd class="inline-flex min-w-6 items-center justify-center rounded-md border border-(--border-default) bg-(--kbd-bg) px-2 py-0.5 text-xs font-medium text-(--text-primary)">T</kbd>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 border-t border-(--border-default) pt-3">
        <p class="text-center text-xs text-(--text-muted)">
          Press <kbd class="rounded border border-(--border-default) bg-(--kbd-bg) px-1.5 py-0.5 text-xs">?</kbd> to toggle this dialog
        </p>
      </div>
    </p-dialog>
  `,
})
export class KeyboardShortcutHelpComponent {
  private shortcutService = inject(KeyboardShortcutService);

  visible = input<boolean>(false);
  visibleChange = output<boolean>();

  categories: { name: string; shortcuts: KeyboardShortcut[] }[] = [];

  constructor() {
    const shortcuts = this.shortcutService.getShortcuts();
    const groups = new Map<string, KeyboardShortcut[]>();
    for (const s of shortcuts) {
      const label = s.category === 'navigation' ? 'Navigation' : 'General';
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(s);
    }
    this.categories = Array.from(groups.entries()).map(([name, shortcuts]) => ({ name, shortcuts }));
  }

  formatKey(key: string): string {
    if (key === '?') return '?';
    return key.toUpperCase();
  }
}
