import { readAuthAccessToken } from '@/lib/authSession';
import type { AnalyticsIngestEvent, AnalyticsTrackPayload } from '@/lib/analytics/types';

const FLUSH_INTERVAL_MS = 5000;
const MAX_QUEUE = 100;

let queue: AnalyticsIngestEvent[] = [];
let sessionId = loadOrCreateSessionId();
let flushTimer: ReturnType<typeof setInterval> | null = null;

function loadOrCreateSessionId(): string {
  const key = 'bh_analytics_session';
  const existing = sessionStorage.getItem(key);
  if (existing) {
    return existing;
  }
  const created = crypto.randomUUID();
  sessionStorage.setItem(key, created);
  return created;
}

function actorContext(): Pick<AnalyticsIngestEvent, 'actorType' | 'actorId' | 'sessionId'> {
  const token = readAuthAccessToken();
  if (token) {
    return { actorType: 'user', actorId: null, sessionId: null };
  }
  return { actorType: 'guest', actorId: null, sessionId };
}

function buildEvent(eventType: string, payload: AnalyticsTrackPayload): AnalyticsIngestEvent {
  return {
    eventId: crypto.randomUUID(),
    eventType,
    occurredAt: new Date().toISOString(),
    source: 'storefront',
    schemaVersion: 'v1',
    correlationId: null,
    ...actorContext(),
    payload,
  };
}

async function flushQueue(): Promise<void> {
  if (queue.length === 0) {
    return;
  }
  const batch = queue.splice(0, queue.length);
  try {
    const res = await fetch('/api/v1/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      credentials: 'include',
    });
    if (!res.ok) {
      queue.unshift(...batch);
    }
  } catch {
    queue.unshift(...batch);
    if (queue.length > MAX_QUEUE) {
      queue = queue.slice(-MAX_QUEUE);
    }
  }
}

function ensureFlushTimer(): void {
  if (flushTimer != null) {
    return;
  }
  flushTimer = setInterval(() => {
    void flushQueue();
  }, FLUSH_INTERVAL_MS);
}

export function track(eventType: string, payload: AnalyticsTrackPayload): void {
  queue.push(buildEvent(eventType, payload));
  ensureFlushTimer();
  if (queue.length >= 10) {
    void flushQueue();
  }
}

export function trackPageView(path: string): void {
  track('page_view', { path });
}

export function trackProductView(productSlug: string): void {
  track('product_view', { productSlug });
}

export function trackAddToCartClick(variantId: number, productSlug?: string): void {
  track('add_to_cart_click', productSlug ? { variantId, productSlug } : { variantId });
}

export function trackCheckoutOpen(cartId?: number): void {
  track('checkout_open', cartId != null ? { cartId } : {});
}
