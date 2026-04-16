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
        <BrowserRouter>
          <App />
          <Toaster position="top-right" toastOptions={{ className: 'dark:bg-[#1e1b3a] dark:text-slate-100 bg-white text-slate-900 border dark:border-white/10 border-slate-200 shadow-lg' }} />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
