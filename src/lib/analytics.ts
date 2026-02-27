import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export type AnalyticsEventType =
  | 'pageview'
  | 'click'
  | 'payment_attempt'
  | 'payment_success'
  | 'payment_fail';

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  page: string;
  label?: string;
  sessionId: string;
  timestamp: string;
  userAgent?: string;
  referer?: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsFile {
  events: AnalyticsEvent[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ANALYTICS_PATH = path.join(DATA_DIR, 'analytics.json');
const SESSION_COOKIE_NAME = 'mys_session';

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ANALYTICS_PATH)) {
    const initial: AnalyticsFile = { events: [] };
    fs.writeFileSync(ANALYTICS_PATH, JSON.stringify(initial, null, 2), 'utf8');
  }
}

export async function appendEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
  ensureDataFile();
  const fileRaw = await fs.promises.readFile(ANALYTICS_PATH, 'utf8');
  let data: AnalyticsFile;
  try {
    data = JSON.parse(fileRaw) as AnalyticsFile;
  } catch {
    data = { events: [] };
  }

  const fullEvent: AnalyticsEvent = {
    ...event,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  data.events.push(fullEvent);

  await fs.promises.writeFile(ANALYTICS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export async function loadAnalytics(): Promise<AnalyticsFile> {
  ensureDataFile();
  const fileRaw = await fs.promises.readFile(ANALYTICS_PATH, 'utf8');
  try {
    return JSON.parse(fileRaw) as AnalyticsFile;
  } catch {
    return { events: [] };
  }
}

export function getOrCreateSessionId(
  req: NextApiRequest,
  res: NextApiResponse
): string {
  const existing = req.cookies?.[SESSION_COOKIE_NAME];
  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  const cookie = [
    `${SESSION_COOKIE_NAME}=${sessionId}`,
    'Path=/',
    'Max-Age=31536000',
    'HttpOnly',
    'SameSite=Lax',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');

  res.setHeader('Set-Cookie', cookie);
  return sessionId;
}

export async function getAnalyticsSummary() {
  const { events } = await loadAnalytics();

  const sessionsMap = new Map<string, AnalyticsEvent[]>();
  for (const ev of events) {
    if (!sessionsMap.has(ev.sessionId)) {
      sessionsMap.set(ev.sessionId, []);
    }
    sessionsMap.get(ev.sessionId)!.push(ev);
  }

  const totalSessions = sessionsMap.size;
  const pageViews = events.filter((e) => e.type === 'pageview');
  const clicks = events.filter((e) => e.type === 'click');
  const paymentAttempts = events.filter((e) => e.type === 'payment_attempt');
  const paymentSuccess = events.filter((e) => e.type === 'payment_success');

  const pageViewsByPath: Record<string, number> = {};
  for (const pv of pageViews) {
    pageViewsByPath[pv.page] = (pageViewsByPath[pv.page] || 0) + 1;
  }

  const clicksByLabel: Record<string, number> = {};
  for (const ev of clicks) {
    const key = ev.label || '(без мітки)';
    clicksByLabel[key] = (clicksByLabel[key] || 0) + 1;
  }

  const exitsByPath: Record<string, number> = {};
  for (const [, sessionEvents] of sessionsMap) {
    const sorted = [...sessionEvents].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp)
    );
    const lastPageview = [...sorted].reverse().find((e) => e.type === 'pageview');
    if (lastPageview) {
      exitsByPath[lastPageview.page] =
        (exitsByPath[lastPageview.page] || 0) + 1;
    }
  }

  let quizSessions = 0;
  let quizPlanReadySessions = 0;
  let quizPaymentClickSessions = 0;
  let quizPaymentSuccessSessions = 0;

  for (const [, sessionEvents] of sessionsMap) {
    const pages = new Set(
      sessionEvents.filter((e) => e.type === 'pageview').map((e) => e.page)
    );
    const hasQuiz = [...pages].some((p) => p.startsWith('/quiz'));
    const hasPlanReady = pages.has('/quiz/plan-ready');
    // Натискання на оплату: або реальна спроба платежу, або клік по кнопці оплати
    const hasAttempt =
      sessionEvents.some((e) => e.type === 'payment_attempt') ||
      sessionEvents.some(
        (e) => e.type === 'click' && e.label === 'plan-ready:pay-click'
      );
    const hasSuccess = sessionEvents.some((e) => e.type === 'payment_success');

    if (hasQuiz) quizSessions += 1;
    if (hasPlanReady) quizPlanReadySessions += 1;
    if (hasAttempt) quizPaymentClickSessions += 1;
    if (hasSuccess) quizPaymentSuccessSessions += 1;
  }

  return {
    totals: {
      events: events.length,
      sessions: totalSessions,
      pageViews: pageViews.length,
      clicks: clicks.length,
      paymentAttempts: paymentAttempts.length,
      paymentSuccess: paymentSuccess.length,
      paymentConversionRate:
        paymentAttempts.length > 0
          ? paymentSuccess.length / paymentAttempts.length
          : 0,
    },
    pages: pageViewsByPath,
    exits: exitsByPath,
    clicks: clicksByLabel,
    funnelQuiz: {
      sessionsWithAnyQuizPage: quizSessions,
      sessionsReachedPlanReady: quizPlanReadySessions,
      sessionsWithPaymentAttempt: quizPaymentClickSessions,
      sessionsWithPaymentSuccess: quizPaymentSuccessSessions,
      rates: {
        quizToPlanReady:
          quizSessions > 0 ? quizPlanReadySessions / quizSessions : 0,
        planReadyToAttempt:
          quizPlanReadySessions > 0
            ? quizPaymentClickSessions / quizPlanReadySessions
            : 0,
        attemptToSuccess:
          quizPaymentClickSessions > 0
            ? quizPaymentSuccessSessions / quizPaymentClickSessions
            : 0,
      },
    },
  };
}

