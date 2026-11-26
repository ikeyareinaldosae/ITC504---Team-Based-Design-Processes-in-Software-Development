import { request } from './apiClient';
import type { Movie } from '../types/api.types';

export const getReviewFlags = (weekStart: string, minRevenue?: number, dropPercent?: number) =>
  request<unknown>('/management/review-flags', { query: { weekStart, minRevenue, dropPercent } });

export const extendScreening = (movieId: number) =>
  request<Movie>(`/movies/${movieId}/screening/extend`, { method: 'POST' });

export const endScreening = (movieId: number) =>
  request<Movie>(`/movies/${movieId}/screening/end`, { method: 'POST' });