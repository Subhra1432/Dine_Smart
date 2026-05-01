import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0c0a09',
              color: '#ffffff',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '600',
              padding: '12px 24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            },
            success: {
              iconTheme: {
                primary: '#f59e0b',
                secondary: '#0c0a09',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
