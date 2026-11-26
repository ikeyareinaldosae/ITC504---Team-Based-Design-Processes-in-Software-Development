import { useState, type FormEvent } from 'react';
import { createPerformance } from '../../shared/api/performance.api';
import type { Movie } from '../../shared/types/api.types';
import { ApiError } from '../../shared/api/apiClient';
import { formatAUD, formatWeek } from './ReportTable';

interface Props {
  movies: Movie[];
  onSaved?: () => void;
}

interface Errors { movieId?: string; weekStart?: string; revenue?: string }

export function isMonday(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value && d.getUTCDay() === 1;
}

export function isValidRevenue(value: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(value.trim());
}

export function validateRevenueForm(movieId: string, weekStart: string, revenue: string): Errors {
  const errors: Errors = {};
  if (!movieId) errors.movieId = 'Choose a movie.';
  if (!weekStart) errors.weekStart = 'Choose the week start date.';
  else if (!isMonday(weekStart)) errors.weekStart = 'Weeks start on Monday. Choose a Monday date.';
  if (!revenue.trim()) errors.revenue = 'Enter the revenue.';
  else if (!isValidRevenue(revenue)) errors.revenue = 'Use a number of 0 or more, with up to 2 decimals (for example 3500.50).';
  return errors;
}

export default function RevenueForm({ movies, onSaved }: Props) {
  const [movieId, setMovieId] = useState('');
  const [weekStart, setWeekStart] = useState('');
  const [revenue, setRevenue] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clear = () => {
    setMovieId(''); setWeekStart(''); setRevenue('');
    setErrors({}); setError(null); setSuccess(null);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const found = validateRevenueForm(movieId, weekStart, revenue);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const amount = Number(revenue);
      const saved = await createPerformance({ movieId: Number(movieId), weekStart, revenue: amount });
      const title = movies.find((m) => m.movieId === saved.movieId)?.title ?? 'the movie';
      setSuccess(`Saved ${formatAUD(saved.revenue ?? amount)} for ${title}, ${formatWeek(weekStart).toLowerCase()}.`);
      setRevenue('');
      onSaved?.();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('A revenue record for this movie and week already exists. Each movie can have one record per week.');
      } else {
        setError(err instanceof Error ? err.message : 'Could not save the revenue.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="p-card" onSubmit={handleSubmit} noValidate aria-labelledby="rev-form-h">
      <h2 id="rev-form-h">Record weekly revenue</h2>
      {error && <div className="p-banner error" role="alert">{error}</div>}
      {success && <div className="p-banner ok" role="status">{success}</div>}

      <div className="p-field">
        <label htmlFor="rf-movie">Movie</label>
        <select id="rf-movie" value={movieId} onChange={(e) => setMovieId(e.target.value)}
          aria-invalid={!!errors.movieId} aria-describedby={errors.movieId ? 'rf-movie-err' : undefined}>
          <option value="">{movies.length ? 'Select a movie' : 'No movies yet. Add one first.'}</option>
          {movies.map((m) => <option key={m.movieId} value={m.movieId}>{m.title}</option>)}
        </select>
        {errors.movieId && <span id="rf-movie-err" className="p-err">{errors.movieId}</span>}
      </div>

      <div className="p-field">
        <label htmlFor="rf-week">Week start (Monday)</label>
        <input id="rf-week" type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)}
          aria-invalid={!!errors.weekStart} aria-describedby="rf-week-hint" />
        <span id="rf-week-hint" className="p-hint">Example: 2026-10-12</span>
        {errors.weekStart && <span className="p-err">{errors.weekStart}</span>}
      </div>

      <div className="p-field">
        <label htmlFor="rf-rev">Revenue (AUD)</label>
        <input id="rf-rev" inputMode="decimal" placeholder="3500.00" value={revenue}
          onChange={(e) => setRevenue(e.target.value)} aria-invalid={!!errors.revenue} />
        {errors.revenue && <span className="p-err">{errors.revenue}</span>}
      </div>

      <div className="p-actions">
        <button className="p-btn" type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save revenue'}
        </button>
        <button className="p-btn secondary" type="button" onClick={clear} disabled={submitting}>
          Clear form
        </button>
      </div>
    </form>
  );
}