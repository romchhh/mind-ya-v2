import type { NextApiRequest, NextApiResponse } from 'next';
import { getPaymentFormData, type WayForPayProduct } from '@/lib/wayforpay';
import { PRODUCT_NAME_SHORT } from '@/data/productDescription';
import { appendEvent, getOrCreateSessionId } from '@/lib/analytics';

type ResponseData = {
  success: boolean;
  url?: string;
  formData?: Record<string, string | string[]>;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // ДОДАЙТЕ ЦЕ ДЛЯ ДІАГНОСТИКИ
    console.log('=== Create Payment Debug ===');
    console.log('MERCHANT_LOGIN:', process.env.MERCHANT_LOGIN);
    console.log('MERCHANT_SECRET_KEY exists:', !!process.env.MERCHANT_SECRET_KEY);
    console.log('MERCHANT_SECRET_KEY length:', process.env.MERCHANT_SECRET_KEY?.length || 0);
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
    console.log('Request price:', req.body?.price);
    console.log('===========================');
    const price = typeof req.body?.price === 'number' ? req.body.price : 149;
    const product: WayForPayProduct = {
      name: PRODUCT_NAME_SHORT,
      price,
      count: 1,
    };
    const { url, formData } = getPaymentFormData([product]);
    // ДОДАЙТЕ ЦЕ ТАКОЖ
    console.log('Generated payment data:', {
        merchantAccount: formData.merchantAccount,
        merchantDomainName: formData.merchantDomainName,
        merchantSignature: formData.merchantSignature?.substring(0, 20) + '...',
        amount: formData.amount,
        orderReference: formData.orderReference,
      });

    try {
      const sessionId = getOrCreateSessionId(req, res);
      await appendEvent({
        type: 'payment_attempt',
        page: '/quiz/plan-ready',
        label: 'wayforpay',
        sessionId,
        userAgent: req.headers['user-agent'] || '',
        referer:
          (req.headers.referer as string | undefined) ||
          (req.headers.referrer as string | undefined) ||
          '',
        metadata: {
          amount: price,
          orderReference: formData.orderReference,
        },
      });
    } catch (logError) {
      console.error('Analytics payment_attempt log error:', logError);
    }
  

    const normalizedFormData: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(formData)) {
      if (Array.isArray(value)) {
        normalizedFormData[key] = value.map(String);
      } else {
        normalizedFormData[key] = String(value);
      }
    }

    return res.status(200).json({
      success: true,
      url,
      formData: normalizedFormData,
    });
  } catch (error) {
    console.error('WayForPay create-payment error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create payment',
    });
  }
}

