import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Clock, ExternalLink, Mail, MapPin } from 'lucide-react';
import { API_BASE_URL } from '../../../shared/api/httpClient';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { cn } from '../../../shared/utils/formatters';

export function ContactInfoPanel() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const swaggerUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '/api/docs');

  const faqs = [
    { q: t('contact.faq.q1'), a: t('contact.faq.a1') },
    { q: t('contact.faq.q2'), a: t('contact.faq.a2') },
    { q: t('contact.faq.q3'), a: t('contact.faq.a3') },
    { q: t('contact.faq.q4'), a: t('contact.faq.a4') },
  ];

  return (
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
              <div className="text-xs text-[var(--text-secondary)]">{t('contact.locationValue')}</div>
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
  );
}
