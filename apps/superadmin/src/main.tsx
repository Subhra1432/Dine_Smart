import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { ThemeProvider } from './lib/ThemeProvider';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: 1 } } });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="dinesmart-superadmin-theme">
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
          <Toaster position="top-right" toastOptions={{ className: 'dark:bg-inverse-surface dark:text-inverse-on-surface bg-surface-container-lowest text-on-surface border dark:border-outline/30 border-outline-variant shadow-xl rounded-xl font-medium' }} />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
