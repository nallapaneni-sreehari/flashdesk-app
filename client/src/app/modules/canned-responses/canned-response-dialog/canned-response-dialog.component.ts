import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { EditorModule } from 'primeng/editor';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { CannedResponse, CannedResponseCategory } from '../../../core/services/mock-data.service';

export interface CannedResponseFormData {
  title: string;
  shortcut: string;
  content: string;
  categoryId: string;
  isShared: boolean;
}

@Component({
  selector: 'app-canned-response-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToggleSwitchModule,
    EditorModule,
    TooltipModule,
    DividerModule,
  ],
  templateUrl: './canned-response-dialog.component.html',
})
export class CannedResponseDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() response: CannedResponse | null = null;
  @Input() categories: CannedResponseCategory[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<CannedResponseFormData>();

  // Form fields
  title = '';
  shortcut = '';
  content = '';
  categoryId = '';
  isShared = true;

  // Validation
  shortcutError = signal('');

  // Category options for dropdown
  get categoryOptions() {
    return this.categories.map(c => ({
      label: c.name,
      value: c.id,
      icon: c.icon,
      color: c.color,
    }));
  }

  // Available placeholders
  placeholders = [
    { name: '{{customer_name}}', description: 'Customer\'s full name' },
    { name: '{{agent_name}}', description: 'Agent\'s name' },
    { name: '{{ticket_id}}', description: 'Ticket ID/number' },
    { name: '{{company_name}}', description: 'Customer\'s company' },
  ];

  get isEditing(): boolean {
    return !!this.response;
  }

  get dialogTitle(): string {
    return this.isEditing ? 'Edit Template' : 'Create Template';
  }

  get isValid(): boolean {
    return (
      this.title.trim().length > 0 &&
      this.shortcut.trim().length > 0 &&
      this.content.trim().length > 0 &&
      this.categoryId.length > 0 &&
      !this.shortcutError()
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible) {
      this.resetForm();
    }
    if (changes['response'] && this.response) {
      this.populateForm();
    }
  }

  resetForm() {
    if (!this.response) {
      this.title = '';
      this.shortcut = '/';
      this.content = '';
      this.categoryId = this.categories[0]?.id || '';
      this.isShared = true;
      this.shortcutError.set('');
    }
  }

  populateForm() {
    if (this.response) {
      this.title = this.response.title;
      this.shortcut = this.response.shortcut;
      this.content = this.response.content;
      this.categoryId = this.response.categoryId;
      this.isShared = this.response.isShared;
      this.shortcutError.set('');
    }
  }

  validateShortcut() {
    const value = this.shortcut.trim();

    if (!value.startsWith('/')) {
      this.shortcutError.set('Shortcut must start with /');
      return;
    }

    if (value.length < 2) {
      this.shortcutError.set('Shortcut must be at least 2 characters');
      return;
    }

    if (!/^\/[a-zA-Z0-9_-]+$/.test(value)) {
      this.shortcutError.set('Only letters, numbers, underscores, and dashes allowed');
      return;
    }

    this.shortcutError.set('');
  }

  insertPlaceholder(placeholder: string) {
    // Insert at cursor position or append to content
    this.content += placeholder;
  }

  onHide() {
    this.visibleChange.emit(false);
  }

  onSave() {
    if (!this.isValid) return;

    this.save.emit({
      title: this.title.trim(),
      shortcut: this.shortcut.trim(),
      content: this.content,
      categoryId: this.categoryId,
      isShared: this.isShared,
    });

    this.visibleChange.emit(false);
  }

  onCancel() {
    this.visibleChange.emit(false);
  }
}
