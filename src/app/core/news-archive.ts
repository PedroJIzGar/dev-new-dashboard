import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';

import { ArchiveIndex } from '../models/archive-index.model';
import { NewsArchive, NewsArticle, NewsPriority } from '../models/news-archive.model';

@Injectable({
  providedIn: 'root',
})
export class NewsArchiveService {
  private readonly http = inject(HttpClient);

  private readonly archiveState = signal<NewsArchive | null>(null);
  private readonly archiveIndexState = signal<ArchiveIndex | null>(null);
  private readonly currentPageState = signal(1);
  private readonly pageSizeState = signal(5);
  private readonly indexLoadingState = signal(false);
  private readonly indexErrorState = signal<string | null>(null);
  private readonly selectedCategoryState = signal<string>('all');
  private readonly selectedSourceState = signal<string>('all');
  private readonly selectedMinScoreState = signal<number | null>(null);
  private readonly archiveLoadingState = signal(false);
  private readonly archiveErrorState = signal<string | null>(null);

  private readonly selectedPriorityState = signal<NewsPriority | 'all'>('all');
  private readonly searchTermState = signal('');
  private readonly selectedDateState = signal<string | null>(null);

  readonly archive = this.archiveState.asReadonly();
  readonly archiveIndex = this.archiveIndexState.asReadonly();
  readonly currentPage = this.currentPageState.asReadonly();
  readonly pageSize = this.pageSizeState.asReadonly();
  readonly indexLoading = this.indexLoadingState.asReadonly();
  readonly indexError = this.indexErrorState.asReadonly();
  readonly selectedCategory = this.selectedCategoryState.asReadonly();
  readonly selectedSource = this.selectedSourceState.asReadonly();
  readonly selectedMinScore = this.selectedMinScoreState.asReadonly();
  readonly archiveLoading = this.archiveLoadingState.asReadonly();
  readonly archiveError = this.archiveErrorState.asReadonly();

  /**
   * Compatibility/global states.
   * Use specific states in components when possible:
   * - Overview -> indexLoading / indexError
   * - DailyReport -> archiveLoading / archiveError
   */
  readonly loading = computed(() => this.indexLoadingState() || this.archiveLoadingState());

  readonly error = computed(() => {
    return this.archiveErrorState() ?? this.indexErrorState();
  });

  readonly selectedPriority = this.selectedPriorityState.asReadonly();
  readonly searchTerm = this.searchTermState.asReadonly();
  readonly selectedDate = this.selectedDateState.asReadonly();

  readonly availableDates = computed<string[]>(() => {
    return this.archiveIndexState()?.availableDates ?? [];
  });

  readonly reports = computed(() => {
    return this.archiveIndexState()?.reports ?? [];
  });

  readonly totalReports = computed(() => {
    return this.reports().length;
  });

  readonly totalHistoricalArticles = computed(() => {
    return this.reports().reduce((total, report) => total + report.totalArticles, 0);
  });

  readonly totalHighPriorityArticles = computed(() => {
    return this.reports().reduce((total, report) => total + report.highPriority, 0);
  });

  readonly totalMediumPriorityArticles = computed(() => {
    return this.reports().reduce((total, report) => total + report.mediumPriority, 0);
  });

  readonly totalLowPriorityArticles = computed(() => {
    return this.reports().reduce((total, report) => total + report.lowPriority, 0);
  });

  readonly averageArticlesPerReport = computed(() => {
    const totalReports = this.totalReports();

    if (totalReports === 0) {
      return 0;
    }

    return Math.round(this.totalHistoricalArticles() / totalReports);
  });

  readonly historicalTopCategories = computed(() => {
    return this.getHistoricalTopItems(this.reports().flatMap((report) => report.topCategories));
  });

  readonly historicalTopSources = computed(() => {
    return this.getHistoricalTopItems(this.reports().flatMap((report) => report.topSources));
  });

  readonly topArticles = computed<NewsArticle[]>(() => {
    return [...(this.archiveState()?.articles ?? [])].sort((a, b) => b.score - a.score).slice(0, 3);
  });

  readonly filteredArticles = computed<NewsArticle[]>(() => {
    const archive = this.archiveState();
    const selectedPriority = this.selectedPriorityState();
    const selectedCategory = this.selectedCategoryState();
    const selectedSource = this.selectedSourceState();
    const selectedMinScore = this.selectedMinScoreState();
    const searchTerm = this.normalizeText(this.searchTermState());

    if (!archive) {
      return [];
    }

    return archive.articles.filter((article) => {
      const matchesPriority = selectedPriority === 'all' || article.priority === selectedPriority;

      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;

      const matchesSource = selectedSource === 'all' || article.source === selectedSource;

      const matchesScore = selectedMinScore === null || article.score >= selectedMinScore;

      const matchesSearch =
        searchTerm.length === 0 || this.articleMatchesSearch(article, searchTerm);

      return matchesPriority && matchesCategory && matchesSource && matchesScore && matchesSearch;
    });
  });

  readonly totalFilteredArticles = computed(() => {
    return this.filteredArticles().length;
  });

  readonly totalPages = computed(() => {
    const totalArticles = this.totalFilteredArticles();
    const pageSize = this.pageSizeState();

    return Math.max(1, Math.ceil(totalArticles / pageSize));
  });

