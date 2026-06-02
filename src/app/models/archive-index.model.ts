import { NewsArticle } from './news-archive.model';

export interface ArchiveSummaryItem {
  name: string;
  count: number;
}

export interface PriorityTrendItem {
  date: string;
  high: number;
  medium: number;
  low: number;
}

export interface ArchiveIndexSummary {
  totalReports: number;
  totalArticles: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  averageArticlesPerReport: number;
  latestReportDate: string | null;
  dominantCategory: string | null;
  mostActiveSource: string | null;
  highestRiskDay: string | null;
  topCategories: ArchiveSummaryItem[];
  topSources: ArchiveSummaryItem[];
}

export interface ArchiveIndexReport {
  date: string;
  generatedAt: string;
  totalArticles: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  topCategory: string | null;
  topSource: string | null;
  topCategories: ArchiveSummaryItem[];
  topSources: ArchiveSummaryItem[];
  topArticles: NewsArticle[];
}

export interface ArchiveIndex {
  generatedAt: string;
  availableDates: string[];
  summary: ArchiveIndexSummary;
  priorityTrend: PriorityTrendItem[];
  reports: ArchiveIndexReport[];
}
