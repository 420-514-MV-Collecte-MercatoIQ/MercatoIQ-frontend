import { Link } from 'react-router-dom';
import { cn } from '../../utils/formatters';

export function BrandLogo({
  to = '/',
  compact = false,
  className,
}: {
  to?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5 group', className)}>
      <div className="h-9 w-9 rounded-2xl bg-[var(--bg-pill-active)] text-[var(--text-pill-active)] flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M4 17V7l4.5 5L12 7l3.5 5L20 7v10"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="18.5" r="1.6" fill="var(--accent-secondary)" />
        </svg>
      </div>
      {!compact && (
        <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">
          Mercato<span className="text-[var(--accent-primary)]">IQ</span>
        </span>
      )}
    </Link>
  );
}
