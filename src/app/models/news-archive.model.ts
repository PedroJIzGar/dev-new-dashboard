export type NewsPriority = 'high' | 'medium' | 'low';

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  category: string;
  priority: NewsPriority;
  score: number;
  summary: string;
  whyItMatters: string;
  recommendedAction: string;
}

export interface ArchiveSummaryItem {
  name: string;
  count: number;
}

export interface NewsArchive {
  date: string;
  generatedAt: string;
  totalArticles: number;
  summary: {
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    topCategories: ArchiveSummaryItem[];
    topSources: ArchiveSummaryItem[];
  };
  articles: NewsArticle[];
}
