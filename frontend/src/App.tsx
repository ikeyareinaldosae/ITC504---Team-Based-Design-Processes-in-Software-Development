import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import MovieInput from './prakash/pages/MovieInput';
import WeeklyReport from './prakash/pages/WeeklyReport';
import MovieDetails from './prakash/pages/MovieDetails';
import AnalyticsDashboard from './avishek/pages/AnalyticsDashboard';
import PerformanceAnalysis from './avishek/pages/PerformanceAnalysis';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/report" replace />} />
        <Route path="/input" element={<MovieInput />} />
        <Route path="/report" element={<WeeklyReport />} />
        <Route path="/movies/:movieId" element={<MovieDetails />} />
        <Route path="/dashboard" element={<AnalyticsDashboard />} />
        <Route path="/performance-analysis" element={<PerformanceAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}