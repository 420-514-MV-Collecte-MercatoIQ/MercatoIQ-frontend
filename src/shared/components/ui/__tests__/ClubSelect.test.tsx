import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../../../../i18n';
import { ClubSelect } from '../ClubSelect';
import { getClubs } from '../../../api/referenceApi';

vi.mock('../../../api/referenceApi', () => ({ getClubs: vi.fn() }));

const arsenal = { club_id: 11, name: 'Arsenal FC', domestic_competition_id: 'GB1' };

function renderSelect(props: Partial<Parameters<typeof ClubSelect>[0]> = {}) {
  const onChange = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ClubSelect label="Club" value={null} onChange={onChange} {...props} />
    </QueryClientProvider>,
  );
  return onChange;
}

describe('ClubSelect', () => {
  beforeEach(() => {
    vi.mocked(getClubs).mockReset();
    vi.mocked(getClubs).mockResolvedValue({
      data: [arsenal],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
  });

  it('does not search with fewer than 2 letters', async () => {
    renderSelect();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } });
    await new Promise((r) => setTimeout(r, 400));
    expect(getClubs).not.toHaveBeenCalled();
  });

  it('searches by name and competition, then selects a club', async () => {
    const onChange = renderSelect({ competitionId: 'GB1' });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ars' } });

    fireEvent.click(await screen.findByRole('option', { name: /Arsenal FC/ }));

    expect(getClubs).toHaveBeenCalledWith({ search: 'ars', competition_id: 'GB1', limit: 10 });
    expect(onChange).toHaveBeenCalledWith({ club_id: 11, club_name: 'Arsenal FC' });
  });

  it('shows a message when no club matches', async () => {
    vi.mocked(getClubs).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });
    renderSelect();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzz' } });
    expect(await screen.findByText('No club found')).toBeInTheDocument();
  });

  it('shows the selected club and clears it', () => {
    const onChange = renderSelect({ value: { club_id: 11, club_name: 'Arsenal FC' } });
    expect(screen.getByText('Arsenal FC')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove Arsenal FC' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});

describe('ClubSelect debounce', () => {
  it('waits for typing to stop before searching', async () => {
    vi.mocked(getClubs).mockClear();
    renderSelect();
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 're' } });
    fireEvent.change(input, { target: { value: 'rea' } });
    fireEvent.change(input, { target: { value: 'real' } });

    await waitFor(() => expect(getClubs).toHaveBeenCalledTimes(1));
    expect(getClubs).toHaveBeenCalledWith({ search: 'real', competition_id: undefined, limit: 10 });
  });
});
