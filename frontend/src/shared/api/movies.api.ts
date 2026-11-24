import { request } from './apiClient';
import type { Movie, MovieInput } from '../types/api.types';

export const listMovies = (signal?: AbortSignal) => request<Movie[]>('/movies', { signal });

export const getMovie = (movieId: number, signal?: AbortSignal) =>
  request<Movie>(`/movies/${movieId}`, { signal });

export const createMovie = (input: MovieInput) =>
  request<Movie>('/movies', { method: 'POST', body: input });