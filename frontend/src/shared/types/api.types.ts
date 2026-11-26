export type ScreeningStatus = 'active' | 'extended' | 'ended';

export interface Movie {
  movieId: number;
  title: string;
  genre?: string;
  releaseDate?: string;
  screeningStatus: ScreeningStatus;
}

export interface MovieInput {
  title: string;
  genre?: string;
  releaseDate?: string;
}

export interface PerformanceInput {
  movieId: number;
  weekStart: string;
  revenue: number;
}

export interface PerformanceRecord extends PerformanceInput {
  recordId: number;
}

export interface WeeklyReportItem {
  movieId: number;
  title: string;
  revenue: number;
}

export interface WeeklyReport {
  weekStart: string;
  items: WeeklyReportItem[];
}

export interface ApiErrorBody {
  code: string;
  message: string;
}