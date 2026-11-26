import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMovie } from '../../shared/api/movies.api';
import type { Movie } from '../../shared/types/api.types';
import '../prakash.css';

export default function MovieDetails() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(movieId);
    if (!Number.isInteger(id)) { setError('That movie link is not valid.'); return; }
    const ctrl = new AbortController();
    getMovie(id, ctrl.signal)
      .then(setMovie)
      .catch((e) => e.name !== 'AbortError' && setError(e.message));
    return () => ctrl.abort();
  }, [movieId]);

  return (
    <main className="p-page">
      <p><Link to="/report">← Back to weekly report</Link></p>
      {error && <div className="p-banner error" role="alert">{error}</div>}
      {!movie && !error && <p role="status">Loading movie…</p>}
      {movie && (
        <section className="p-card">
          <h1>{movie.title}</h1>
          <dl className="p-summary">
            <div><dt>Genre</dt><dd>{movie.genre || 'Not set'}</dd></div>
            <div><dt>Release date</dt><dd>{movie.releaseDate || 'Not set'}</dd></div>
            <div><dt>Screening status</dt><dd>{movie.screeningStatus}</dd></div>
          </dl>
        </section>
      )}
    </main>
  );
}