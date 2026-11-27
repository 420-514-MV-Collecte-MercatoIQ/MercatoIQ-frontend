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
    <Link to={to} className={cn('inline-flex items-center gap-1.5 sm:gap-2.5 group shrink-0', className)}>
      <svg
        viewBox="0 0 32 32"
        className="h-6 w-6 sm:h-7 sm:w-7 text-[var(--text-primary)] shrink-0 transition-transform group-hover:scale-105"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4 8.5Q16 3.5 28 8.5L26.4 10.6Q16 6.4 5.6 10.6Z" />
        <path d="M5.5 13H10.2L16 20.2L21.8 13H26.5L23.4 27.5H20.1L21.8 18.6L16 25.4L10.2 18.6L11.9 27.5H8.6Z" />
      </svg>
      {!compact && (
        <span className="font-bold text-sm sm:text-base tracking-tight text-[var(--text-primary)]">
          Mercato<span className="text-[var(--accent-primary)]">IQ</span>
        </span>
      )}
    </Link>
  );
}
