import React, { useEffect, useState } from 'react';
import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Header from '@/components/Header/Header';
import QuizFooter from '@/components/QuizFooter/QuizFooter';
import styles from './stories.module.css';

const Stories: NextPage = () => {
  const router = useRouter();
  const [visibleStories, setVisibleStories] = useState(3);

  useEffect(() => {
    // Прокручуємо сторінку вгору при завантаженні
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Встановлюємо світлу тему для хедера
    document.documentElement.style.setProperty('--theme-header-bg', '#fff');
    document.documentElement.style.setProperty('--logo-color', 'var(--color-primary)');
    document.body.style.backgroundColor = '#fff';
    document.body.className = '';

    return () => {
      document.body.className = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.setProperty('--logo-color', '');
      document.documentElement.style.setProperty('--theme-header-bg', '');
    };
  }, []);

  const handleTryClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.push('/quiz/plan-ready');
  };

  const handleShowMore = () => {
    setVisibleStories(5);
  };

  const allStories = [
    <div key="1" className={styles.storyCard}>
      <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
      <p className={styles.storyAuthor}>Олена, 33, Львів</p>
      <p className={styles.storyText}>
      Двоє дітей, чоловік на фронті. Я трималась як могла, але ввечері зривалась на дітей через будь-яку дрібницю. А потім лежала і плакала від сорому. Щовечора одне й те саме. <br /><br />Побачила рекламу, пройшла тест. Думала — ну 149 грн, що я втрачу? Гірше вже не буде. <br /><br />На 2-й день зробила вечірню практику перед тим, як забирати дітей з садочка. Вперше за місяці не підвищила голос увесь вечір. <br /><br />На 3-й день донька сказала: «Мамо, ти стала добріша». <br /><br />Це було найкраще, що я чула за рік.
      </p>
    </div>,
    <div key="2" className={styles.storyCard}>
      <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
      <p className={styles.storyAuthor}>Юлія, 26, Київ</p>
      <p className={styles.storyText}>
      Засинала о 3 ночі. Голова не вимикалась — прокручувала робочі задачі, розмови, всілякі «а що якщо». Вранці як зомбі. Кава вже не допомагала.<br /><br />Подруга скинула посилання на тест. Я пройшла його в метро, просто від нічого робити. Чесно — не вірила.<br /><br />На 3-й день вперше заснула до 12. Просто лягла — і відключилась. Без прокручування. Без телефону.<br /><br />Зараз роблю практику перед сном — як зуби почистити.
      </p>
    </div>,
    <div key="3" className={styles.storyCard}>
      <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
      <p className={styles.storyAuthor}>Марина, 29, Дніпро</p>
      <p className={styles.storyText}>
      Від кожної сирени серце вискакувало. Руки тряслись. Не могла дихати. Колеги на роботі вже помічали, але я робила вигляд, що все ок. <br /><br />Знайшла Mind Я випадково — в інстаграмі. Пройшла тест за 5 хвилин, оплатила не думаючи. <br /><br />Вже на 2-й день зрозуміла фішку. Коли відчуваю, що починає накривати — 60 секунд, і відпускає. Працює навіть на роботі у туалеті. <br /><br />Ніхто не знає. А мені і не треба пояснювати.

      </p>
    </div>,
    <div key="4" className={styles.storyCard}>
      <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
      <p className={styles.storyAuthor}>Ірина, 41, Одеса</p>
      <p className={styles.storyText}>
      Снодійні, мелатонін, вино перед сном. Пробувала медитації — не можу зосередитись. Психолога — дорого і не завжди є час. Нічого не давало нормального сну. <br /><br />Пройшла тест із думкою «ну подивлюсь, що запропонують». 149 грн — менше, ніж пачка мелатоніну. Вирішила спробувати. <br /><br /> На 3-й день вперше прокинулась і зрозуміла — я виспалась. Не пам'ятала, коли таке було востаннє. <br /><br />Тут інакше. Через тіло, не через голову. Шкода, що не знайшла раніше.
      </p>
    </div>,
    <div key="5" className={styles.storyCard}>
      <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
      <p className={styles.storyAuthor}>Наталя, 47, Харків</p>
      <p className={styles.storyText}>
      Живу в напрузі з 2022. Не пам'ятаю, коли востаннє була спокійна. Думала — це тепер назавжди. Треба просто терпіти і жити далі. <br /><br />Донька показала тест в телефоні. Пройшла — більше для неї, ніж для себе. Не чекала нічого. <br /><br />На 2-й день вперше за довгий час відчула — тіло може бути не напруженим. Виявляється, я просто забула, як це — коли плечі не біля вух. <br /><br />Раніше навіть не знала, що так можна.
      </p>
    </div>
  ];

  return (
    <>
      <Head>
        <title>Історії - Mind Я</title>
      </Head>
      <Header />
      <main className={styles.storiesPage}>
        <div className={styles.container}>
          <h1 className={styles.title}>
          Вони починали точно так, як ти зараз
          </h1>

          <div className={styles.storiesList}>
            {allStories.slice(0, visibleStories)}
          </div>

          {visibleStories < allStories.length && (
            <button className={styles.showMoreButton} onClick={handleShowMore}>
              Побачити більше
            </button>
          )}

          <div className={styles.statImageContainer}>
            <Image
              src="/stat1.jpg"
              alt="Statistics"
              width={800}
              height={400}
              className={styles.statImage}
              unoptimized
            />
          </div>

          <button className={styles.tryButton} onClick={handleTryClick}>
            <span>Хочу спробувати</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </main>
      <QuizFooter />
    </>
  );
};

export default Stories;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/quiz/plan-ready',
      permanent: false,
    },
  };
};

