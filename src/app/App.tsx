import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../shared/context/ThemeContext';
import { DemoModeProvider } from '../shared/context/DemoModeContext';
import { ToastProvider } from '../shared/context/ToastContext';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { AppRouter } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  return (
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
  );
}
