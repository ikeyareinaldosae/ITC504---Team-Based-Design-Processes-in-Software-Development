import { useState, type FormEvent } from 'react';
import { createMovie } from '../../shared/api/movies.api';
import type { Movie } from '../../shared/types/api.types';

interface Props {
  onCreated: (movie: Movie) => void;
}

export default function MovieForm({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clear = () => {
    setTitle(''); setGenre(''); setReleaseDate('');
    setTitleError(null); setError(null); setSuccess(null);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setTitleError('Enter the movie title.');
      return;
    }
    setTitleError(null);

    setSubmitting(true);
    try {
      const movie = await createMovie({
        title: title.trim(),
        genre: genre.trim() || undefined,
        releaseDate: releaseDate || undefined,
      });
      setSuccess(`Added “${movie.title}”.`);
      setTitle(''); setGenre(''); setReleaseDate('');
      onCreated(movie);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add the movie.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="p-card" onSubmit={handleSubmit} noValidate aria-labelledby="movie-form-h">
      <h2 id="movie-form-h">Add a movie</h2>
      {error && <div className="p-banner error" role="alert">{error}</div>}
      {success && <div className="p-banner ok" role="status">{success}</div>}

      <div className="p-field">
        <label htmlFor="mf-title">Title</label>
        <input id="mf-title" value={title} onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!titleError} aria-describedby={titleError ? 'mf-title-err' : undefined} />
        {titleError && <span id="mf-title-err" className="p-err">{titleError}</span>}
      </div>
      <div className="p-field">
        <label htmlFor="mf-genre">Genre (optional)</label>
        <input id="mf-genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
      </div>
      <div className="p-field">
        <label htmlFor="mf-release">Release date (optional)</label>
        <input id="mf-release" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
      </div>

      <div className="p-actions">
        <button className="p-btn" type="submit" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add movie'}
        </button>
        <button className="p-btn secondary" type="button" onClick={clear} disabled={submitting}>
          Clear form
        </button>
      </div>
    </form>
  );
}