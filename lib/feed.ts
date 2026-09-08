import { useCallback, useEffect, useState } from 'react';

import { AVIA_DISPLAY, fetchLiveFlights, LiveFlight } from '@/lib/aviation';
import { generateSimulatedFlights } from '@/lib/simulator';

export const FEED_INTERVAL_MS = 60000;

const SIMULATED = AVIA_DISPLAY === 'SIMULATED FEED';

export type FeedState = {
  flights: LiveFlight[];
  loading: boolean;
  error: string | null;
  updatedAt: number | null;
  latencyMs: number | null;
  provider: string;
  simulated: boolean;
};

type Feed = FeedState & { refresh: () => void };

let cache: FeedState = {
  flights: generateSimulatedFlights(),
  loading: true,
  error: null,
  updatedAt: null,
  latencyMs: null,
  provider: AVIA_DISPLAY,
  simulated: SIMULATED,
};

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;
let polling = false;

function emit() {
  listeners.forEach((l) => l());
}

async function poll() {
  if (polling) return;
  polling = true;
  cache = { ...cache, loading: true, error: null };
  emit();
  try {
    const { flights, provider, latencyMs, simulated, error } = await fetchLiveFlights();
    cache = {
      flights,
      provider,
      latencyMs,
      updatedAt: Date.now(),
      loading: false,
      error: error ?? null,
      simulated,
    };
  } catch (e) {
    cache = {
      ...cache,
      loading: false,
      error: e instanceof Error ? e.message : String(e),
    };
  } finally {
    polling = false;
    emit();
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void poll(), FEED_INTERVAL_MS);
  }
}

function ensurePolling() {
  if (polling || timer) return;
  void poll();
}

export function useLiveFlights(): Feed {
  const [, force] = useState(0);

  useEffect(() => {
    const listener = () => force((v) => v + 1);
    listeners.add(listener);
    ensurePolling();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const refresh = useCallback(() => {
    if (timer) clearTimeout(timer);
    timer = null;
    void poll();
  }, []);

  return { ...cache, refresh };
}