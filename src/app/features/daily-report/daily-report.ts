import { Component, OnInit, inject } from '@angular/core';

import {
  LucideFileJson,
  LucideGauge,
  LucideSearch,
  LucideShieldAlert,
  LucideTrendingUp,
} from '@lucide/angular';

import { NewsPriority } from '../../models/news-archive.model';
import { NewsArchiveService } from '../../core/news-archive';
import { DashboardHeader } from '../../shared/layout/dashboard-header/dashboard-header';

import { ActivatedRoute, Router } from '@angular/router';
import { DashboardLayout } from '../../shared/layout/dashboard-layout/dashboard-layout';

@Component({
  selector: 'app-daily-report',
  imports: [
    LucideFileJson,
    LucideGauge,
    LucideSearch,
    LucideShieldAlert,
    LucideTrendingUp,
    DashboardHeader,
    DashboardLayout,
  ],
  templateUrl: './daily-report.html',
  styleUrl: './daily-report.scss',
})
export class DailyReport implements OnInit {
  private readonly newsArchiveService = inject(NewsArchiveService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly paginatedArticles = this.newsArchiveService.paginatedArticles;
  readonly totalFilteredArticles = this.newsArchiveService.totalFilteredArticles;
  readonly currentPage = this.newsArchiveService.currentPage;
  readonly totalPages = this.newsArchiveService.totalPages;
  readonly pageSize = this.newsArchiveService.pageSize;
  readonly archive = this.newsArchiveService.archive;
  readonly loading = this.newsArchiveService.archiveLoading;
  readonly error = this.newsArchiveService.archiveError;
  readonly selectedPriority = this.newsArchiveService.selectedPriority;
  readonly searchTerm = this.newsArchiveService.searchTerm;
  readonly selectedDate = this.newsArchiveService.selectedDate;
  readonly availableDates = this.newsArchiveService.availableDates;
  readonly topArticles = this.newsArchiveService.topArticles;
  readonly filteredArticles = this.newsArchiveService.filteredArticles;
  readonly availableCategories = this.newsArchiveService.availableCategories;
  readonly availableSources = this.newsArchiveService.availableSources;
  readonly selectedCategory = this.newsArchiveService.selectedCategory;
  readonly selectedSource = this.newsArchiveService.selectedSource;
  readonly selectedMinScore = this.newsArchiveService.selectedMinScore;
  readonly activeFiltersCount = this.newsArchiveService.activeFiltersCount;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const date = params.get('date');

      if (date) {
        this.newsArchiveService.loadArchiveByDate(date);
        return;
      }

      this.newsArchiveService.loadArchiveIndex(true);
    });
  }

  onDateChange(date: string): void {
    this.router.navigate(['/daily', date]);
  }

  onPriorityChange(priority: NewsPriority | 'all'): void {
    this.newsArchiveService.changePriorityFilter(priority);
  }

  onSearchTermChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newsArchiveService.changeSearchTerm(input.value);
  }

  onLoadLatestReport(): void {
    const latestDate = this.availableDates()[0];

    if (!latestDate) {
      return;
    }

    this.router.navigate(['/daily', latestDate]);
  }

  onPreviousPage(): void {
    this.newsArchiveService.goToPreviousPage();
  }

  onNextPage(): void {
    this.newsArchiveService.goToNextPage();
  }

  onPageChange(page: number): void {
    this.newsArchiveService.changePage(page);
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.newsArchiveService.changePageSize(Number(select.value));
  }

  onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.newsArchiveService.changeCategoryFilter(select.value);
  }

  onSourceChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.newsArchiveService.changeSourceFilter(select.value);
  }

  onMinScoreChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    this.newsArchiveService.changeMinScoreFilter(value === 'any' ? null : Number(value));
  }

  onClearFilters(): void {
    this.newsArchiveService.clearFilters();
  }
}
