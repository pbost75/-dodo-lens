'use client';

import { AnalyticsProvider } from '@/services/analytics';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider>
      {children}
    </AnalyticsProvider>
  );
}