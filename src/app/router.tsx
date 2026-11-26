import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppShell } from '../shared/components/layout/AppShell';
import { Card } from '../shared/components/ui/Card';
import { Button } from '../shared/components/ui/Button';
import { LandingPage } from '../features/landing/pages/LandingPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { ClubRoiPage } from '../features/club-roi/pages/ClubRoiPage';
import { ScoutingU23Page } from '../features/scouting/pages/ScoutingU23Page';
import { UclVsDomesticPage } from '../features/ucl-performance/pages/UclVsDomesticPage';
import { SuperSubsPage } from '../features/super-subs/pages/SuperSubsPage';
import { PlayersPage } from '../features/players/pages/PlayersPage';
import { PlayerDetailPage } from '../features/players/pages/PlayerDetailPage';
import { TransfersPage } from '../features/transfers/pages/TransfersPage';
import { SystemPage } from '../features/system/pages/SystemPage';

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-canvas)]">
      <Card padding="lg" className="max-w-md w-full text-center space-y-4">
        <div className="font-display text-6xl font-extrabold text-[var(--accent-primary)]">404</div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{t('notFound.title')}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{t('notFound.description')}</p>
        <Link to="/dashboard" className="inline-block pt-2">
          <Button>{t('notFound.backHome')}</Button>
        </Link>
      </Card>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/club-roi" element={<ClubRoiPage />} />
          <Route path="/scouting" element={<ScoutingU23Page />} />
          <Route path="/ucl-vs-domestic" element={<UclVsDomesticPage />} />
          <Route path="/super-subs" element={<SuperSubsPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/players/:id" element={<PlayerDetailPage />} />
          <Route path="/transfers" element={<TransfersPage />} />
          <Route path="/system" element={<SystemPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
