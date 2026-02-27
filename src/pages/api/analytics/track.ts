import type { NextApiRequest, NextApiResponse } from 'next';
import { appendEvent, getOrCreateSessionId, type AnalyticsEventType } from '@/lib/analytics';

type TrackResponse = { success: true } | { success: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrackResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const sessionId = getOrCreateSessionId(req, res);

    const { type, page, label, metadata } = req.body || {};

    if (!type || !page) {
      return res
        .status(400)
        .json({ success: false, error: 'Missing type or page' });
    }

    const allowedTypes: AnalyticsEventType[] = [
      'pageview',
      'click',
      'payment_attempt',
      'payment_success',
      'payment_fail',
    ];

    if (!allowedTypes.includes(type)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid event type' });
    }

    await appendEvent({
      type,
      page,
      label,
      metadata,
      sessionId,
      userAgent: req.headers['user-agent'] || '',
      referer:
        (req.headers.referer as string | undefined) ||
        (req.headers.referrer as string | undefined) ||
        '',
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Failed to track event' });
  }
}

