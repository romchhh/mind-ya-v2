import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Header from '@/components/Header/Header';
import QuizFooter from '@/components/QuizFooter/QuizFooter';
import styles from './plan-ready.module.css';
import { trackEvent } from '@/lib/analyticsClient';

const PlanReady: NextPage = () => {
  const router = useRouter();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isHeaderTimerExpired] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [price, setPrice] = useState(189);

  // Відстеження скролу для приховування header
  useEffect(() => {
    const handleScroll = () => {
      const pricingSection = document.getElementById('pricing-section');
      if (pricingSection) {
        const rect = pricingSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        const isPricingSectionVisible = 
          rect.top >= 0 && 
          rect.top < windowHeight && 
          rect.bottom > 0;
        
        // Хедер зникає ТІЛЬКИ коли pricingSection видимий у viewport
        // На всіх інших блоках хедер видимий
        setIsHeaderVisible(!isPricingSectionVisible);
      } else {
        // Якщо секція не знайдена (ще не зарендерена), хедер видимий
        setIsHeaderVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Викликаємо одразу для початкового стану
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Прокручуємо сторінку вгору при завантаженні
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Перевірка статусу оплати в sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Перевірка чи користувач повернувся з оплати без оплати
      // Перевіряємо при завантаженні сторінки та при зміні query параметрів
      const paymentAttempted = sessionStorage.getItem('paymentAttempted');
      const transactionStatus = router.query.transactionStatus as string | undefined;
      
      if (paymentAttempted === 'true') {
        // Якщо є успішний статус - очищаємо маркер
        if (transactionStatus === 'approved' || transactionStatus === 'inprocessing') {
          sessionStorage.removeItem('paymentAttempted');
        } else if (!transactionStatus || transactionStatus === 'declined' || transactionStatus === 'refunded') {
          // Якщо оплата не пройшла або користувач просто повернувся - перенаправляємо на exit-intent
          sessionStorage.removeItem('paymentAttempted');
          // Невелика затримка щоб уникнути зациклення
          setTimeout(() => {
            router.push('/quiz/exit-intent');
          }, 100);
        }
      }
    }
  }, [router.query, router]);

  // Аналітика: окремий pageview для блоку оплати
  useEffect(() => {
    trackEvent({
      type: 'pageview',
      page: '/quiz/plan-ready#pricing-section',
      label: 'plan-ready:pricing-section',
    });
  }, []);

  const handleGetPlan = () => {
    trackEvent({ type: 'click', label: 'plan-ready:get-plan' });
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      const headerHeight = 80; // Приблизна висота sticky header
      const elementPosition = pricingSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  const handlePurchase = async () => {
    trackEvent({ type: 'click', label: 'plan-ready:pay-click' });
    try {
      // Відстежуємо перехід на оплату
      sessionStorage.setItem('paymentAttempted', 'true');
      
      const res = await fetch('/api/wayforpay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      });
      const data = await res.json();
      if (!data.success || !data.url || !data.formData) {
        throw new Error(data.error || 'Помилка створення платежу');
      }
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.url;
      form.style.display = 'none';
      for (const [key, value] of Object.entries(data.formData)) {
        const values = Array.isArray(value) ? value : [value];
        const fieldName = Array.isArray(value) ? `${key}[]` : key;
        for (const v of values) {
          const input = document.createElement('input');
          input.name = fieldName;
          input.value = String(v);
          input.type = 'hidden';
          form.appendChild(input);
        }
      }
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error('Payment error:', err);
      sessionStorage.removeItem('paymentAttempted');
      alert('Не вдалося перейти до оплати. Спробуйте пізніше.');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Head>
        <title>Ваш персональний план готовий! - Mind Я</title>
      </Head>
      
      
     


      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.resultSection}>
            <h1 className={styles.title}>
              <span className={styles.titleIcon} aria-hidden="true">✅</span>
              <span>Твій результат готовий</span>
            </h1>

            <div className={styles.stressLevelRow}>
              <span className={styles.stressLevelIcon} aria-hidden="true" />
              <span className={styles.stressLevelLabel}>Рівень стресу:</span>
            </div>

            <p className={styles.resultIntro}>
              Твоя нервова система працює в режимі виживання. Це не слабкість. Це не характер. Це виснаження, яке накопичувалось місяцями.
            </p>

            <div className={styles.resultBlock}>
              <h2 className={styles.resultSubtitle}>На основі твоїх відповідей:</h2>
              <ul className={styles.resultList}>
                <li className={styles.resultItem}>
                  <span className={styles.resultIcon} aria-hidden="true">
                    <svg
                      className={styles.resultIconSvg}
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="10" cy="10" r="9" stroke="#b91c1c" strokeWidth="1.5" />
                      <path
                        d="M7 8.5C7.3 8 7.95 7.5 9 7.5"
                        stroke="#b91c1c"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M11 7.5C12.05 7.5 12.7 8 13 8.5"
                        stroke="#b91c1c"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7 13C7.6 12.2 8.7 11.7 10 11.7C11.3 11.7 12.4 12.2 13 13"
                        stroke="#b91c1c"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span>Стрес забирає твої сили щодня — і ти це відчуваєш фізично</span>
                </li>
                <li className={styles.resultItem}>
                  <span className={styles.resultIcon} aria-hidden="true">
                    <svg
                      className={styles.resultIconSvg}
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="10" cy="10" r="9" stroke="#b91c1c" strokeWidth="1.5" />
                      <path
                        d="M7 8.5C7.3 8 7.95 7.5 9 7.5"
                        stroke="#b91c1c"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M11 7.5C12.05 7.5 12.7 8 13 8.5"
                        stroke="#b91c1c"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7 13C7.6 12.2 8.7 11.7 10 11.7C11.3 11.7 12.4 12.2 13 13"
                        stroke="#b91c1c"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span>Те, що ти пробувала раніше, не прибирає причину — тому не працює</span>
                </li>
                <li className={styles.resultItem}>
                  <span className={styles.resultIcon} aria-hidden="true">
                    <svg
                      className={styles.resultIconSvg}
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="10" cy="10" r="9" stroke="#b91c1c" strokeWidth="1.5" />
                      <path
                        d="M7 8.5C7.3 8 7.95 7.5 9 7.5"
                        stroke="#b91c1c"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M11 7.5C12.05 7.5 12.7 8 13 8.5"
                        stroke="#b91c1c"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7 13C7.6 12.2 8.7 11.7 10 11.7C11.3 11.7 12.4 12.2 13 13"
                        stroke="#b91c1c"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span>Твоя нервова система потребує не відпочинку, а перезавантаження</span>
                </li>
              </ul>
            </div>

            <div className={styles.warningSectionTop}>
              <h2 className={styles.resultSubtitle}>⚠️ Що буде, якщо залишити як є?</h2>
              <p>Через тиждень — ті ж безсонні ночі</p>
              <p>Через місяць — ще більше зривів і провини</p>
              <p>Через пів року — виснаження стане «нормою»</p>
              <p className={styles.warningStrong}>І найгірше — ти звикнеш. І перестанеш шукати вихід.</p>
              <p>Але ти зараз тут. І це вже перший крок.</p>
            </div>

            <div className={styles.goodNewsBlock}>
              <div className={styles.goodNewsBadge}>ХОРОША НОВИНА</div>
              <p>Це можна змінити. І швидше, ніж ти думаєш.</p>
              <p>
                Ми створили для тебе персональний старт: <br />3 дні аудіопрактик, після яких ти <strong>ВІДЧУЄШ</strong> різницю в тілі.
              </p>
              <p>Не «повіриш». Не «сподіватимешся».<br />Саме відчуєш — у тілі, у диханні, у тому, як засинаєш.</p>
              <p>Це працює, тому що стрес живе не в голові — а в тілі. І саме через тіло ми його прибираємо.</p>
            </div>

            <p className={styles.resultFootnote}>
              78% жінок твого віку (26–35) відчули полегшення вже на 2-й день.
            </p>

            <div className={styles.pricingSectionWrapper}>
              <div id="pricing-section" className={styles.pricingSection}>
                <div className={styles.discountBanner}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.bannerClockIcon}
                  >
                    <path
                      d="M5 12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12Z"
                      stroke="white"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M12 8V12L14.5 13"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className={styles.bannerDiscountText}>
                    Сьогодні −50%
                  </span>
                </div>

                <div className={styles.priceContainer}>
                  <div className={styles.priceOldContainer}>
                    <span className={styles.priceOld}>378 грн</span>
                    <span className={styles.priceOldLabel}>звичайна ціна</span>
                  </div>
                  <div className={styles.priceNewContainer}>
                    <span className={styles.priceNew}>{price} грн</span>
                    <span className={styles.priceNewLabel}>сьогодні −50% на старт</span>
                  </div>
                </div>

                <ul className={styles.benefitsList}>
                  <li className={styles.benefitItem}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none" className={styles.checkmark}>
                      <path fillRule="evenodd" clipRule="evenodd" d="M11.2032 1.69499C10.8137 1.31 10.1869 1.31 9.79736 1.69499L8.4388 3.03765C8.25306 3.22121 8.00289 3.32483 7.74176 3.32637L5.83171 3.33762C5.28403 3.34084 4.84084 3.78403 4.83762 4.33171L4.82637 6.24176C4.82483 6.50289 4.72121 6.75306 4.53765 6.9388L3.19499 8.29736C2.81 8.68691 2.81 9.31367 3.19499 9.70322L4.53765 11.0618C4.72121 11.2475 4.82483 11.4977 4.82637 11.7588L4.83762 13.6689C4.84084 14.2165 5.28403 14.6597 5.83171 14.663L7.74176 14.6742C8.00289 14.6757 8.25306 14.7794 8.4388 14.9629L9.79736 16.3056C10.1869 16.6906 10.8137 16.6906 11.2032 16.3056L12.5618 14.9629C12.7475 14.7794 12.9977 14.6757 13.2588 14.6742L15.1689 14.663C15.7165 14.6597 16.1597 14.2165 16.163 13.6689L16.1742 11.7588C16.1757 11.4977 16.2794 11.2475 16.4629 11.0618L17.8056 9.70322C18.1906 9.31367 18.1906 8.68691 17.8056 8.29736L16.4629 6.9388C16.2794 6.75306 16.1757 6.50289 16.1742 6.24176L16.163 4.33171C16.1597 3.78403 15.7165 3.34084 15.1689 3.33762L13.2588 3.32637C12.9977 3.32483 12.7475 3.22121 12.5618 3.03765L11.2032 1.69499ZM12.7661 6.56124C12.8682 6.5927 12.9162 6.63187 13.1682 6.88906C13.344 7.06843 13.472 7.21888 13.5 7.27887C13.5622 7.41222 13.563 7.60475 13.5019 7.73519C13.4687 7.806 12.9665 8.3408 11.7054 9.64839C10.0041 11.4124 9.95171 11.4643 9.83799 11.4986C9.69212 11.5426 9.65753 11.5426 9.512 11.4983C9.40026 11.4643 9.35561 11.4219 8.5167 10.5536C7.90623 9.92177 7.62452 9.61485 7.59294 9.54717C7.53998 9.43368 7.5321 9.26158 7.57386 9.13029C7.60824 9.02219 8.11864 8.47149 8.25351 8.39697C8.37662 8.32897 8.58588 8.33114 8.71657 8.40175C8.77474 8.43319 8.98812 8.63377 9.25016 8.90337L9.68684 9.3526L11.0055 7.9861C11.7308 7.23451 12.3484 6.60672 12.378 6.591C12.5075 6.52229 12.6134 6.51417 12.7661 6.56124Z" fill="#10b981"></path>
                    </svg>
                    <span>3 структуровані дні стабілізації</span>
                  </li>
                  <li className={styles.benefitItem}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none" className={styles.checkmark}>
                      <path fillRule="evenodd" clipRule="evenodd" d="M11.2032 1.69499C10.8137 1.31 10.1869 1.31 9.79736 1.69499L8.4388 3.03765C8.25306 3.22121 8.00289 3.32483 7.74176 3.32637L5.83171 3.33762C5.28403 3.34084 4.84084 3.78403 4.83762 4.33171L4.82637 6.24176C4.82483 6.50289 4.72121 6.75306 4.53765 6.9388L3.19499 8.29736C2.81 8.68691 2.81 9.31367 3.19499 9.70322L4.53765 11.0618C4.72121 11.2475 4.82483 11.4977 4.82637 11.7588L4.83762 13.6689C4.84084 14.2165 5.28403 14.6597 5.83171 14.663L7.74176 14.6742C8.00289 14.6757 8.25306 14.7794 8.4388 14.9629L9.79736 16.3056C10.1869 16.6906 10.8137 16.6906 11.2032 16.3056L12.5618 14.9629C12.7475 14.7794 12.9977 14.6757 13.2588 14.6742L15.1689 14.663C15.7165 14.6597 16.1597 14.2165 16.163 13.6689L16.1742 11.7588C16.1757 11.4977 16.2794 11.2475 16.4629 11.0618L17.8056 9.70322C18.1906 9.31367 18.1906 8.68691 17.8056 8.29736L16.4629 6.9388C16.2794 6.75306 16.1757 6.50289 16.1742 6.24176L16.163 4.33171C16.1597 3.78403 15.7165 3.34084 15.1689 3.33762L13.2588 3.32637C12.9977 3.32483 12.7475 3.22121 12.5618 3.03765L11.2032 1.69499ZM12.7661 6.56124C12.8682 6.5927 12.9162 6.63187 13.1682 6.88906C13.344 7.06843 13.472 7.21888 13.5 7.27887C13.5622 7.41222 13.563 7.60475 13.5019 7.73519C13.4687 7.806 12.9665 8.3408 11.7054 9.64839C10.0041 11.4124 9.95171 11.4643 9.83799 11.4986C9.69212 11.5426 9.65753 11.5426 9.512 11.4983C9.40026 11.4643 9.35561 11.4219 8.5167 10.5536C7.90623 9.92177 7.62452 9.61485 7.59294 9.54717C7.53998 9.43368 7.5321 9.26158 7.57386 9.13029C7.60824 9.02219 8.11864 8.47149 8.25351 8.39697C8.37662 8.32897 8.58588 8.33114 8.71657 8.40175C8.77474 8.43319 8.98812 8.63377 9.25016 8.90337L9.68684 9.3526L11.0055 7.9861C11.7308 7.23451 12.3484 6.60672 12.378 6.591C12.5075 6.52229 12.6134 6.51417 12.7661 6.56124Z" fill="#10b981"></path>
                    </svg>
                    <span>Вечірні аудіо 7–10 хв + техніка «60 секунд» на випадок, коли накриває</span>
                  </li>
                  <li className={styles.benefitItem}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none" className={styles.checkmark}>
                      <path fillRule="evenodd" clipRule="evenodd" d="M11.2032 1.69499C10.8137 1.31 10.1869 1.31 9.79736 1.69499L8.4388 3.03765C8.25306 3.22121 8.00289 3.32483 7.74176 3.32637L5.83171 3.33762C5.28403 3.34084 4.84084 3.78403 4.83762 4.33171L4.82637 6.24176C4.82483 6.50289 4.72121 6.75306 4.53765 6.9388L3.19499 8.29736C2.81 8.68691 2.81 9.31367 3.19499 9.70322L4.53765 11.0618C4.72121 11.2475 4.82483 11.4977 4.82637 11.7588L4.83762 13.6689C4.84084 14.2165 5.28403 14.6597 5.83171 14.663L7.74176 14.6742C8.00289 14.6757 8.25306 14.7794 8.4388 14.9629L9.79736 16.3056C10.1869 16.6906 10.8137 16.6906 11.2032 16.3056L12.5618 14.9629C12.7475 14.7794 12.9977 14.6757 13.2588 14.6742L15.1689 14.663C15.7165 14.6597 16.1597 14.2165 16.163 13.6689L16.1742 11.7588C16.1757 11.4977 16.2794 11.2475 16.4629 11.0618L17.8056 9.70322C18.1906 9.31367 18.1906 8.68691 17.8056 8.29736L16.4629 6.9388C16.2794 6.75306 16.1757 6.50289 16.1742 6.24176L16.163 4.33171C16.1597 3.78403 15.7165 3.34084 15.1689 3.33762L13.2588 3.32637C12.9977 3.32483 12.7475 3.22121 12.5618 3.03765L11.2032 1.69499ZM12.7661 6.56124C12.8682 6.5927 12.9162 6.63187 13.1682 6.88906C13.344 7.06843 13.472 7.21888 13.5 7.27887C13.5622 7.41222 13.563 7.60475 13.5019 7.73519C13.4687 7.806 12.9665 8.3408 11.7054 9.64839C10.0041 11.4124 9.95171 11.4643 9.83799 11.4986C9.69212 11.5426 9.65753 11.5426 9.512 11.4983C9.40026 11.4643 9.35561 11.4219 8.5167 10.5536C7.90623 9.92177 7.62452 9.61485 7.59294 9.54717C7.53998 9.43368 7.5321 9.26158 7.57386 9.13029C7.60824 9.02219 8.11864 8.47149 8.25351 8.39697C8.37662 8.32897 8.58588 8.33114 8.71657 8.40175C8.77474 8.43319 8.98812 8.63377 9.25016 8.90337L9.68684 9.3526L11.0055 7.9861C11.7308 7.23451 12.3484 6.60672 12.378 6.591C12.5075 6.52229 12.6134 6.51417 12.7661 6.56124Z" fill="#10b981"></path>
                    </svg>
                    <span>Telegram-супровід щодня, щоб ти не злилась після старту</span>
                  </li>
                  <li className={styles.benefitItem}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none" className={styles.checkmark}>
                      <path fillRule="evenodd" clipRule="evenodd" d="M11.2032 1.69499C10.8137 1.31 10.1869 1.31 9.79736 1.69499L8.4388 3.03765C8.25306 3.22121 8.00289 3.32483 7.74176 3.32637L5.83171 3.33762C5.28403 3.34084 4.84084 3.78403 4.83762 4.33171L4.82637 6.24176C4.82483 6.50289 4.72121 6.75306 4.53765 6.9388L3.19499 8.29736C2.81 8.68691 2.81 9.31367 3.19499 9.70322L4.53765 11.0618C4.72121 11.2475 4.82483 11.4977 4.82637 11.7588L4.83762 13.6689C4.84084 14.2165 5.28403 14.6597 5.83171 14.663L7.74176 14.6742C8.00289 14.6757 8.25306 14.7794 8.4388 14.9629L9.79736 16.3056C10.1869 16.6906 10.8137 16.6906 11.2032 16.3056L12.5618 14.9629C12.7475 14.7794 12.9977 14.6757 13.2588 14.6742L15.1689 14.663C15.7165 14.6597 16.1597 14.2165 16.163 13.6689L16.1742 11.7588C16.1757 11.4977 16.2794 11.2475 16.4629 11.0618L17.8056 9.70322C18.1906 9.31367 18.1906 8.68691 17.8056 8.29736L16.4629 6.9388C16.2794 6.75306 16.1757 6.50289 16.1742 6.24176L16.163 4.33171C16.1597 3.78403 15.7165 3.34084 15.1689 3.33762L13.2588 3.32637C12.9977 3.32483 12.7475 3.22121 12.5618 3.03765L11.2032 1.69499ZM12.7661 6.56124C12.8682 6.5927 12.9162 6.63187 13.1682 6.88906C13.344 7.06843 13.472 7.21888 13.5 7.27887C13.5622 7.41222 13.563 7.60475 13.5019 7.73519C13.4687 7.806 12.9665 8.3408 11.7054 9.64839C10.0041 11.4124 9.95171 11.4643 9.83799 11.4986C9.69212 11.5426 9.65753 11.5426 9.512 11.4983C9.40026 11.4643 9.35561 11.4219 8.5167 10.5536C7.90623 9.92177 7.62452 9.61485 7.59294 9.54717C7.53998 9.43368 7.5321 9.26158 7.57386 9.13029C7.60824 9.02219 8.11864 8.47149 8.25351 8.39697C8.37662 8.32897 8.58588 8.33114 8.71657 8.40175C8.77474 8.43319 8.98812 8.63377 9.25016 8.90337L9.68684 9.3526L11.0055 7.9861C11.7308 7.23451 12.3484 6.60672 12.378 6.591C12.5075 6.52229 12.6134 6.51417 12.7661 6.56124Z" fill="#10b981"></path>
                    </svg>
                    <span>Працює без світла та інтернету — завантажуєш один раз, користуєшся тоді, коли потрібно</span>
                  </li>
                  <li className={styles.benefitItem}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none" className={styles.checkmark}>
                      <path fillRule="evenodd" clipRule="evenodd" d="M11.2032 1.69499C10.8137 1.31 10.1869 1.31 9.79736 1.69499L8.4388 3.03765C8.25306 3.22121 8.00289 3.32483 7.74176 3.32637L5.83171 3.33762C5.28403 3.34084 4.84084 3.78403 4.83762 4.33171L4.82637 6.24176C4.82483 6.50289 4.72121 6.75306 4.53765 6.9388L3.19499 8.29736C2.81 8.68691 2.81 9.31367 3.19499 9.70322L4.53765 11.0618C4.72121 11.2475 4.82483 11.4977 4.82637 11.7588L4.83762 13.6689C4.84084 14.2165 5.28403 14.6597 5.83171 14.663L7.74176 14.6742C8.00289 14.6757 8.25306 14.7794 8.4388 14.9629L9.79736 16.3056C10.1869 16.6906 10.8137 16.6906 11.2032 16.3056L12.5618 14.9629C12.7475 14.7794 12.9977 14.6757 13.2588 14.6742L15.1689 14.663C15.7165 14.6597 16.1597 14.2165 16.163 13.6689L16.1742 11.7588C16.1757 11.4977 16.2794 11.2475 16.4629 11.0618L17.8056 9.70322C18.1906 9.31367 18.1906 8.68691 17.8056 8.29736L16.4629 6.9388C16.2794 6.75306 16.1757 6.50289 16.1742 6.24176L16.163 4.33171C16.1597 3.78403 15.7165 3.34084 15.1689 3.33762L13.2588 3.32637C12.9977 3.32483 12.7475 3.22121 12.5618 3.03765L11.2032 1.69499ZM12.7661 6.56124C12.8682 6.5927 12.9162 6.63187 13.1682 6.88906C13.344 7.06843 13.472 7.21888 13.5 7.27887C13.5622 7.41222 13.563 7.60475 13.5019 7.73519C13.4687 7.806 12.9665 8.3408 11.7054 9.64839C10.0041 11.4124 9.95171 11.4643 9.83799 11.4986C9.69212 11.5426 9.65753 11.5426 9.512 11.4983C9.40026 11.4643 9.35561 11.4219 8.5167 10.5536C7.90623 9.92177 7.62452 9.61485 7.59294 9.54717C7.53998 9.43368 7.5321 9.26158 7.57386 9.13029C7.60824 9.02219 8.11864 8.47149 8.25351 8.39697C8.37662 8.32897 8.58588 8.33114 8.71657 8.40175C8.77474 8.43319 8.98812 8.63377 9.25016 8.90337L9.68684 9.3526L11.0055 7.9861C11.7308 7.23451 12.3484 6.60672 12.378 6.591C12.5075 6.52229 12.6134 6.51417 12.7661 6.56124Z" fill="#10b981"></path>
                    </svg>
                    <span>100% гарантія повернення — без ризику для тебе</span>
                  </li>
                </ul>

                <p className={styles.benefitsNote}>Почати стабілізацію сьогодні — 189 грн.</p>

                <p className={styles.paymentNoteTop}>Доступ до Telegram-бота відкриється автоматично після оплати.</p>

                <button className={styles.ctaButton} onClick={handlePurchase}>
                  {`Почати за ${price} грн`}
                </button>
                <p className={styles.paymentMethods}>
                  Безпечна оплата через WayForPay: Visa · Mastercard · Apple Pay · Google Pay · Privat24 · monobank
                </p>
                <p className={styles.paymentNote}>
                  WayForPay — сертифікований український платіжний сервіс. Дані картки захищені та не зберігаються на серверах Mind Я.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.graphSection}>
            <h2 className={styles.graphTitle}>Як змінюється стан протягом 3 днів</h2>
            <div className={styles.graphImageContainer}>
              <Image
                src="/chart1.jpg"
                alt="Графік змін стану: День 1 — Зараз, День 2 — Перші зміни, День 3 — Відчутна різниця, далі — ще краще"
                width={800}
                height={400}
                className={styles.graphImage}
                unoptimized
              />
            </div>
            <ul className={styles.graphLegend}>
              <li><strong>День 1 — «Зараз»</strong>: високий рівень напруги, важко заснути, тіло постійно напружене.</li>
              <li><strong>День 2 — «Перші зміни»</strong>: легше заснути, трохи більше ресурсу вдень, менше різких зривів.</li>
              <li><strong>День 3 — «Відчутна різниця»</strong>: сон глибший, тіло відпускає, з’являється відчуття контролю.</li>
              <li className={styles.graphDashed}><strong>Далі — ще краще</strong>: якщо продовжиш практики, ефект накопичується.</li>
            </ul>
          </section>

          <div className={styles.featuresSection}>
            <h2 className={styles.featuresTitle}>Що всередині твого 3-денного плану:</h2>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}>
                <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Вечірні аудіо 7-10 хв → вмикаєш, і тіло поступово відпускає напругу. Без складних медитацій.</span>
              </li>
              <li className={styles.featureItem}>
                <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Техніка “60 секунд” → коли накриває в моменті — швидко повертає контроль. Можна робити навіть на роботі.</span>
              </li>
              <li className={styles.featureItem}>
                <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>“Стоп-тривога” → чіткий алгоритм дій замість паніки. Ти знаєш, що робити, а не губишся.</span>
              </li>
              <li className={styles.featureItem}>
                <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Практика глибокого сну → менше прокручування думок. Засинаєш швидше, прокидаєшся спокійніше.</span>
              </li>
              <li className={styles.featureItem}>
                <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>SOS-протокол → сирена, новини, емоційний зрив — покроково, як стабілізувати себе.</span>
              </li>
              <li className={styles.featureItem}>
                <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Telegram-бот з підтримкою → нагадує, веде по програмі, допомагає не злитись після старту.</span>
              </li>
              <li className={styles.featureItem}>
                <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Доступ назавжди → завантажуєш один раз — користуєшся тоді, коли потрібно.</span>
              </li>
            </ul>
          </div>

          <div className={styles.comparisonSection}>
            <h2 className={styles.comparisonTitle}>Порівняй сама:</h2>
            <div className={styles.comparisonTable}>
              <div className={styles.comparisonRow}>
                <div className={styles.comparisonCell}>
                  <span className={styles.comparisonEmoji}>💊</span>
                  <span className={styles.comparisonText}>Заспокійливі на місяць</span>
                </div>
                <div className={styles.comparisonCell}>
                  <span className={styles.comparisonPrice}>300-500 грн</span>
                </div>
                <div className={styles.comparisonCell}>
                  <span className={styles.comparisonResult}>Сонливість + звикання</span>
                </div>
              </div>
              <div className={styles.comparisonRow}>
                <div className={styles.comparisonCell}>
                  <span className={styles.comparisonEmoji}>🍷</span>
                  <span className={styles.comparisonText}>Вино ввечері</span>
                </div>
                <div className={styles.comparisonCell}>
                  <span className={styles.comparisonPrice}>200-400 грн</span>
                </div>
                <div className={styles.comparisonCell}>
                  <span className={styles.comparisonResult}>Тимчасово, потім гірше</span>
                </div>
              </div>
              <div className={styles.comparisonRow}>
                <div className={styles.comparisonCell}>
                  <span className={styles.comparisonEmoji}>📱</span>
                  <span className={styles.comparisonText}>Медитації з Youtube</span>
                </div>
                <div className={styles.comparisonCell}>
                  <span className={styles.comparisonPrice}>0 грн</span>
                </div>
                <div className={styles.comparisonCell}>
                  <span className={styles.comparisonResult}>Не можеш зосередитись — кидаєш</span>
                </div>
              </div>
              <div className={styles.comparisonRow}>
                <div className={styles.comparisonCell}>
                  <span className={styles.comparisonEmoji}>🧠</span>
                  <span className={styles.comparisonText}>Психолог</span>
                </div>
                <div className={styles.comparisonCell}>
                  <span className={styles.comparisonPrice}>1200-2500 грн</span>
                </div>
                <div className={styles.comparisonCell}>
                  <span className={styles.comparisonResult}>Ефективно, але дорого і довго</span>
                </div>
              </div>
            </div>
            <div className={styles.comparisonHighlightBox}>
              <div className={styles.comparisonHighlightTitle}>Mind Я — 3 дні</div>
              <div className={styles.comparisonHighlightPrice}>{price} грн (одноразово)</div>
              <div className={styles.comparisonHighlightText}>Спокій з 1-го дня. Назавжди твоє.</div>
            </div>
          </div>

          <div className={styles.howItWorksSection}>
            <h2 className={styles.howItWorksTitle}>Як це працює?</h2>
            <p className={styles.howItWorksText}>
              Прості техніки по 10 хвилин, які працюють на рівні тіла. Вони знижують кортизол фізично.
            </p>
            <p className={styles.howItWorksText}>
              Програму розробили практикуючі психологи з досвідом роботи з тривожністю та ПТСР.
            </p>
            <p className={styles.howItWorksText}>
              Всі техніки базуються на доказовій психології: дихальні практики, м'язова релаксація, нейро-регуляція.
            </p>
          </div>

          <div className={styles.testimonialsSection}>
            <h2 className={styles.testimonialsTitle}> Що кажуть після перших 3 днів:</h2>

            <div className={styles.testimonialsList}>
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialHeader}>
                  <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
                  <span className={styles.testimonialAuthor}>Аня, 24, Вінниця</span>
                </div>
                <p className={styles.testimonialText}>
                  Заснула до 12 — вперше за 4 місяці. Без снодійного, без вина. Просто лягла і — все.
                </p>
              </div>

              <div className={styles.testimonialCard}>
                <div className={styles.testimonialHeader}>
                  <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
                  <span className={styles.testimonialAuthor}>Катерина, 35, Запоріжжя</span>
                </div>
                <p className={styles.testimonialText}>
                  Вечір без крику на дітей. Це було так незвично, що чоловік спитав — ти в порядку?
                </p>
              </div>

              <div className={styles.testimonialCard}>
                <div className={styles.testimonialHeader}>
                  <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
                  <span className={styles.testimonialAuthor}>Даша, 27, Київ</span>
                </div>
                <p className={styles.testimonialText}>
                  Почала накривати паніка в метро. Зробила техніку 60 секунд — відпустило. Раніше тряслась по 20 хвилин.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.ctaSection}>
            <p className={styles.ctaText}>
              Вони всі починали з одного кроку
            </p>
            <p className={styles.ctaDetails}>
              3 дні. 10 хвилин на день. {price} грн
            </p>
            <button className={styles.ctaSectionButton} onClick={handlePurchase}>
              <span>Отримати свій план</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          <div className={styles.faqSection}>
            <h2 className={styles.faqTitle}>Часті питання:</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
                >
                  <span className={styles.faqQuestionText}>
                    <span className={styles.faqEmoji}>❓</span>
                    Це медитація?
                  </span>
                  <span className={styles.faqIcon}>
                    {openFaqIndex === 0 ? '−' : '+'}
                  </span>
                </button>
                {openFaqIndex === 0 && (
                  <div className={styles.faqAnswer}>
                    Ні. Це аудіо-техніки, які працюють через тіло — дихання, м'язова релаксація, нейро-регуляція. Не потрібно «очищати розум» або сидіти в тиші. Просто вмикаєш і слухаєш.
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
                >
                  <span className={styles.faqQuestionText}>
                    <span className={styles.faqEmoji}>❓</span>
                    А якщо в мене немає 10 хвилин?
                  </span>
                  <span className={styles.faqIcon}>
                    {openFaqIndex === 1 ? '−' : '+'}
                  </span>
                </button>
                {openFaqIndex === 1 && (
                  <div className={styles.faqAnswer}>
                    Техніка «60 секунд» працює буквально за хвилину. А вечірнє аудіо — 10 хв перед сном. Це менше, ніж скролити стрічку перед сном.
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
                >
                  <span className={styles.faqQuestionText}>
                    <span className={styles.faqEmoji}>❓</span>
                    Що буде після оплати?
                  </span>
                  <span className={styles.faqIcon}>
                    {openFaqIndex === 2 ? '−' : '+'}
                  </span>
                </button>
                {openFaqIndex === 2 && (
                  <div className={styles.faqAnswer}>
                    Ти одразу отримаєш посилання на Telegram-бот. Натискаєш /start — і починаєш першу практику протягом 5 хвилин.
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaqIndex(openFaqIndex === 3 ? null : 3)}
                >
                  <span className={styles.faqQuestionText}>
                    <span className={styles.faqEmoji}>❓</span>
                    Це працює при тривозі від війни?
                  </span>
                  <span className={styles.faqIcon}>
                    {openFaqIndex === 3 ? '−' : '+'}
                  </span>
                </button>
                {openFaqIndex === 3 && (
                  <div className={styles.faqAnswer}>
                    Так. Техніки розроблені з урахуванням ПТСР-симптомів. SOS-протокол — спеціально для сирен, новин і блекаутів.
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaqIndex(openFaqIndex === 4 ? null : 4)}
                >
                  <span className={styles.faqQuestionText}>
                    <span className={styles.faqEmoji}>❓</span>
                    Потрібен інтернет?
                  </span>
                  <span className={styles.faqIcon}>
                    {openFaqIndex === 4 ? '−' : '+'}
                  </span>
                </button>
                {openFaqIndex === 4 && (
                  <div className={styles.faqAnswer}>
                    Тільки щоб завантажити практики. Далі працює без світла і зв'язку — файли залишаються в телефоні.
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaqIndex(openFaqIndex === 5 ? null : 5)}
                >
                  <span className={styles.faqQuestionText}>
                    <span className={styles.faqEmoji}>❓</span>
                    Як відбувається оплата?
                  </span>
                  <span className={styles.faqIcon}>
                    {openFaqIndex === 5 ? '−' : '+'}
                  </span>
                </button>
                {openFaqIndex === 5 && (
                  <div className={styles.faqAnswer}>
                    Оплата через WayForPay — сертифікований український сервіс. Приймаємо Visa, Mastercard, Apple Pay, Google Pay, Privat24, monobank.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.ctaSection}>
            <p className={styles.ctaText}>
            Все ще думаєш?
            </p>
            <p className={styles.ctaDetails}>
            <strong>78% жінок</strong> відчули різницю вже на <strong>3-й день</strong>
            </p>
            <p className={styles.ctaDetails}>Тобі не потрібно вірити. <br />Тобі потрібно просто спробувати.</p>
            <button className={styles.ctaSectionButton} onClick={handlePurchase}>
              <span>Спробувати за {price} грн</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          <div className={styles.guaranteeSection}>
            <div className={styles.guaranteeContent}>
              <div className={styles.guaranteeTextContainer}>
                <h3 className={styles.guaranteeTitle}>100% гарантія повернення грошей</h3>
                <p className={styles.guaranteeText}>
                  ✅ Не відчуєш різниці за 2 дні — повернемо всі {price} грн. Без питань. Просто напиши на mindya.ua@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className={styles.fixedPayBar}>
        <div className={styles.fixedPayContent}>
          <div className={styles.fixedPayText}>
            <span className={styles.fixedPayIcon} aria-hidden="true">🔥</span>
            <span className={styles.fixedPayLabel}>
              Знижка 50% завершується сьогодні. Ціна зараз — {price} грн.
            </span>
          </div>

          <button
            className={styles.getMyPlanButton}
            onClick={handlePurchase}
          >
            Отримати план
          </button>
        </div>
      </div>

      <QuizFooter />
    </div>
  );
};

export default PlanReady;

