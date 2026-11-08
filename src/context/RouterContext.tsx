import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type NavTab = 'overview' | 'onboarding' | 'tenants' | 'demos' | 'reconciliation' | 'pricing';

export type RoutePath =
  | '/dashboard'
  | '/tenants'
  | '/onboarding'
  | '/reconciliation'
  | '/pricing'
  | '/demo-requests'
  | '/login';

export const VALID_ROUTES: RoutePath[] = [
  '/dashboard',
  '/tenants',
  '/onboarding',
  '/reconciliation',
  '/pricing',
  '/demo-requests',
  '/login',
];

export const isKnownRoute = (path: string): boolean => {
  const clean = path.toLowerCase().replace(/\/$/, '') || '/';
  if (clean === '/') return true;
  return VALID_ROUTES.includes(clean as RoutePath);
};

interface RouterContextType {
  currentPath: string;
  currentTab: NavTab;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  setTab: (tab: NavTab) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const pathToTab = (path: string): NavTab => {
  const clean = path.toLowerCase().replace(/\/$/, '') || '/';
  if (clean.includes('tenants')) return 'tenants';
  if (clean.includes('demo')) return 'demos';
  if (clean.includes('onboarding') || clean.includes('approvals')) return 'onboarding';
  if (clean.includes('reconciliation') || clean.includes('payments')) return 'reconciliation';
  if (clean.includes('pricing')) return 'pricing';
  return 'overview';
};

export const tabToPath = (tab: NavTab): RoutePath => {
  switch (tab) {
    case 'tenants':
      return '/tenants';
    case 'onboarding':
      return '/onboarding';
    case 'reconciliation':
      return '/reconciliation';
    case 'pricing':
      return '/pricing';
    case 'demos':
      return '/demo-requests';
    case 'overview':
    default:
      return '/dashboard';
  }
};

const getInitialPath = (): string => {
  if (typeof window === 'undefined') return '/dashboard';
  const pathname = window.location.pathname;
  if (!pathname || pathname === '/') return '/dashboard';
  return pathname;
};

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  // Derive currentTab from path
  const currentTab = pathToTab(currentPath);

  // Sync state on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/dashboard';
      setCurrentPath(path === '/' ? '/dashboard' : path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Programmatic navigate
  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    const targetPath = path === '/' ? '/dashboard' : path;
    if (options?.replace) {
      window.history.replaceState({}, '', targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
    }
    setCurrentPath(targetPath);
  }, []);

  // Set tab and sync URL
  const setTab = useCallback((tab: NavTab) => {
    const path = tabToPath(tab);
    navigate(path);
  }, [navigate]);

  return (
    <RouterContext.Provider value={{ currentPath, currentTab, navigate, setTab }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  replace?: boolean;
}

export const Link: React.FC<LinkProps> = ({ to, replace, onClick, children, ...rest }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      e.preventDefault();
      navigate(to, { replace });
    }
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};
