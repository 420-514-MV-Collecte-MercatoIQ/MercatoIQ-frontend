import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full inline-flex items-center justify-center bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
      title={theme === 'light' ? t('common.darkMode') : t('common.lightMode')}
      aria-label={theme === 'light' ? t('common.darkMode') : t('common.lightMode')}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
