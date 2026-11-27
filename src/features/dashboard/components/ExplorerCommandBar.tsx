import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';

const EXPLORE_PILLS = [
  { cmd: '/club-roi', to: '/club-roi' },
  { cmd: '/scouting-u23', to: '/scouting' },
  { cmd: '/ucl-vs-domestic', to: '/ucl-vs-domestic' },
  { cmd: '/super-subs', to: '/super-subs' },
  { cmd: '/players', to: '/players' },
  { cmd: '/transfers', to: '/transfers' },
];

export function ExplorerCommandBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      navigate('/club-roi');
      return;
    }
    const matched = EXPLORE_PILLS.find(
      (p) => p.cmd.includes(normalized) || p.to.includes(normalized),
    );
    if (matched) {
      navigate(matched.to);
      return;
    }
    navigate(`/players?name=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div
      className="rounded-2xl p-4 border border-[var(--border-subtle)] backdrop-blur-md space-y-3"
      style={{ backgroundColor: 'var(--frosted-bg)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
          <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" />
          <span>{t('dashboard.explorerPrompt')}</span>
        </div>
        <div className="hidden sm:flex flex-wrap gap-1.5">
          {EXPLORE_PILLS.map((pill) => (
            <Link
              key={pill.cmd}
              to={pill.to}
              className="font-mono-num text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary)] hover:opacity-85 transition-opacity"
            >
              {pill.cmd}
            </Link>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('dashboard.explorerPlaceholder')}
          className="flex-1 min-w-0 h-10 rounded-2xl px-3.5 sm:px-4 text-sm bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-primary)]"
        />
        <button
          type="submit"
          className="h-10 px-3.5 sm:px-4 shrink-0 rounded-2xl bg-[var(--bg-pill-active)] text-[var(--text-pill-active)] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:opacity-90"
        >
          <span>{t('common.search')}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
