import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../../../i18n';
import { PlayerFormModal } from '../components/PlayerFormModal';

vi.mock('../../../shared/context/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe('PlayerFormModal validation', () => {
  it('shows inline alert error when submitted empty', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <PlayerFormModal open onClose={vi.fn()} editingPlayer={null} />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
