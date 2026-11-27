import { Component, type ErrorInfo, type ReactNode } from 'react';
import { withTranslation, type WithTranslation } from 'react-i18next';
import { AlertOctagon, Home, RotateCw } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface ErrorBoundaryProps extends WithTranslation {
  children: ReactNode;
  variant?: 'page' | 'section';
  resetKeys?: unknown[];
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
  isChunkError: boolean;
}

const CHUNK_ERROR_REGEX =
  /ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk/i;

function haveResetKeysChanged(prev?: unknown[], next?: unknown[]): boolean {
  if (!prev && !next) return false;
  if (!prev || !next) return true;
  if (prev.length !== next.length) return true;
  return prev.some((val, idx) => !Object.is(val, next[idx]));
}

class ErrorBoundaryInner extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
    isChunkError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const rawMsg = error?.message || '';
    const isChunkError = CHUNK_ERROR_REGEX.test(rawMsg) || CHUNK_ERROR_REGEX.test(error?.name || '');
    return {
      hasError: true,
      errorMessage: rawMsg || 'Unexpected rendering error',
      isChunkError,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('MercatoIQ ErrorBoundary caught an error:', error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && haveResetKeysChanged(prevProps.resetKeys, this.props.resetKeys)) {
      this.setState({ hasError: false, errorMessage: null, isChunkError: false });
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: null, isChunkError: false });
    this.props.onReset?.();
  };

  render() {
    const { hasError, errorMessage, isChunkError } = this.state;
    const { t, children, variant = 'page' } = this.props;

    if (!hasError) {
      return children;
    }

    if (variant === 'section') {
      return (
        <div role="alert" className="w-full">
          <Card padding="md" className="w-full text-center space-y-3">
            <div className="mx-auto h-10 w-10 rounded-2xl bg-[var(--accent-negative-soft)] text-[var(--accent-negative)] flex items-center justify-center">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{t('errors.sectionTitle')}</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isChunkError ? t('errors.chunkLoadDescription') : t('errors.sectionDescription')}
              </p>
            </div>
            {errorMessage && (
              <div className="rounded-xl px-3 py-2 bg-[var(--bg-surface-elevated)] text-[11px] font-mono-num text-[var(--text-muted)] break-words">
                {errorMessage}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RotateCw className="h-3.5 w-3.5" />}
                onClick={this.handleReset}
              >
                {t('errors.tryAgain')}
              </Button>
              {isChunkError && (
                <Button size="sm" onClick={() => window.location.reload()}>
                  {t('errors.reloadPage')}
                </Button>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div
        role="alert"
        className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-canvas)] text-[var(--text-primary)]"
      >
        <Card padding="lg" className="max-w-lg w-full text-center space-y-5">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[var(--accent-negative-soft)] text-[var(--accent-negative)] flex items-center justify-center">
            <AlertOctagon className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{t('errors.boundaryTitle')}</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {isChunkError ? t('errors.chunkLoadDescription') : t('errors.boundaryDescription')}
            </p>
          </div>
          {errorMessage && (
            <div className="rounded-2xl p-3 bg-[var(--bg-surface-elevated)] text-xs font-mono-num text-[var(--text-muted)] break-words">
              {errorMessage}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button variant="secondary" onClick={this.handleReset}>
              {t('errors.tryAgain')}
            </Button>
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
                this.handleReset();
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
