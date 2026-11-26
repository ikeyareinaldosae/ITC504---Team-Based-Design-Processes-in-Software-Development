import { useCallback, useEffect, useState } from 'react';
import { getWeeks, getWeeklyReport } from '../../shared/api/reports.api';
import type { WeeklyReport } from '../../shared/types/api.types';

const toMessage = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong.');

export function useWeeks() {
  const [weeks, setWeeks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    getWeeks(ctrl.signal)
      .then(setWeeks)
      .catch((e) => e.name !== 'AbortError' && setError(toMessage(e)))
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => ctrl.abort();
  }, []);

  return { weeks, loading, error };
}

export function useWeeklyReport(weekStart: string | null) {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!weekStart) {
      setReport(null);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    getWeeklyReport(weekStart, ctrl.signal)
      .then(setReport)
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setReport(null);
        setError(toMessage(e));
      })
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => ctrl.abort();
  }, [weekStart, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { report, loading, error, reload };
}