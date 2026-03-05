import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/Header/Header';
import QuizFooter from '@/components/QuizFooter/QuizFooter';
import { trackEvent } from '@/lib/analyticsClient';
import styles from './payment-result.module.css';

const BOT_URL = 'https://t.me/mindyaaa_bot?start=ZGw6MzE0Njgz';

const PaymentResult: NextPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failure'>('loading');
  const [orderRef, setOrderRef] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const { transactionStatus, status: qsStatus, orderStatus, orderReference } = router.query;
    const statusStr = String(transactionStatus || qsStatus || orderStatus || '').toLowerCase();

    const urlParams = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
    const urlStatus =
      urlParams?.get('transactionStatus') || urlParams?.get('status') || '';
    const finalStatus = (statusStr || urlStatus || '').toLowerCase();

    const refFromQuery = String(orderReference || urlParams?.get('orderReference') || '');
    if (refFromQuery) {
      setOrderRef(refFromQuery);
    }

    const paymentAttempted =
      typeof window !== 'undefined'
        ? window.sessionStorage.getItem('paymentAttempted')
        : null;

    if (finalStatus === 'approved' || finalStatus === 'inprocessing' || finalStatus === 'ok') {
      setStatus('success');
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('paymentAttempted');
      }
      trackEvent({
        type: 'payment_success',
        page: '/payment-result',
        label: 'wayforpay',
        metadata: { orderReference: refFromQuery || undefined },
      });
    } else {
      setStatus('failure');
      if (paymentAttempted === 'true' && typeof window !== 'undefined') {
        window.sessionStorage.removeItem('paymentAttempted');
      }
      trackEvent({
        type: 'payment_fail',
        page: '/payment-result',
        label: 'wayforpay',
        metadata: {
          orderReference: refFromQuery || undefined,
          rawStatus: finalStatus || null,
        },
      });
    }
  }, [router.isReady, router.query]);

  const handleGoToBot = () => {
    if (typeof window !== 'undefined') {
      window.location.href = BOT_URL;
    }
  };

  const handleBackToPlan = () => {
    router.push('/quiz/plan-ready');
  };

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div className={styles.card}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Обробляємо результат оплати…</p>
        </div>
      );
    }

    if (status === 'success') {
      return (
        <div className={styles.card}>
          <div className={`${styles.iconWrapper} ${styles.iconSuccess}`} aria-hidden="true">
            <svg
              className={styles.iconSvg}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M7.5 12.5L10.5 15.5L16.5 9.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className={styles.title}>Оплата пройшла успішно</h1>
          <p className={styles.text}>
            Дякуємо за довіру до Mind Я. Твій доступ до 3-денного плану вже готовий.
          </p>
          {orderRef && (
            <p className={styles.meta}>
              Номер замовлення:&nbsp;<strong>{orderRef}</strong>
            </p>
          )}
          <button className={styles.buttonPrimary} onClick={handleGoToBot}>
            Перейти до Telegram-бота
          </button>
        </div>
      );
    }

    return (
      <div className={styles.card}>
        <div className={`${styles.iconWrapper} ${styles.iconFail}`} aria-hidden="true">
          <svg
            className={styles.iconSvg}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M9 9L15 15M15 9L9 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className={styles.title}>Оплата не пройшла</h1>
        <p className={styles.text}>
          На жаль, оплату не вдалося завершити. Спробуй ще раз або обери інший спосіб оплати.
        </p>
        <button className={styles.buttonPrimary} onClick={handleBackToPlan}>
          Повернутись до оплати
        </button>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>
          {status === 'success' ? 'Оплата успішна - Mind Я' : 'Результат оплати - Mind Я'}
        </title>
      </Head>
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>{renderContent()}</main>
        <QuizFooter />
      </div>
    </>
  );
};

export default PaymentResult;

