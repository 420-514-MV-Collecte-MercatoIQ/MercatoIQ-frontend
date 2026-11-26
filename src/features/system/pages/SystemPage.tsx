import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Activity, Play, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { API_BASE_URL, AppApiError, httpClient } from '../../../shared/api/httpClient';
import { getHealthStatus } from '../../../shared/api/healthApi';
import { useDemoMode } from '../../../shared/context/DemoModeContext';
import { useAuth } from '../../auth/context/AuthContext';
import { useToast } from '../../../shared/context/ToastContext';
import { formatDate } from '../../../shared/utils/formatters';

export function SystemPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [pipelineLoading, setPipelineLoading] = useState(false);

  const healthQuery = useQuery({
    queryKey: ['health', 'manual'],
    queryFn: getHealthStatus,
    retry: false,
  });

  const handleTriggerPipeline = async () => {
    setPipelineLoading(true);
    try {
      await httpClient.post('/admin/pipeline/trigger');
      showToast(t('system.pipelineTriggered'), 'success');
    } catch (err) {
      if (err instanceof AppApiError) {
        showToast(t('system.pipelineUnavailable', { status: err.status || 'ERR' }), 'error');
      } else {
        showToast(t('common.apiOfflineTitle'), 'error');
      }
    } finally {
      setPipelineLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('system.title')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('system.subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Live API Health Check */}
        <Card className="space-y-5">
          <CardHeader
            kicker="GET /HEALTH"
            title={t('system.healthCardTitle')}
            action={
              <Badge tone={healthQuery.isSuccess ? 'positive' : 'negative'}>
                {healthQuery.isSuccess ? t('system.healthy') : t('system.unreachable')}
              </Badge>
            }
          />

          <div className="space-y-3 text-sm">
            {[
              [t('system.endpoint'), API_BASE_URL],
              [t('system.service'), healthQuery.data?.service ?? 'MercatoIQ API'],
              [t('system.version'), healthQuery.data?.version ?? 'v1'],
              [
                t('system.latency'),
                healthQuery.data ? `${healthQuery.data.latencyMs} ms` : '—',
              ],
              [
                t('system.timestamp'),
                healthQuery.data?.timestamp ? formatDate(healthQuery.data.timestamp, lang) : '—',
              ],
            ].map(([label, val]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 py-2 border-b border-[var(--border-subtle)]"
              >
                <span className="text-[var(--text-secondary)]">{label}</span>
                <span className="font-mono-num text-xs font-semibold text-[var(--text-primary)] truncate max-w-[60%]">
                  {val}
                </span>
              </div>
            ))}
          </div>

          <Button
            variant="secondary"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => void healthQuery.refetch()}
            disabled={healthQuery.isFetching}
          >
            {t('system.checkNow')}
          </Button>
        </Card>

        {/* Data Source Mode + RBAC Admin Panel */}
        <div className="space-y-5">
          <Card className="space-y-4">
            <CardHeader
              kicker="DATA SOURCE"
              title={t('system.dataSourceTitle')}
              action={
                <Badge tone={isDemoMode ? 'secondary' : 'positive'}>
                  {isDemoMode ? t('common.demoMode') : t('common.liveApi')}
                </Badge>
              }
            />
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t('system.dataSourceDesc')}
            </p>
            <Button
              variant={isDemoMode ? 'secondary' : 'primary'}
              leftIcon={isDemoMode ? <Activity className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              onClick={toggleDemoMode}
            >
              {isDemoMode ? t('common.disableDemo') : t('common.enableDemo')}
            </Button>
          </Card>

          <Card className="space-y-4">
            <CardHeader
              kicker="RBAC · PYTHON MEDALLION"
              title={t('system.adminTitle')}
              action={
                <Badge tone={isAdmin ? 'positive' : 'neutral'}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{user?.role || t('common.guest')}</span>
                </Badge>
              }
            />
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t('system.adminDesc')}
            </p>
            {isAuthenticated && isAdmin ? (
              <Button
                leftIcon={<Play className="h-4 w-4" />}
                onClick={() => void handleTriggerPipeline()}
                disabled={pipelineLoading}
              >
                {pipelineLoading ? t('common.loading') : t('system.triggerPipeline')}
              </Button>
            ) : (
              <p className="text-xs font-medium text-[var(--accent-secondary)]">
                {t('system.signInRequired')}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
