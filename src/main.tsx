import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './presentation/styles/globals.css';
import App from './presentation/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
