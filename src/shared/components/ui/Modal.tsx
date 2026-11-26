import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/formatters';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'lg',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const maxW =
    size === 'md' ? 'max-w-lg' : size === 'xl' ? 'max-w-3xl' : 'max-w-2xl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={cn(
          'surface-card w-full rounded-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl',
          maxW,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
            {subtitle && (
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  isLoading,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{description}</p>
      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? t('common.loading') : t('common.delete')}
        </Button>
      </div>
    </Modal>
  );
}
