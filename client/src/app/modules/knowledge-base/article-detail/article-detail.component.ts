import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { ToastService } from '../../../core/services/toast.service';
import { MockDataService, KBArticle } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    AvatarModule,
    SkeletonModule,
    DividerModule,
  ],
  templateUrl: './article-detail.component.html',
  styles: [`
    :host ::ng-deep .article-content {
      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-top: 2rem;
        margin-bottom: 1rem;
        color: var(--text-primary);
      }
      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        color: var(--text-primary);
      }
      p {
        margin-bottom: 1rem;
        line-height: 1.7;
        color: var(--text-secondary);
      }
      ul, ol {
        margin-bottom: 1rem;
        padding-left: 1.5rem;
        color: var(--text-secondary);
      }
      li {
        margin-bottom: 0.5rem;
        line-height: 1.6;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
      }
      th, td {
        padding: 0.75rem;
        border: 1px solid var(--border-default);
        text-align: left;
      }
      th {
        background: var(--bg-elevated);
        font-weight: 600;
        color: var(--text-primary);
      }
      td {
        color: var(--text-secondary);
      }
      pre {
        background: var(--bg-elevated);
        border-radius: 0.5rem;
        padding: 1rem;
        overflow-x: auto;
        margin: 1rem 0;
      }
      code {
        font-family: ui-monospace, monospace;
        font-size: 0.875rem;
        background: var(--bg-elevated);
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        color: var(--color-primary);
      }
      pre code {
        background: none;
        padding: 0;
      }
      .info-box, .warning-box {
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
      }
      .info-box {
        background: color-mix(in srgb, var(--color-primary) 10%, transparent);
        border-left: 4px solid var(--color-primary);
      }
      .warning-box {
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
      }
    }
  `],
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private mockData = inject(MockDataService);
  private toastService = inject(ToastService);

  isLoading = signal(true);
  article = signal<KBArticle | null>(null);
  relatedArticles = signal<KBArticle[]>([]);
  feedbackGiven = signal<'helpful' | 'not-helpful' | null>(null);

  safeContent = computed<SafeHtml>(() => {
    const content = this.article()?.content ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(content);
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadArticle(slug);
      }
    });
  }

  async loadArticle(slug: string) {
    this.isLoading.set(true);
    this.feedbackGiven.set(null);

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 400));

    const article = this.mockData.getKBArticleBySlug(slug);
    if (article) {
      this.article.set(article);
      this.mockData.recordKBArticleView(slug);
      this.relatedArticles.set(this.mockData.getRelatedKBArticles(slug));
    } else {
      this.router.navigate(['/knowledge-base']);
    }

    this.isLoading.set(false);
  }

  goBack() {
    this.router.navigate(['/knowledge-base']);
  }

  goToCategory() {
    const category = this.article()?.category;
    if (category) {
      this.router.navigate(['/knowledge-base'], { queryParams: { category: category.slug } });
    }
  }

  openRelatedArticle(article: KBArticle) {
    this.router.navigate(['/knowledge-base', 'article', article.slug]);
  }

  giveFeedback(helpful: boolean) {
    const slug = this.article()?.slug;
    if (!slug || this.feedbackGiven()) return;

    this.mockData.recordKBArticleFeedback(slug, helpful);
    this.feedbackGiven.set(helpful ? 'helpful' : 'not-helpful');
    
    if (helpful) {
      this.toastService.success('Thank you!', 'Glad this article was helpful');
    } else {
      this.toastService.info('Feedback recorded', 'We\'ll work to improve this article');
    }
  }

  shareArticle() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    this.toastService.success('Link copied', 'Article link copied to clipboard');
  }

  printArticle() {
    window.print();
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  formatViews(views: number): string {
    if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'k';
    }
    return views.toString();
  }
}
