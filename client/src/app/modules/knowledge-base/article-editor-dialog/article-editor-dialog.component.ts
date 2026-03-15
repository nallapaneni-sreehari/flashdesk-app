import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { EditorModule } from 'primeng/editor';
import { ChipsModule } from 'primeng/chips';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MockDataService, KBCategory, KBArticle } from '../../../core/services/mock-data.service';

export interface ArticleFormData {
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string[];
  status: 'published' | 'draft';
}

@Component({
  selector: 'app-article-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    EditorModule,
    ChipsModule,
    SelectButtonModule,
  ],
  templateUrl: './article-editor-dialog.component.html',
})
export class ArticleEditorDialogComponent implements OnChanges {
  private mockData = inject(MockDataService);

  @Input() visible = false;
  @Input() article: KBArticle | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<ArticleFormData>();

  // Form fields
  title = '';
  excerpt = '';
  content = '';
  categoryId = '';
  tags: string[] = [];
  status: 'published' | 'draft' = 'draft';

  categories: KBCategory[] = [];
  categoryOptions: { label: string; value: string }[] = [];

  statusOptions = [
    { label: 'Draft', value: 'draft', icon: 'pi pi-file' },
    { label: 'Published', value: 'published', icon: 'pi pi-check-circle' },
  ];

  get isEditing(): boolean {
    return !!this.article;
  }

  get dialogTitle(): string {
    return this.isEditing ? 'Edit Article' : 'New Article';
  }

  get isValid(): boolean {
    return !!(this.title.trim() && this.excerpt.trim() && this.content.trim() && this.categoryId);
  }

  ngOnInit() {
    this.categories = this.mockData.getKBCategories();
    this.categoryOptions = this.categories.map(c => ({
      label: c.name,
      value: c.id,
    }));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible) {
      if (this.article) {
        this.populateForm(this.article);
      } else {
        this.resetForm();
      }
    }
  }

  populateForm(article: KBArticle) {
    this.title = article.title;
    this.excerpt = article.excerpt;
    this.content = article.content;
    this.categoryId = article.categoryId;
    this.tags = [...article.tags];
    this.status = article.status;
  }

  resetForm() {
    this.title = '';
    this.excerpt = '';
    this.content = '';
    this.categoryId = this.categories[0]?.id || '';
    this.tags = [];
    this.status = 'draft';
  }

  close() {
    this.visibleChange.emit(false);
  }

  onSave() {
    if (!this.isValid) return;

    this.save.emit({
      title: this.title.trim(),
      excerpt: this.excerpt.trim(),
      content: this.content,
      categoryId: this.categoryId,
      tags: this.tags,
      status: this.status,
    });

    this.close();
  }
}
