import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { KnowledgeBaseApiService, KBCategoryDto, KBArticleDto } from '../../core/services/knowledge-base-api.service';
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
  private kbApi = inject(KnowledgeBaseApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  isLoading = signal(true);
  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  showArticleDialog = signal(false);
  editingArticle = signal<KBArticleDto | null>(null);

  categories = signal<KBCategoryDto[]>([]);
  articles = signal<KBArticleDto[]>([]);
  popularArticles = signal<KBArticleDto[]>([]);

  // Current user and admin check from AuthService
  isAdmin = this.authService.isAdmin;

  // Search results
  searchResults = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return [];
    return this.articles().filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.excerpt.toLowerCase().includes(query) ||
      a.tags.some(t => t.toLowerCase().includes(query))
    );
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

  loadData() {
    this.isLoading.set(true);

    this.kbApi.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });

    this.kbApi.getArticles({ status: 'published' }).subscribe(articles => {
      this.articles.set(articles);
      this.isLoading.set(false);
    });

    this.kbApi.getPopularArticles(5).subscribe(articles => {
      this.popularArticles.set(articles);
    });
  }

  selectCategory(slug: string | null) {
    this.selectedCategory.set(slug);
    this.searchQuery.set('');
  }

  openArticle(article: KBArticleDto) {
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

  formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Article management methods
  openNewArticleDialog() {
    this.editingArticle.set(null);
    this.showArticleDialog.set(true);
  }

  openEditArticleDialog(article: KBArticleDto) {
    this.editingArticle.set(article);
    this.showArticleDialog.set(true);
  }

  onArticleSave(data: ArticleFormData) {
    const editing = this.editingArticle();
    
    if (editing) {
      this.kbApi.updateArticle(editing.id, data).subscribe(() => {
        this.toast.success('Article Updated', 'The article has been updated successfully.');
        this.loadData();
      });
    } else {
      this.kbApi.createArticle(data).subscribe(created => {
        this.toast.success('Article Created', `"${created.title}" has been created successfully.`);
        this.loadData();
      });
    }
  }
}
