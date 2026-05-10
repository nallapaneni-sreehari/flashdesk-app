import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { ToastService } from '../../../core/services/toast.service';
import { KnowledgeBaseApiService, KBArticleDto } from '../../../core/services/knowledge-base-api.service';

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
      /* ── Base Typography ── */
      h1 {
        font-size: 2rem;
        font-weight: 700;
        margin-top: 2.5rem;
        margin-bottom: 1rem;
        color: var(--text-primary);
      }
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
      ol { list-style-type: decimal; }
      ul { list-style-type: disc; }
      li {
        margin-bottom: 0.5rem;
        line-height: 1.6;
      }
      strong, b { font-weight: 600; }
      em, i { font-style: italic; }
      u { text-decoration: underline; }
      s, strike { text-decoration: line-through; }
      a { color: var(--color-primary); text-decoration: underline; }
      blockquote {
        border-left: 4px solid var(--border-default);
        padding: 0.5rem 1rem;
        margin: 1rem 0;
        color: var(--text-secondary);
        background: var(--bg-muted);
        border-radius: 0 0.5rem 0.5rem 0;
      }
      img {
        max-width: 100%;
        height: auto;
        border-radius: 0.5rem;
        margin: 1rem 0;
      }
      /* ── Table ── */
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
      /* ── Code ── */
      pre {
        background: var(--bg-elevated);
        border-radius: 0.5rem;
        padding: 1rem;
        overflow-x: auto;
        margin: 1rem 0;
      }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
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

      /* ── Quill CSS Classes ── */
      /* Alignment */
      .ql-align-center { text-align: center; }
      .ql-align-right { text-align: right; }
      .ql-align-justify { text-align: justify; }

      /* Indentation */
      .ql-indent-1 { padding-left: 3em; }
      .ql-indent-2 { padding-left: 6em; }
      .ql-indent-3 { padding-left: 9em; }
      .ql-indent-4 { padding-left: 12em; }
      .ql-indent-5 { padding-left: 15em; }
      .ql-indent-6 { padding-left: 18em; }
      .ql-indent-7 { padding-left: 21em; }
      .ql-indent-8 { padding-left: 24em; }

      /* Font sizes */
      .ql-size-small { font-size: 0.75em; }
      .ql-size-large { font-size: 1.5em; }
      .ql-size-huge { font-size: 2.5em; }

      /* Quill video embeds */
      .ql-video {
        display: block;
        max-width: 100%;
        margin: 1rem 0;
      }

      /* Inline styles from Quill — override text color to use theme */
      span[style] {
        color: var(--text-secondary) !important;
      }
    }
  `],
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private kbApi = inject(KnowledgeBaseApiService);
  private toastService = inject(ToastService);

  isLoading = signal(true);
  article = signal<KBArticleDto | null>(null);
  relatedArticles = signal<KBArticleDto[]>([]);
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

  loadArticle(slug: string) {
    this.isLoading.set(true);
    this.feedbackGiven.set(null);

    this.kbApi.getArticleBySlug(slug).subscribe({
      next: (article) => {
        this.article.set(article);
        this.kbApi.recordView(article.id).subscribe();
        // Related articles: fetch articles from same category
        this.kbApi.getArticles({ status: 'published', categoryId: article.categoryId }).subscribe(articles => {
          this.relatedArticles.set(articles.filter(a => a.id !== article.id).slice(0, 4));
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.router.navigate(['/knowledge-base']);
        this.isLoading.set(false);
      },
    });
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

  openRelatedArticle(article: KBArticleDto) {
    this.router.navigate(['/knowledge-base', 'article', article.slug]);
  }

  giveFeedback(helpful: boolean) {
    const article = this.article();
    if (!article || this.feedbackGiven()) return;

    this.kbApi.recordFeedback(article.id, helpful).subscribe();
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

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
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
