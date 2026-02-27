export type ClientAnalyticsEventType =
  | 'pageview'
  | 'click'
  | 'payment_attempt'
  | 'payment_success'
  | 'payment_fail';

interface TrackPayload {
  type: ClientAnalyticsEventType;
  page?: string;
  label?: string;
  metadata?: Record<string, any>;
}

export function trackEvent(payload: TrackPayload) {
  if (typeof window === 'undefined') return;

  const page =
    payload.page ||
    `${window.location.pathname}${window.location.search || ''}`;

  const body = JSON.stringify({
    type: payload.type,
    page,
    label: payload.label,
    metadata: payload.metadata,
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
    } else {
      void fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      });
    }
  } catch (e) {
    console.error('trackEvent error', e);
  }
}

