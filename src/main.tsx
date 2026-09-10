import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import './index.css';

import { HomePage } from './pages/HomePage';
import { ModulePage } from './pages/ModulePage';
import { NotFoundPage } from './pages/NotFoundPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* BASE_URL keeps routes correct under the GitHub Pages subpath. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:course" element={<HomePage />} />
        <Route path="/:course/:moduleId" element={<ModulePage />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