  readonly paginatedArticles = computed<NewsArticle[]>(() => {
    const currentPage = this.currentPageState();
    const pageSize = this.pageSizeState();
    const articles = this.filteredArticles();

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return articles.slice(startIndex, endIndex);
  });

  loadArchiveIndex(loadLatestReport = false): void {
    this.indexLoadingState.set(true);
    this.indexErrorState.set(null);

    this.http.get<ArchiveIndex>('/archives/index.json').subscribe({
      next: (archiveIndex) => {
        this.archiveIndexState.set(archiveIndex);

        const latestDate = archiveIndex.availableDates[0];

        if (!latestDate) {
          this.archiveState.set(null);
          this.selectedDateState.set(null);
          this.indexErrorState.set('No hay informes disponibles todavía.');
          this.indexLoadingState.set(false);
          return;
        }

        this.indexLoadingState.set(false);

        if (loadLatestReport) {
          this.loadArchiveByDate(latestDate);
        }
      },
      error: () => {
        this.archiveIndexState.set(null);
        this.indexErrorState.set('No se pudo cargar el índice de informes.');
        this.indexLoadingState.set(false);
      },
    });
  }

  loadArchiveByDate(date: string): void {
    if (!this.archiveIndexState()) {
      this.loadArchiveIndex(false);
    }

    this.archiveLoadingState.set(true);
    this.archiveErrorState.set(null);
    this.selectedDateState.set(date);
    this.archiveState.set(null);

    this.http.get<NewsArchive>(`/archives/${date}.json`).subscribe({
      next: (archive) => {
        this.archiveState.set(archive);
        this.clearFilters();
        this.archiveErrorState.set(null);
        this.archiveLoadingState.set(false);
      },
      error: () => {
        this.archiveState.set(null);
        this.archiveErrorState.set(`No se pudo cargar el informe del día ${date}.`);
        this.archiveLoadingState.set(false);
      },
    });
  }

  changePage(page: number): void {
    const totalPages = this.totalPages();

    const nextPage = Math.min(Math.max(page, 1), totalPages);

    this.currentPageState.set(nextPage);
  }

  goToNextPage(): void {
    this.changePage(this.currentPageState() + 1);
  }

  goToPreviousPage(): void {
    this.changePage(this.currentPageState() - 1);
  }

  changePageSize(pageSize: number): void {
    this.pageSizeState.set(pageSize);
    this.currentPageState.set(1);
  }

  changePriorityFilter(priority: NewsPriority | 'all'): void {
    this.selectedPriorityState.set(priority);
    this.currentPageState.set(1);
  }

  changeSearchTerm(searchTerm: string): void {
    this.searchTermState.set(searchTerm);
    this.currentPageState.set(1);
  }

  private articleMatchesSearch(article: NewsArticle, searchTerm: string): boolean {
    const searchableText = this.normalizeText(
      [
        article.title,
        article.source,
        article.category,
        article.priority,
        article.summary,
        article.whyItMatters,
        article.recommendedAction,
      ].join(' '),
    );

    return searchableText.includes(searchTerm);
  }

  private getHistoricalTopItems(
    items: { name: string; count: number }[],
    limit = 5,
  ): { name: string; count: number }[] {
    const counter = new Map<string, number>();

    for (const item of items) {
      counter.set(item.name, (counter.get(item.name) ?? 0) + item.count);
    }

    return Array.from(counter.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  readonly indexSummary = computed(() => {
    return this.archiveIndexState()?.summary ?? null;
  });

  readonly priorityTrend = computed(() => {
    return this.archiveIndexState()?.priorityTrend ?? [];
  });

  readonly latestReport = computed(() => {
    const latestReportDate = this.indexSummary()?.latestReportDate;

    if (!latestReportDate) {
      return this.reports()[0] ?? null;
    }

    return this.reports().find((report) => report.date === latestReportDate) ?? null;
  });

  readonly availableCategories = computed<string[]>(() => {
    const categories = this.archiveState()?.articles.map((article) => article.category) ?? [];

    return Array.from(new Set(categories))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  });

  readonly availableSources = computed<string[]>(() => {
    const sources = this.archiveState()?.articles.map((article) => article.source) ?? [];

    return Array.from(new Set(sources))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  });

  readonly activeFiltersCount = computed(() => {
    let count = 0;

    if (this.searchTermState().trim().length > 0) {
      count++;
    }

    if (this.selectedPriorityState() !== 'all') {
      count++;
    }

    if (this.selectedCategoryState() !== 'all') {
      count++;
    }

    if (this.selectedSourceState() !== 'all') {
      count++;
    }

    if (this.selectedMinScoreState() !== null) {
      count++;
    }

    return count;
  });

  changeCategoryFilter(category: string): void {
    this.selectedCategoryState.set(category);
    this.currentPageState.set(1);
  }

  changeSourceFilter(source: string): void {
    this.selectedSourceState.set(source);
    this.currentPageState.set(1);
  }

  changeMinScoreFilter(minScore: number | null): void {
    this.selectedMinScoreState.set(minScore);
    this.currentPageState.set(1);
  }

  clearFilters(): void {
    this.searchTermState.set('');
    this.selectedPriorityState.set('all');
    this.selectedCategoryState.set('all');
    this.selectedSourceState.set('all');
    this.selectedMinScoreState.set(null);
    this.currentPageState.set(1);
  }
}
