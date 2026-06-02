import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  LucideArchive,
  LucideNewspaper,
  LucideShieldAlert,
  LucideTrendingUp,
} from '@lucide/angular';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { DashboardHeader } from '../../shared/layout/dashboard-header/dashboard-header';
import { DashboardLayout } from '../../shared/layout/dashboard-layout/dashboard-layout';
import { NewsArchiveService } from '../../core/news-archive';

@Component({
  selector: 'app-overview',
  imports: [
    RouterLink,
    DashboardLayout,
    DashboardHeader,
    BaseChartDirective,
    LucideArchive,
    LucideNewspaper,
    LucideShieldAlert,
    LucideTrendingUp,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview implements OnInit {
  private readonly newsArchiveService = inject(NewsArchiveService);

  readonly loading = this.newsArchiveService.indexLoading;
  readonly error = this.newsArchiveService.indexError;

  readonly reports = computed(() => {
    return this.newsArchiveService.reports().slice(0, 7);
  });

  readonly latestReport = this.newsArchiveService.latestReport;
  readonly indexSummary = this.newsArchiveService.indexSummary;

  readonly historicalTopCategories = this.newsArchiveService.historicalTopCategories;
  readonly historicalTopSources = this.newsArchiveService.historicalTopSources;
  readonly priorityTrend = this.newsArchiveService.priorityTrend;

  readonly hasPriorityTrendData = computed(() => {
    return this.priorityTrend().length > 0;
  });

  readonly priorityTrendChartType = 'bar' as const;

  readonly priorityTrendChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const trend = this.compactPriorityTrend();

    return {
      labels: trend.map((item, index) => {
        const isLast = index === trend.length - 1;
        return isLast ? 'Today' : `T-${trend.length - index - 1}`;
      }),
      datasets: [
        {
          label: 'High',
          data: trend.map((item) => this.toPercentage(item.high, item)),
          backgroundColor: '#fca5a5',
          borderColor: '#14141d',
          borderWidth: 1.5,
          borderRadius: 0,
          borderSkipped: false,
          barThickness: 42,
          maxBarThickness: 42,
          categoryPercentage: 1,
          barPercentage: 1,
        },
        {
          label: 'Medium',
          data: trend.map((item) => this.toPercentage(item.medium, item)),
          backgroundColor: '#b79ce3',
          borderColor: '#14141d',
          borderWidth: 1.5,
          borderRadius: 0,
          borderSkipped: false,
          barThickness: 42,
          maxBarThickness: 42,
          categoryPercentage: 1,
          barPercentage: 1,
        },
        {
          label: 'Low',
          data: trend.map((item) => this.toPercentage(item.low, item)),
          backgroundColor: '#5fd8e8',
          borderColor: '#14141d',
          borderWidth: 1.5,
          borderRadius: 0,
          borderSkipped: false,
          barThickness: 42,
          maxBarThickness: 42,
          categoryPercentage: 1,
          barPercentage: 1,
        },
      ],
    };
  });

  readonly priorityTrendChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        stacked: true,
        display: true,
        offset: true,
        ticks: {
          color: '#8f8a9f',
          font: {
            size: 10,
            family: 'JetBrains Mono',
          },
          padding: 4,
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        stacked: true,
        display: false,
        min: 0,
        max: 100,
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  readonly compactPriorityTrend = computed(() => {
    return this.priorityTrend().slice(-4);
  });

  private toPercentage(value: number, item: { high: number; medium: number; low: number }): number {
    const total = item.high + item.medium + item.low;

    if (total === 0) {
      return 0;
    }

    return Math.round((value / total) * 100);
  }

  ngOnInit(): void {
    this.newsArchiveService.loadArchiveIndex();
  }
}
