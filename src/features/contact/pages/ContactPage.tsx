import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Send,
} from 'lucide-react';
import { PublicNavbar } from '../../../shared/components/layout/PublicNavbar';
import { Footer } from '../../../shared/components/layout/Footer';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Input, Select } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { API_BASE_URL, AppApiError, httpClient } from '../../../shared/api/httpClient';
import { useDemoMode } from '../../../shared/context/DemoModeContext';
import { useToast } from '../../../shared/context/ToastContext';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';
import { cn } from '../../../shared/utils/formatters';

const TOPICS = ['scouting', 'api', 'support', 'partnership'] as const;

export function ContactPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('contact.title'));

  const { isDemoMode } = useDemoMode();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>('scouting');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const swaggerUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '/api/docs');

  const faqs = [
    { q: t('contact.faq.q1'), a: t('contact.faq.a1') },
    { q: t('contact.faq.q2'), a: t('contact.faq.a2') },
    { q: t('contact.faq.q3'), a: t('contact.faq.a3') },
    { q: t('contact.faq.q4'), a: t('contact.faq.a4') },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.includes('@') || message.trim().length < 10) {
      setErrorMsg(t('contact.validationError'));
      return;
    }

    setSubmitting(true);
    const refCode = `MIQ-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      if (!isDemoMode) {
        await httpClient.post('/contact', {
          name: name.trim(),
          email: email.trim(),
          topic,
          subject: subject.trim() || topic,
          message: message.trim(),
        });
      }
      setTicketId(refCode);
      showToast(t('contact.sentSuccess'), 'success');
    } catch (err) {
      if (err instanceof AppApiError && (err.status === 404 || err.isNetworkError)) {
        setTicketId(refCode);
        showToast(t('contact.sentLocalConfirm'), 'info');
      } else {
        const msg = err instanceof AppApiError ? err.message : t('contact.validationError');
        setErrorMsg(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTicketId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        <div className="max-w-2xl space-y-3">
          <Badge tone="primary">{t('contact.badge')}</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t('contact.title')}</h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Contact Form */}
          <Card padding="lg" className="lg:col-span-7">
            {ticketId ? (
              <div className="py-10 text-center space-y-4">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-[var(--accent-positive-soft)] text-[var(--accent-positive)] flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-bold">{t('contact.successTitle')}</h2>
                  <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                    {t('contact.successBody', { ticket: ticketId })}
                  </p>
                </div>
                <div className="pt-2">
                  <Button variant="secondary" onClick={resetForm}>
                    {t('contact.sendAnother')}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <CardHeader
                  kicker="SUPPORT & INQUIRIES"
                  title={t('contact.formTitle')}
                  subtitle={t('contact.formSubtitle')}
                />

                {errorMsg && (
                  <div className="rounded-2xl px-4 py-3 text-xs font-medium bg-[var(--accent-negative-soft)] text-[var(--accent-negative)]">
                    {errorMsg}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    required
                    label={t('contact.nameLabel')}
                    placeholder={t('contact.namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    required
                    type="email"
                    label={t('contact.emailLabel')}
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Select
                    label={t('contact.topicLabel')}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as (typeof TOPICS)[number])}
                  >
                    {TOPICS.map((item) => (
                      <option key={item} value={item}>
                        {t(`contact.topics.${item}`)}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label={t('contact.subjectLabel')}
                    placeholder={t('contact.subjectPlaceholder')}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="contact-message"
                    className="text-xs font-semibold text-[var(--text-secondary)]"
                  >
                    {t('contact.messageLabel')}
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('contact.messagePlaceholder')}
                    className="w-full rounded-2xl p-3.5 text-sm bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-y"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    isLoading={submitting}
                    rightIcon={<Send className="h-4 w-4" />}
                  >
                    {t('contact.submit')}
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Direct Channels + FAQ */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="space-y-4">
              <CardHeader kicker="CHANNELS" title={t('contact.directTitle')} />
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 rounded-2xl p-3 bg-[var(--bg-surface-elevated)]">
                  <Mail className="h-4 w-4 text-[var(--accent-primary)] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold">{t('contact.emailChannel')}</div>
                    <div className="text-xs font-mono-num text-[var(--text-secondary)]">
                      intelligence@mercatoiq.io
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl p-3 bg-[var(--bg-surface-elevated)]">
                  <MapPin className="h-4 w-4 text-[var(--accent-secondary)] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold">{t('contact.locationLabel')}</div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {t('contact.locationValue')}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl p-3 bg-[var(--bg-surface-elevated)]">
                  <Clock className="h-4 w-4 text-[var(--accent-positive)] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold">{t('contact.slaLabel')}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{t('contact.slaValue')}</div>
                  </div>
                </div>
                <a
                  href={swaggerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl p-3 bg-[var(--bg-surface-elevated)] hover:border-[var(--accent-primary)] border border-transparent transition-colors text-xs font-semibold"
                >
                  <span>{t('contact.apiDocsLink')}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                </a>
              </div>
            </Card>

            <Card className="space-y-3">
              <CardHeader kicker="FAQ" title={t('contact.faqTitle')} />
              <div className="space-y-2">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform',
                            isOpen && 'rotate-180',
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-3 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-2.5">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
