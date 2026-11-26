import { Component, type ErrorInfo, type ReactNode } from 'react';
import { withTranslation, type WithTranslation } from 'react-i18next';
import { AlertOctagon, Home, RotateCw } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface ErrorBoundaryProps extends WithTranslation {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

class ErrorBoundaryInner extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Unexpected rendering error',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('MercatoIQ ErrorBoundary caught an error:', error, info);
  }

  render() {
    const { hasError, errorMessage } = this.state;
    const { t, children } = this.props;

    if (!hasError) {
      return children;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-canvas)] text-[var(--text-primary)]">
        <Card padding="lg" className="max-w-lg w-full text-center space-y-5">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[var(--accent-negative-soft)] text-[var(--accent-negative)] flex items-center justify-center">
            <AlertOctagon className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{t('errors.boundaryTitle')}</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('errors.boundaryDescription')}
            </p>
          </div>
          {errorMessage && (
            <div className="rounded-2xl p-3 bg-[var(--bg-surface-elevated)] text-xs font-mono-num text-[var(--text-muted)] break-words">
              {errorMessage}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              leftIcon={<RotateCw className="h-4 w-4" />}
              onClick={() => window.location.reload()}
            >
              {t('errors.reloadPage')}
            </Button>
            <Button
              leftIcon={<Home className="h-4 w-4" />}
              onClick={() => {
                this.setState({ hasError: false, errorMessage: null });
                window.location.href = '/dashboard';
              }}
            >
              {t('notFound.backHome')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryInner);
