import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { listMovies } from '../../shared/api/movies.api';
import type { Movie } from '../../shared/types/api.types';
import MovieForm from '../components/MovieForm';
import RevenueForm from '../components/RevenueForm';
import '../prakash.css';

export default function MovieInput() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    listMovies(ctrl.signal)
      .then(setMovies)
      .catch((e) => e.name !== 'AbortError' && setError(e.message));
    return () => ctrl.abort();
  }, []);

  return (
    <main className="p-page">
      <nav className="p-nav" aria-label="Pages">
        <NavLink to="/input">Enter data</NavLink>
        <NavLink to="/report">Weekly report</NavLink>
      </nav>
      <h1>Enter weekly revenue</h1>
      <p className="p-sub">Add a movie if it is new, then record how much it earned in a week.</p>
      {error && <div className="p-banner error" role="alert">Could not load movies: {error}</div>}

      <div className="p-grid">
        <RevenueForm movies={movies} />
        <MovieForm onCreated={(m) => setMovies((prev) => [...prev, m])} />
      </div>
    </main>
  );
}