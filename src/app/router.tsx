import { Suspense, lazy } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppShell } from '../shared/components/layout/AppShell';
import { ScrollToTop } from '../shared/components/layout/ScrollToTop';
import { Card } from '../shared/components/ui/Card';
import { Button } from '../shared/components/ui/Button';
import { PageLoader, TopProgressBar } from '../shared/components/ui/Loaders';
import { GuestRoute, ProtectedRoute } from '../features/auth/components/RouteGuards';

const LandingPage = lazy(() =>
  import('../features/landing/pages/LandingPage').then((m) => ({ default: m.LandingPage })),
);
const LoginPage = lazy(() =>
  import('../features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('../features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const AuthCallbackPage = lazy(() =>
  import('../features/auth/pages/AuthCallbackPage').then((m) => ({
    default: m.AuthCallbackPage,
  })),
);
const ContactPage = lazy(() =>
  import('../features/contact/pages/ContactPage').then((m) => ({ default: m.ContactPage })),
);
const AboutPage = lazy(() =>
  import('../features/about/pages/AboutPage').then((m) => ({ default: m.AboutPage })),
);
const LegalPage = lazy(() =>
  import('../features/legal/pages/LegalPage').then((m) => ({ default: m.LegalPage })),
);
const ProfilePage = lazy(() =>
  import('../features/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const DashboardPage = lazy(() =>
  import('../features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const ClubRoiPage = lazy(() =>
  import('../features/club-roi/pages/ClubRoiPage').then((m) => ({ default: m.ClubRoiPage })),
);
const ScoutingU23Page = lazy(() =>
  import('../features/scouting/pages/ScoutingU23Page').then((m) => ({
    default: m.ScoutingU23Page,
  })),
);
const UclVsDomesticPage = lazy(() =>
  import('../features/ucl-performance/pages/UclVsDomesticPage').then((m) => ({
    default: m.UclVsDomesticPage,
  })),
);
const SuperSubsPage = lazy(() =>
  import('../features/super-subs/pages/SuperSubsPage').then((m) => ({ default: m.SuperSubsPage })),
);
const PlayersPage = lazy(() =>
  import('../features/players/pages/PlayersPage').then((m) => ({ default: m.PlayersPage })),
);
const PlayerDetailPage = lazy(() =>
  import('../features/players/pages/PlayerDetailPage').then((m) => ({
    default: m.PlayerDetailPage,
  })),
);
const TransfersPage = lazy(() =>
  import('../features/transfers/pages/TransfersPage').then((m) => ({ default: m.TransfersPage })),
);
const SystemPage = lazy(() =>
  import('../features/system/pages/SystemPage').then((m) => ({ default: m.SystemPage })),
);

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
      <ScrollToTop />
      <TopProgressBar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<LegalPage mode="privacy" />} />
          <Route path="/terms" element={<LegalPage mode="terms" />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />

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
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SystemPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
