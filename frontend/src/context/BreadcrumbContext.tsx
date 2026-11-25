import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { createContext } from 'react';

export interface BreadcrumbContextType {
  getLabel: (path: string) => string | undefined;
  setLabel: (path: string, label: string) => void;
  clearLabel: (path: string) => void;
}

export const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);

export function normalizeBreadcrumbPath(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [labels, setLabels] = useState<Record<string, string>>({});

  const setLabel = useCallback((path: string, label: string) => {
    const normalized = normalizeBreadcrumbPath(path);
    setLabels((prev) => (prev[normalized] === label ? prev : { ...prev, [normalized]: label }));
  }, []);

  const clearLabel = useCallback((path: string) => {
    const normalized = normalizeBreadcrumbPath(path);
    setLabels((prev) => {
      if (!(normalized in prev)) return prev;
      const next = { ...prev };
      delete next[normalized];
      return next;
    });
  }, []);

  const getLabel = useCallback(
    (path: string) => labels[normalizeBreadcrumbPath(path)],
    [labels],
  );

  const value = useMemo(
    () => ({ getLabel, setLabel, clearLabel }),
    [getLabel, setLabel, clearLabel],
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}
