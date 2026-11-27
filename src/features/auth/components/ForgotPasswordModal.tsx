import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../shared/components/ui/Modal';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/context/ToastContext';
import { isValidEmail } from '../../../shared/utils/validation';

interface ForgotPasswordModalProps {
  open: boolean;
  initialEmail?: string;
  onClose: () => void;
}

export function ForgotPasswordModal({
  open,
  initialEmail = '',
  onClose,
}: ForgotPasswordModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(initialEmail);
      setErrorMsg(null);
      setSent(false);
    }
  }, [open, initialEmail]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!isValidEmail(email)) {
      setErrorMsg(t('auth.invalidEmail'));
      return;
    }
    setSent(true);
    showToast(t('auth.forgotModalSent', { email: email.trim() }), 'info');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('auth.forgotModalTitle')}
      subtitle={t('auth.forgotModalSubtitle')}
      size="md"
    >
      {sent ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            {t('auth.forgotModalSent', { email })}
          </p>
          <div className="flex justify-end">
            <Button onClick={onClose}>{t('common.confirm')}</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="rounded-xl px-3.5 py-2.5 text-xs font-medium bg-[var(--accent-negative-soft)] text-[var(--accent-negative)] border border-[var(--accent-negative)]/30"
            >
              {errorMsg}
            </div>
          )}
          <Input
            type="email"
            required
            label={t('auth.emailLabel')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{t('auth.forgotModalSubmit')}</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
