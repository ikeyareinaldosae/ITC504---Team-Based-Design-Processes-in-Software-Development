import { formatWeek } from './ReportTable';

interface Props {
  weeks: string[];
  value: string | null;
  onChange: (weekStart: string) => void;
  disabled?: boolean;
}

export default function WeekSelector({ weeks, value, onChange, disabled }: Props) {
  return (
    <div className="p-field">
      <label htmlFor="week-select">Week</label>
      <select
        id="week-select"
        value={value ?? ''}
        disabled={disabled || weeks.length === 0}
        onChange={(e) => onChange(e.target.value)}
      >
        {weeks.length === 0 && <option value="">No weeks available</option>}
        {weeks.map((w) => (
          <option key={w} value={w}>
            {formatWeek(w)}
          </option>
        ))}
      </select>
    </div>
  );
}