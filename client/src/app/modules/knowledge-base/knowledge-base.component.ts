import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { MockDataService, KBCategory, KBArticle } from '../../core/services/mock-data.service';
import { ArticleEditorDialogComponent, ArticleFormData } from './article-editor-dialog/article-editor-dialog.component';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    ArticleEditorDialogComponent,
],
  templateUrl: './knowledge-base.component.html',
})
export class KnowledgeBaseComponent implements OnInit {
  private mockData = inject(MockDataService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  isLoading = signal(true);
  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  showArticleDialog = signal(false);
  editingArticle = signal<KBArticle | null>(null);

  categories = signal<KBCategory[]>([]);
  articles = signal<KBArticle[]>([]);
  popularArticles = signal<KBArticle[]>([]);

  // Current user and admin check from AuthService
  isAdmin = this.authService.isAdmin;

  // Search results
  searchResults = computed(() => {
    const query = this.searchQuery().trim();
    if (!query) return [];
    return this.mockData.searchKBArticles(query);
  });

  isSearching = computed(() => this.searchQuery().trim().length > 0);

  // Filtered articles by category
  filteredArticles = computed(() => {
    const categorySlug = this.selectedCategory();
    if (!categorySlug) return this.articles();
    return this.articles().filter(a => a.category?.slug === categorySlug);
  });

  // Selected category name
  selectedCategoryName = computed(() => {
    const slug = this.selectedCategory();
    if (!slug) return null;
    return this.categories().find(c => c.slug === slug)?.name ?? null;
  });

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading.set(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500));

    this.categories.set(this.mockData.getKBCategories());
    this.articles.set(this.mockData.getKBArticles());
    this.popularArticles.set(this.mockData.getPopularKBArticles(5));
    
    this.isLoading.set(false);
  }

  selectCategory(slug: string | null) {
    this.selectedCategory.set(slug);
    this.searchQuery.set('');
  }

  openArticle(article: KBArticle) {
    this.router.navigate(['/knowledge-base', 'article', article.slug]);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.selectedCategory.set(null);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  formatViews(views: number): string {
    if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'k';
    }
    return views.toString();
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Article management methods
  openNewArticleDialog() {
    this.editingArticle.set(null);
    this.showArticleDialog.set(true);
  }

  openEditArticleDialog(article: KBArticle) {
    this.editingArticle.set(article);
    this.showArticleDialog.set(true);
  }

  onArticleSave(data: ArticleFormData) {
    const editing = this.editingArticle();
    
    if (editing) {
      // Update existing article
      const updated = this.mockData.updateKBArticle(editing.slug, data);
      if (updated) {
        this.toast.success('Article Updated', 'The article has been updated successfully.');
        this.loadData();
      }
    } else {
      // Create new article
      const created = this.mockData.createKBArticle(data);
      this.toast.success('Article Created', `"${created.title}" has been created successfully.`);
      this.loadData();
    }
  }
}
