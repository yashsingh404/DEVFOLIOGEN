'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/utils/analytics';

interface PortfolioTrackerProps {
  username: string;
  wasCached: boolean;
}

export function PortfolioTracker({ username, wasCached }: PortfolioTrackerProps) {
  useEffect(() => {
    trackEvent('portfolio-viewed', {
      username,
      cached: wasCached,
    });

    if (wasCached === false) {
      trackEvent('portfolio-generated', {
        username,
      });
    }
  }, [username, wasCached]);

  return null;
}

