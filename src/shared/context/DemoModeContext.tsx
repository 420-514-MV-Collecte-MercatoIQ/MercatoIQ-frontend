import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { safeStorageGet, safeStorageSet } from '../utils/storage';

const DEMO_MODE_STORAGE_KEY = 'mercatoiq_demo_mode';

interface DemoModeContextValue {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  toggleDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

export function isDemoModeActive(): boolean {
  return safeStorageGet(DEMO_MODE_STORAGE_KEY) === 'true';
}

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => isDemoModeActive());

  useEffect(() => {
    safeStorageSet(DEMO_MODE_STORAGE_KEY, String(isDemoMode));
  }, [isDemoMode]);

  const enableDemoMode = useCallback(() => setIsDemoMode(true), []);
  const disableDemoMode = useCallback(() => setIsDemoMode(false), []);
  const toggleDemoMode = useCallback(() => setIsDemoMode((prev) => !prev), []);

  return (
    <DemoModeContext.Provider
      value={{ isDemoMode, enableDemoMode, disableDemoMode, toggleDemoMode }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode(): DemoModeContextValue {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error('useDemoMode must be used within DemoModeProvider');
  return ctx;
}
