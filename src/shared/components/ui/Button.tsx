import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/formatters';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'pill';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--bg-pill-active)] text-[var(--text-pill-active)] hover:opacity-90 shadow-[var(--shadow-pill)]',
  secondary:
    'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]',
  danger:
    'bg-[var(--accent-negative)] text-white hover:opacity-90',
  pill:
    'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] hover:opacity-90',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-full gap-1.5',
  md: 'h-10 px-4 text-sm rounded-full gap-2',
  lg: 'h-11 px-6 text-sm rounded-full gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  );
}
