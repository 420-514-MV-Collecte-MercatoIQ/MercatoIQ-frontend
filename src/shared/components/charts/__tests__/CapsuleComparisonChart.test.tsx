import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '../../../../i18n';
import { CapsuleComparisonChart } from '../CapsuleComparisonChart';

describe('CapsuleComparisonChart', () => {
  it('renders floating tooltip on hover with player details and hides on mouse leave', () => {
    render(
      <CapsuleComparisonChart
        primaryLegend="Sub G+A/90"
        secondaryLegend="Starter G+A/90"
        items={[
          {
            id: 'sub-1',
            label: 'Alexander Sørloth',
            subLabel: 'Atlético de Madrid',
            primaryValue: 1.6,
            secondaryValue: 0.74,
            primaryDisplay: '1.60',
            secondaryDisplay: '0.74',
          },
        ]}
      />,
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    const row = screen.getByText('Alexander Sørloth').closest('[tabindex="0"]');
    expect(row).not.toBeNull();
    fireEvent.mouseEnter(row!);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Alexander Sørloth');
    expect(tooltip).toHaveTextContent('Atlético de Madrid');
    expect(tooltip).toHaveTextContent('+0.86');

    fireEvent.mouseLeave(row!);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
