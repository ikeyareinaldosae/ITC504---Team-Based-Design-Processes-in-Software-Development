import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useWeeks, useWeeklyReport } from '../hooks/useWeeklyReport';
import WeekSelector from '../components/WeekSelector';
import ReportTable, { formatAUD, formatWeek } from '../components/ReportTable';
import '../prakash.css';

export default function WeeklyReport() {
  const { weeks, loading: weeksLoading, error: weeksError } = useWeeks();
  const [week, setWeek] = useState<string | null>(null);
  const { report, loading, error, reload } = useWeeklyReport(week);

  useEffect(() => {
    if (!week && weeks.length > 0) setWeek(weeks[0]);
  }, [weeks, week]);

  const items = report?.items ?? [];
  const total = items.reduce((sum, i) => sum + i.revenue, 0);
  const top = items.length ? items.reduce((a, b) => (b.revenue > a.revenue ? b : a)) : null;

  return (
    <main className="p-page">
      <nav className="p-nav" aria-label="Pages">
        <NavLink to="/input">Enter data</NavLink>
        <NavLink to="/report">Weekly report</NavLink>
      </nav>
      <h1>Weekly report</h1>
      <p className="p-sub">See what each movie earned in the week you choose.</p>

      {weeksError && <div className="p-banner error" role="alert">Could not load weeks: {weeksError}</div>}
      <WeekSelector weeks={weeks} value={week} onChange={setWeek} disabled={weeksLoading} />

      {loading && <p role="status">Loading report…</p>}

      {error && (
        <div className="p-banner error" role="alert">
          {error} <button className="p-btn secondary" onClick={reload}>Try again</button>
        </div>
      )}

      {!loading && !error && week && items.length === 0 && (
        <div className="p-empty">No revenue has been recorded for this week yet.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem' }}>{formatWeek(week!)}</h2>
          <dl className="p-summary">
            <div><dt>Total revenue</dt><dd>{formatAUD(total)}</dd></div>
            <div><dt>Movies reported</dt><dd>{items.length}</dd></div>
            {top && <div><dt>Top earner</dt><dd>{top.title}</dd></div>}
          </dl>
          <ReportTable items={items} />
        </>
      )}

      {!weeksLoading && !weeksError && weeks.length === 0 && (
        <div className="p-empty">No weeks recorded yet. Enter some revenue first.</div>
      )}
    </main>
  );
}