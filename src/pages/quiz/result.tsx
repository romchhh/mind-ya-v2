import React, { useState, useEffect } from 'react';
import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Header from '@/components/Header/Header';
import QuizFooter from '@/components/QuizFooter/QuizFooter';
import styles from './result.module.css';

const USER_AGE_KEY = 'mind_ya_user_age';

const Result: NextPage = () => {
  const router = useRouter();
  const [userAge, setUserAge] = useState<string>('');

  useEffect(() => {
    // Прокручуємо сторінку вгору при завантаженні
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Встановлюємо світлу тему для хедера
    document.documentElement.style.setProperty('--theme-header-bg', '#fff');
    document.documentElement.style.setProperty('--logo-color', 'var(--color-primary)');
    document.body.style.backgroundColor = '#fff';
    document.body.className = '';

    // Завантажуємо дані з sessionStorage
    if (typeof window !== 'undefined') {
      // Отримуємо вік
      const age = sessionStorage.getItem(USER_AGE_KEY) || '';
      setUserAge(age);

    }

    return () => {
      document.body.className = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.setProperty('--logo-color', '');
      document.documentElement.style.setProperty('--theme-header-bg', '');
    };
  }, []);

  return (
    <>
      <Head>
        <title>Твій результат - Mind Я</title>
      </Head>
      <Header />
      <main className={styles.resultPage}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            📋 Твій результат готовий
          </h1>

          <div className={styles.stressLevel}>
            <span className={styles.stressLevelLabel}>🔴 Рівень стресу:</span>
            <span className={styles.stressLevelValue}>ВИСОКИЙ</span>
          </div>

          <p className={styles.description}>
          Твоя нервова система працює в режимі виживання.<br /> Це не слабкість. Це не характер. Це виснаження, яке накопичувалось місяцями.
          </p>

          <div className={styles.insightsSection}>
            <h2 className={styles.insightsTitle}>На основі твоїх відповідей:</h2>
            <div className={styles.insightsList}>
              <p className={styles.insightItem}>
              😔 Стрес забирає твої сили щодня — і ти це відчуваєш фізично
              </p>
              <p className={styles.insightItem}>
              😔 Те, що ти пробувала раніше, не прибирає причину — тому не працює
              </p>
              <p className={styles.insightItem}>
              😔 Твоя нервова система потребує не відпочинку, а перезавантаження
              </p>
            </div>
          </div>

          <div className={styles.warningSection}>
            <h2 className={styles.warningTitle}>⚠️ Що буде, якщо залишити як є?</h2>
            <div className={styles.warningContent}>
              <p className={styles.warningText}>Через тиждень — ті ж безсонні ночі</p>
              <p className={styles.warningText}>Через місяць — ще більше зривів і провини</p>
              <p className={styles.warningText}>Через пів року — виснаження стане «нормою»</p>
              <p className={styles.warningText}><strong>І найгірше — ти звикнеш. І перестанеш шукати вихід.</strong></p>
              <p className={styles.warningConclusion}>Але ти зараз тут. І це вже перший крок.</p>
            </div>
          </div>

          <div className={styles.goodNewsSection}>
            <div className={styles.goodNewsBadge}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <span>ХОРОША НОВИНА</span>
            </div>

            <p className={styles.goodNewsText}>
            Це можна змінити. І швидше, ніж ти думаєш.
            </p>
            <p className={styles.goodNewsText}>
            Ми створили для тебе персональний старт: <br />3 дні аудіопрактик, після яких ти <strong>ВІДЧУЄШ</strong> різницю в тілі.
            </p>
            <p className={styles.goodNewsText}>
            Не «повіриш». Не «сподіватимешся».<br />Саме відчуєш — у тілі, у диханні, у тому, як засинаєш.
            </p>
            <p className={styles.goodNewsText}>
            Це працює, тому що стрес живе не в голові — а в тілі. <br />І саме через тіло ми його прибираємо.
            </p>
          </div>

          <div className={styles.statsSection}>
            <p className={styles.statsText}>
              78% жінок твого віку ({userAge}) відчули полегшення вже на 2-й день
            </p>
            <p className={styles.statsSource}>
              За даними опитування 1,200+ користувачок Mind Я
            </p>
            <div className={styles.chartContainer}>
              <Image
                src="/chart1.jpg"
                alt="Statistics chart"
                width={800}
                height={400}
                className={styles.chart}
                unoptimized
              />
            </div>
            <div className={styles.feedback}>
              «На 3-й день вперше за місяці заснула до 12. Думала, так не буває.» — Юлія, 26, Київ
            </div>
            <button 
              className={styles.understandButton}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                router.push('/quiz/stories');
              }}
            >
              <span>Подивитись мій план</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </main>
      <QuizFooter />
    </>
  );
};

export default Result;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/quiz/plan-ready',
      permanent: false,
    },
  };
};

