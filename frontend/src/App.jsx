import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import TryPage from './pages/TryPage';
import DocsPage from './pages/DocsPage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function App() {
  const swaggerUrl = `${API_BASE_URL}/docs`;

  return (
    <BrowserRouter>
      <Navbar swaggerUrl={swaggerUrl} />
      <Routes>
        <Route path="/" element={<TryPage />} />
        <Route path="/docs" element={<DocsPage />} />
        {/* Redirect unknown paths back to home */}
        <Route path="*" element={<TryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
