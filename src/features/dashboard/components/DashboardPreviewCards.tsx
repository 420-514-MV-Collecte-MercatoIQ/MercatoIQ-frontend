import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { LoadingSkeleton } from '../../../shared/components/ui/StateFeedback';
import type {
  GoldSuperSubs,
  GoldUndervaluedScouting,
} from '../../../shared/types/domain.types';
import {
  formatCompactEur,
  formatPer90,
  formatRatio,
} from '../../../shared/utils/formatters';

interface DashboardPreviewCardsProps {
  scoutingRows: GoldUndervaluedScouting[];
  scoutingLoading: boolean;
  superSubRows: GoldSuperSubs[];
  superSubLoading: boolean;
}

export function DashboardPreviewCards({
  scoutingRows,
  scoutingLoading,
  superSubRows,
  superSubLoading,
}: DashboardPreviewCardsProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card>
        <CardHeader
          kicker="Q2 · MACHINE LEARNING"
          title={t('dashboard.scoutingPreviewTitle')}
          action={
            <Link
              to="/scouting"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-primary)] hover:underline"
            >
              {t('dashboard.exploreAll')}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {scoutingLoading ? (
          <LoadingSkeleton rows={4} />
        ) : (
          <div className="space-y-2.5">
            {scoutingRows.map((p) => (
              <Link
                key={`${p.player_id}-${p.season}`}
                to={`/players/${p.player_id}`}
                className="flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 bg-[var(--bg-surface-elevated)] hover:border-[var(--accent-primary)] border border-transparent transition-all"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {p.player_name}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] truncate">
                    {p.club_name || p.competition_id} · {p.age ? `${p.age}y` : 'U23'}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-mono-num text-[var(--text-secondary)]">
                      {formatCompactEur(p.market_value_eur, lang)} →{' '}
                      <span className="font-bold text-[var(--text-primary)]">
                        {formatCompactEur(p.estimated_value_eur, lang)}
                      </span>
                    </div>
                  </div>
                  <Badge tone="positive" className="font-mono-num">
                    {formatRatio(p.undervalue_ratio, 'x', lang)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          kicker="Q4 · BENCH IMPACT"
          title={t('dashboard.superSubsPreviewTitle')}
          action={
            <Link
              to="/super-subs"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-primary)] hover:underline"
            >
              {t('dashboard.exploreAll')}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {superSubLoading ? (
          <LoadingSkeleton rows={4} />
        ) : (
          <div className="space-y-2.5">
            {superSubRows.map((s) => (
              <Link
                key={`${s.player_id}-${s.season}-${s.competition_id}`}
                to={`/players/${s.player_id}`}
                className="flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 bg-[var(--bg-surface-elevated)] hover:border-[var(--accent-primary)] border border-transparent transition-all"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {s.player_name}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] truncate">
                    {s.club_name || s.competition_id} · {s.sub_appearances} apps
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono-num text-[var(--text-secondary)]">
                    {formatPer90(s.sub_goal_contributions_per_90, lang)} G+A/90
                  </span>
                  <Badge tone="primary" className="font-mono-num">
                    {formatPer90(s.super_sub_score, lang)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
