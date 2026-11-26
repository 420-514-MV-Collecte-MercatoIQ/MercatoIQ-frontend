import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/formatters';

export function LanguageToggle({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  const switchLang = (lang: 'en' | 'fr') => {
    void i18n.changeLanguage(lang);
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full p-1 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]',
        className,
      )}
      role="group"
      aria-label="Language switch"
    >
      {(['en', 'fr'] as const).map((lang) => {
        const active = current === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => switchLang(lang)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer',
              active
                ? 'bg-[var(--bg-pill-active)] text-[var(--text-pill-active)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            )}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
}
