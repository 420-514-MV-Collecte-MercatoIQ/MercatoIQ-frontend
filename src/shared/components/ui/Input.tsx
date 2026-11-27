import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/formatters';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...rest }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'h-10 w-full rounded-2xl px-3.5 py-2 text-sm leading-[22px] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]',
          'border border-[var(--border-subtle)] placeholder:text-[var(--text-muted)]',
          'focus:outline-none focus:border-[var(--accent-primary)] transition-colors',
          error && 'border-[var(--accent-negative)]',
          className,
        )}
        {...rest}
      />
      {error && <span className="text-xs text-[var(--accent-negative)]">{error}</span>}
      {!error && hint && <span className="text-xs text-[var(--text-muted)]">{hint}</span>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, id, children, ...rest }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'h-10 w-full rounded-2xl px-3.5 py-2 text-sm leading-[22px] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]',
          'border border-[var(--border-subtle)] cursor-pointer',
          'focus:outline-none focus:border-[var(--accent-primary)] transition-colors',
          error && 'border-[var(--accent-negative)]',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="text-xs text-[var(--accent-negative)]">{error}</span>}
    </div>
  );
}
