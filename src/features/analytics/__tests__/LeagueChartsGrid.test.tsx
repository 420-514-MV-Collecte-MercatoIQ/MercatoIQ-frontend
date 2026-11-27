import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '../../../i18n';
import { TOP_FIVE_LEAGUES } from '../../../shared/types/constants';
import { LeagueChartsGrid } from '../components/LeagueChartsGrid';

const mockSeries = TOP_FIVE_LEAGUES.map((league) => ({
  league,
  data: [{ id: `${league.id}-1`, name: `Club ${league.id}` }],
  isLoading: false,
  isError: false,
}));

describe('LeagueChartsGrid', () => {
  it('renders all 5 fixed league chart cards when no league filter is selected', () => {
    render(
      <LeagueChartsGrid
        kicker="TOP 5"
        title="Fixed League Charts"
        series={mockSeries}
        renderChart={(_items, leagueId) => <div data-testid={`chart-${leagueId}`}>{leagueId}</div>}
      />,
    );

    expect(screen.getByText(/5 \/ 5/)).toBeInTheDocument();
    for (const league of TOP_FIVE_LEAGUES) {
      expect(screen.getByText(league.label)).toBeInTheDocument();
      expect(screen.getByTestId(`chart-${league.id}`)).toBeInTheDocument();
    }
  });

  it('filters to a single league card and exposes reset button when a league is selected', () => {
    const onSelectLeague = vi.fn();
    render(
      <LeagueChartsGrid
        kicker="TOP 5"
        title="Fixed League Charts"
        series={mockSeries}
        selectedLeague="GB1"
        onSelectLeague={onSelectLeague}
        renderChart={(_items, leagueId) => <div data-testid={`chart-${leagueId}`}>{leagueId}</div>}
      />,
    );

    expect(screen.getByText(/1 \/ 5/)).toBeInTheDocument();
    expect(screen.getByTestId('chart-GB1')).toBeInTheDocument();
    expect(screen.queryByTestId('chart-ES1')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(onSelectLeague).toHaveBeenCalledWith(undefined);
  });

  it('renders defensive empty state with reset action when selectedLeague is outside Top 5', () => {
    const onSelectLeague = vi.fn();
    render(
      <LeagueChartsGrid
        kicker="TOP 5"
        title="Fixed League Charts"
        series={mockSeries}
        selectedLeague="CL"
        onSelectLeague={onSelectLeague}
        renderChart={(_items, leagueId) => <div data-testid={`chart-${leagueId}`}>{leagueId}</div>}
      />,
    );

    expect(screen.getByText(/0 \/ 5/)).toBeInTheDocument();
    expect(screen.getByText('No matching records found')).toBeInTheDocument();
    const showAllButtons = screen.getAllByRole('button', { name: 'Show all leagues' });
    expect(showAllButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(showAllButtons[0]);
    expect(onSelectLeague).toHaveBeenCalledWith(undefined);
  });
});
