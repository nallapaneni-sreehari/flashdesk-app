import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SearchService, SearchResult, SearchResultGroup } from '../../../core/services/search.service';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './global-search.component.html',
})
export class GlobalSearchComponent {
  private searchService = inject(SearchService);
  private router = inject(Router);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  isOpen = this.searchService.isOpen;
  query = signal('');
  selectedIndex = signal(0);

  results = computed(() => this.searchService.search(this.query()));

  flatResults = computed(() => {
    const groups = this.results();
    return groups.flatMap((g) => g.results);
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        setTimeout(() => this.searchInput?.nativeElement?.focus(), 50);
      } else {
        this.query.set('');
        this.selectedIndex.set(0);
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (!this.isOpen()) return;

    const flat = this.flatResults();

    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.update((i) => Math.min(i + 1, flat.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.update((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (flat[this.selectedIndex()]) {
          this.selectResult(flat[this.selectedIndex()]);
        }
        break;
    }
  }

  close() {
    this.searchService.close();
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('search-overlay')) {
      this.close();
    }
  }

  onQueryChange(value: string) {
    this.query.set(value);
    this.selectedIndex.set(0);
  }

  selectResult(result: SearchResult) {
    if (result.route) {
      this.router.navigate([result.route], {
        queryParams: result.queryParams,
      });
    }
    this.close();
  }

  isSelected(result: SearchResult): boolean {
    const flat = this.flatResults();
    const index = flat.findIndex((r) => r.id === result.id);
    return index === this.selectedIndex();
  }

  getResultIndex(result: SearchResult): number {
    return this.flatResults().findIndex((r) => r.id === result.id);
  }

  onResultHover(result: SearchResult) {
    const index = this.getResultIndex(result);
    if (index >= 0) {
      this.selectedIndex.set(index);
    }
  }
}
