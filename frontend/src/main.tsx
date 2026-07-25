import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GlobalSpinner from './components/GlobalSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <App />
          <GlobalSpinner />
        </StoreProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
