import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '@/components/Header/Header';
import QuizFooter from '@/components/QuizFooter/QuizFooter';
import styles from '../payment-result.module.css';

const BOT_URL = 'https://t.me/mindyaaa_bot?start=ZGw6MzE0Njgz';

const QuizPaymentSuccess: NextPage = () => {
  const handleGoToBot = () => {
    if (typeof window !== 'undefined') {
      window.location.href = BOT_URL;
    }
  };

  return (
    <>
      <Head>
        <title>Оплата пройшла успішно - Mind Я</title>
      </Head>
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
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
            <button className={styles.buttonPrimary} onClick={handleGoToBot}>
              Перейти до Telegram-бота
            </button>
          </div>
        </main>
        <QuizFooter />
      </div>
    </>
  );
};

export default QuizPaymentSuccess;

