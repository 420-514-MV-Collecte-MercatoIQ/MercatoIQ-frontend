import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageLoader } from '../../../shared/components/ui/Loaders';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../../../shared/context/ToastContext';
import type { UserRole } from '../../../shared/types/common.types';

export function AuthCallbackPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginFromCallback } = useAuth();
  const { showToast } = useToast();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const oauthError =
      searchParams.get('error_description') ||
      searchParams.get('error') ||
      hashParams.get('error_description') ||
      hashParams.get('error');

    if (oauthError) {
      showToast(oauthError || t('googleAuth.unavailable'), 'error');
      navigate('/login', { replace: true });
      return;
    }

    const token =
      searchParams.get('token') ||
      searchParams.get('access_token') ||
      hashParams.get('token') ||
      hashParams.get('access_token') ||
      '';

    const email = searchParams.get('email') || hashParams.get('email') || undefined;
    const rawRole = searchParams.get('role') || hashParams.get('role');
    const role: UserRole | undefined =
      rawRole === 'admin' || rawRole === 'user' ? rawRole : undefined;
    const name = searchParams.get('name') || hashParams.get('name') || undefined;
    const avatarUrl = searchParams.get('avatarUrl') || hashParams.get('avatarUrl') || undefined;

    const ok = loginFromCallback({ token, email, role, name, avatarUrl });
    if (ok) {
      showToast(t('googleAuth.success'), 'success');
      navigate('/dashboard', { replace: true });
    } else {
      showToast(t('googleAuth.callbackInvalid'), 'error');
      navigate('/login', { replace: true });
    }
  }, [loginFromCallback, navigate, searchParams, showToast, t]);

  return <PageLoader label={t('googleAuth.completingSignIn')} />;
}
