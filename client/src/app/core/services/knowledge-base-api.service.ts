import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

export interface KBCategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  articleCount: number;
}

export interface KBArticleAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface KBArticleDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'published' | 'draft';
  views: number;
  helpful: number;
  notHelpful: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  category?: KBCategoryDto;
  authorId: string;
  author?: KBArticleAuthor;
}

export interface CreateArticlePayload {
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string[];
  status: 'published' | 'draft';
}

export interface UpdateArticlePayload {
  title?: string;
  excerpt?: string;
  content?: string;
  categoryId?: string;
  tags?: string[];
  status?: 'published' | 'draft';
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class KnowledgeBaseApiService {
  private api = inject(ApiService);

  // ─── CATEGORIES ──────────────────────────────────────

  getCategories(): Observable<KBCategoryDto[]> {
    return this.api.get<KBCategoryDto[]>('/knowledge-base/categories').pipe(map(res => res.data));
  }

  createCategory(data: CreateCategoryPayload): Observable<KBCategoryDto> {
    return this.api.post<KBCategoryDto>('/knowledge-base/categories', data).pipe(map(res => res.data));
  }

  updateCategory(id: string, data: Partial<CreateCategoryPayload>): Observable<KBCategoryDto> {
    return this.api.patch<KBCategoryDto>(`/knowledge-base/categories/${id}`, data).pipe(map(res => res.data));
  }

  deleteCategory(id: string): Observable<void> {
    return this.api.delete<void>(`/knowledge-base/categories/${id}`).pipe(map(res => res.data));
  }

  // ─── ARTICLES ────────────────────────────────────────

  getArticles(params?: { status?: string; categoryId?: string; search?: string; page?: string; pageSize?: string }): Observable<KBArticleDto[]> {
    return this.api.get<KBArticleDto[]>('/knowledge-base/articles', params as Record<string, string>).pipe(map(res => res.data));
  }

  getArticleBySlug(slug: string): Observable<KBArticleDto> {
    return this.api.get<KBArticleDto>(`/knowledge-base/articles/${slug}`).pipe(map(res => res.data));
  }

  getPopularArticles(limit?: number): Observable<KBArticleDto[]> {
    const params = limit ? { limit: limit.toString() } : undefined;
    return this.api.get<KBArticleDto[]>('/knowledge-base/articles/popular', params).pipe(map(res => res.data));
  }

  searchArticles(query: string): Observable<KBArticleDto[]> {
    return this.api.get<KBArticleDto[]>('/knowledge-base/articles/search', { q: query }).pipe(map(res => res.data));
  }

  createArticle(data: CreateArticlePayload): Observable<KBArticleDto> {
    return this.api.post<KBArticleDto>('/knowledge-base/articles', data).pipe(map(res => res.data));
  }

  updateArticle(id: string, data: UpdateArticlePayload): Observable<KBArticleDto> {
    return this.api.patch<KBArticleDto>(`/knowledge-base/articles/${id}`, data).pipe(map(res => res.data));
  }

  deleteArticle(id: string): Observable<void> {
    return this.api.delete<void>(`/knowledge-base/articles/${id}`).pipe(map(res => res.data));
  }

  recordView(id: string): Observable<void> {
    return this.api.post<void>(`/knowledge-base/articles/${id}/view`, {}).pipe(map(res => res.data));
  }

  recordFeedback(id: string, helpful: boolean): Observable<void> {
    return this.api.post<void>(`/knowledge-base/articles/${id}/feedback`, { helpful }).pipe(map(res => res.data));
  }
}
