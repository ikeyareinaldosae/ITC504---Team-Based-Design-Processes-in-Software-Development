import { request } from './apiClient';
import type { WeeklyReport, WeeklyReportItem } from '../types/api.types';

/* eslint-disable @typescript-eslint/no-explicit-any */
function normaliseWeeks(raw: any): string[] {
  const list = Array.isArray(raw) ? raw : raw?.weeks ?? [];
  return list
    .map((w: any) => (typeof w === 'string' ? w : w?.weekStart))
    .filter(Boolean)
    .sort()
    .reverse();
}

function normaliseReport(raw: any, weekStart: string): WeeklyReport {
  const rows: any[] = Array.isArray(raw) ? raw : raw?.items ?? raw?.movies ?? [];
  const items: WeeklyReportItem[] = rows.map((r) => ({
    movieId: Number(r.movieId),
    title: String(r.title ?? r.movieTitle ?? r.movieName ?? ''),
    revenue: Number(r.revenue ?? 0),
  }));
  return { weekStart: raw?.weekStart ?? weekStart, items };
}

export async function getWeeks(signal?: AbortSignal): Promise<string[]> {
  return normaliseWeeks(await request<unknown>('/reports/weeks', { signal }));
}

export async function getWeeklyReport(weekStart: string, signal?: AbortSignal): Promise<WeeklyReport> {
  const raw = await request<unknown>('/reports/weekly', { query: { weekStart }, signal });
  return normaliseReport(raw, weekStart);
}