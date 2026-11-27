import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../shared/context/ThemeContext';
import { DemoModeProvider } from '../shared/context/DemoModeContext';
import { ToastProvider } from '../shared/context/ToastContext';
import { ErrorBoundary } from '../shared/components/ui/ErrorBoundary';
import { isRetryableApiError } from '../shared/api/httpClient';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { AppRouter } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => failureCount < 2 && isRetryableApiError(error),
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
    mutations: {
      retry: false,
    },
  },
});

export function App() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <DemoModeProvider>
            <ToastProvider>
              <AuthProvider>
                <AppRouter />
              </AuthProvider>
            </ToastProvider>
          </DemoModeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
