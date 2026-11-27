import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '../../../../i18n';
import { AppApiError } from '../../../api/httpClient';
import { ErrorBoundary } from '../ErrorBoundary';
import { ApiErrorBanner } from '../StateFeedback';

vi.mock('../../../context/DemoModeContext', () => ({
  useDemoMode: () => ({
    isDemoMode: false,
    enableDemoMode: vi.fn(),
    disableDemoMode: vi.fn(),
    toggleDemoMode: vi.fn(),
  }),
}));

function ThrowingWidget({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Simulated chart crash');
  }
  return <div>Healthy widget content</div>;
}

import type { ReactNode } from 'react';

function ChunkThrowingWidget(): ReactNode {
  if (Date.now() > 0) {
    throw new Error('Failed to fetch dynamically imported module: /assets/chunk.js');
  }
  return null;
}

describe('ErrorBoundary', () => {
  it('renders contained section fallback and resets when resetKeys change', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary variant="section" resetKeys={['/club-roi']}>
        <ThrowingWidget shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to render this section');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();

    rerender(
      <ErrorBoundary variant="section" resetKeys={['/scouting']}>
        <ThrowingWidget shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Healthy widget content')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('detects chunk load errors and displays bundle reload guidance', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary variant="page">
        <ChunkThrowingWidget />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'A new version of the application may have been deployed.',
    );
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});

describe('ApiErrorBanner', () => {
  it('renders status-aware copy and hides Demo Mode button for 403/429 errors', () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <ApiErrorBanner
        error={new AppApiError('Forbidden', { status: 403 })}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Access Denied');
    expect(screen.queryByRole('button', { name: /Explore Demo Dataset/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    rerender(
      <ApiErrorBanner error={new AppApiError('Too many requests', { status: 429 })} />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Too Many Requests');

    rerender(
      <ApiErrorBanner
        error={new AppApiError('Timeout', { status: 0, isNetworkError: true, isTimeout: true })}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Request Timed Out');
    expect(screen.getByRole('button', { name: /Explore Demo Dataset/i })).toBeInTheDocument();
  });
});
