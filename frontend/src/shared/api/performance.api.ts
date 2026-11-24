import { request } from './apiClient';
import type { PerformanceInput, PerformanceRecord } from '../types/api.types';

export const createPerformance = (input: PerformanceInput) =>
  request<PerformanceRecord>('/performance', { method: 'POST', body: input });