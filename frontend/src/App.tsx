import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MovieInput from './prakash/pages/MovieInput';
import WeeklyReport from './prakash/pages/WeeklyReport';
import MovieDetails from './prakash/pages/MovieDetails';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/report" replace />} />
        <Route path="/input" element={<MovieInput />} />
        <Route path="/report" element={<WeeklyReport />} />
        <Route path="/movies/:movieId" element={<MovieDetails />} />
      </Routes>
    </BrowserRouter>
  );
}