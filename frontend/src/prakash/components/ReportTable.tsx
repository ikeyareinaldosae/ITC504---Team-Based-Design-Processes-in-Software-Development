import { Link } from 'react-router-dom';
import type { WeeklyReportItem } from '../../shared/types/api.types';

export const formatAUD = (n: number) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n);

export const formatWeek = (weekStart: string) => {
  const d = new Date(`${weekStart}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return weekStart;
  const text = new Intl.DateTimeFormat('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(d);
  return `Week of ${text}`;
};

interface Props {
  items: WeeklyReportItem[];
}

export default function ReportTable({ items }: Props) {
  const rows = [...items].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="p-table-wrap">
      <table className="p-table">
        <caption className="p-hint" style={{ textAlign: 'left', paddingBottom: 8 }}>
          Revenue per movie, highest first
        </caption>
        <thead>
          <tr>
            <th scope="col">Movie</th>
            <th scope="col" className="num">Revenue (AUD)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.movieId}>
              <td><Link to={`/movies/${r.movieId}`}>{r.title}</Link></td>
              <td className="num">{formatAUD(r.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}