import { Link, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../../../shared/types/common.types';
import { PageLoader } from '../../../shared/components/ui/Loaders';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isAuthLoading, user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (isAuthLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card padding="lg" className="max-w-md w-full text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[var(--accent-negative-soft)] text-[var(--accent-negative)] flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('guards.forbiddenTitle')}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('guards.forbiddenDescription', { role: allowedRoles.join(', ') })}
            </p>
          </div>
          <div className="pt-2">
            <Link to="/dashboard">
              <Button>{t('notFound.backHome')}</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    const state = location.state as { from?: { pathname?: string } } | null;
    const redirectTo = state?.from?.pathname || '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
