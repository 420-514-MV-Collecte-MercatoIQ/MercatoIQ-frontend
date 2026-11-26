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
      <div className="h-8 w-8 rounded-xl bg-[var(--bg-pill-active)] text-[var(--text-pill-active)] flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M16 7.5A8.5 8.5 0 1 0 24.5 16"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M11 21L19.5 12.5"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <circle cx="22.5" cy="9.5" r="2.6" fill="var(--accent-secondary)" />
        </svg>
      </div>
      {!compact && (
        <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
          Mercato<span className="text-[var(--accent-primary)]">IQ</span>
        </span>
      )}
    </Link>
  );
}
