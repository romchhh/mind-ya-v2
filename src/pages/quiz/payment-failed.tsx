import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '@/components/Header/Header';
import QuizFooter from '@/components/QuizFooter/QuizFooter';
import styles from '../payment-result.module.css';

const QuizPaymentFailed: NextPage = () => {
  const handleBackToPlan = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/quiz/plan-ready';
    }
  };

  return (
    <>
      <Head>
        <title>Оплата не пройшла - Mind Я</title>
      </Head>
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
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
        </main>
        <QuizFooter />
      </div>
    </>
  );
};

export default QuizPaymentFailed;

