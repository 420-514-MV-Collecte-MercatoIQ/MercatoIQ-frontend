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

  it('rejects non-positive player_id and incomplete valuation rows inline', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <PlayerFormModal open onClose={vi.fn()} editingPlayer={null} />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText(/Transfermarkt Player ID/i), {
      target: { value: '0' },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Kylian Mbappé' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Player ID must be a positive integer.');

    fireEvent.change(screen.getByLabelText(/Transfermarkt Player ID/i), {
      target: { value: '342229' },
    });
    fireEvent.change(screen.getByLabelText(/Current Market Value/i), {
      target: { value: '-50' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Market values must be 0 or greater.');
  });
});
