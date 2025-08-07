import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App.jsx';
import './index.css';

// Create a new QueryClient instance for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent refetching when window regains focus
      refetchOnWindowFocus: false,

      // Retry failed queries once
      retry: 1,

      // Data is considered fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
    }
  }
});

// Render the application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Enables routing via React Router */}
    <BrowserRouter>

      {/* Provides React Query client to the entire app */}
      <QueryClientProvider client={queryClient}>

        {/* Main app component */}
        <App />

      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
