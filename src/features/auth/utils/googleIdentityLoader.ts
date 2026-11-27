interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
  }) => void;
  prompt: (momentListener?: (notification: { isNotDisplayed: () => boolean }) => void) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const GIS_LOAD_TIMEOUT_MS = 10_000;

export function loadGoogleIdentityScript(): Promise<GoogleAccountsId> {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google.accounts.id);
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    let timeoutId: number | undefined;
    const finishResolve = (api: GoogleAccountsId) => {
      if (settled) return;
      settled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      resolve(api);
    };
    const finishReject = (err: Error, scriptEl?: HTMLScriptElement) => {
      if (settled) return;
      settled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (scriptEl) {
        scriptEl.dataset.gisState = 'error';
        scriptEl.remove();
      }
      reject(err);
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_URL}"]`);
    if (existing?.dataset.gisState === 'error') {
      existing.remove();
    } else if (existing) {
      if (existing.dataset.gisState === 'loaded') {
        if (window.google?.accounts?.id) {
          resolve(window.google.accounts.id);
        } else {
          reject(new Error('Google Identity Services unavailable'));
        }
        return;
      }

      timeoutId = window.setTimeout(
        () => finishReject(new Error('Google Identity Services timed out'), existing),
        GIS_LOAD_TIMEOUT_MS,
      );
      existing.addEventListener(
        'load',
        () => {
          existing.dataset.gisState = 'loaded';
          if (window.google?.accounts?.id) {
            finishResolve(window.google.accounts.id);
          } else {
            finishReject(new Error('Google Identity Services unavailable'), existing);
          }
        },
        { once: true },
      );
      existing.addEventListener(
        'error',
        () => finishReject(new Error('Google script failed'), existing),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.dataset.gisState = 'loading';

    timeoutId = window.setTimeout(
      () => finishReject(new Error('Google Identity Services timed out'), script),
      GIS_LOAD_TIMEOUT_MS,
    );

    script.onload = () => {
      script.dataset.gisState = 'loaded';
      if (window.google?.accounts?.id) {
        finishResolve(window.google.accounts.id);
      } else {
        finishReject(new Error('Google Identity Services unavailable'), script);
      }
    };
    script.onerror = () =>
      finishReject(new Error('Failed to load Google Identity Services'), script);
    document.head.appendChild(script);
  });
}
