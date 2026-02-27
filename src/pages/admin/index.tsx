import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { getAnalyticsSummary } from '@/lib/analytics';
import styles from './index.module.css';

interface AdminProps {
  summary: Awaited<ReturnType<typeof getAnalyticsSummary>>;
}

export const getServerSideProps: GetServerSideProps<AdminProps> = async (
  context
) => {
  const { req } = context;
  const cookies = req.headers.cookie || '';
  const hasAuth = cookies.split(';').some((c) => c.trim().startsWith('admin_auth=1'));

  if (!hasAuth) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }

  const summary = await getAnalyticsSummary();

  return {
    props: {
      summary,
    },
  };
};

export default function AdminDashboard({ summary }: AdminProps) {
  const { totals, pages, exits, clicks, funnelQuiz } = summary;

  const conversionPercent =
    totals.paymentConversionRate > 0
      ? (totals.paymentConversionRate * 100).toFixed(1)
      : '0.0';

  const funnelCounts = [
    funnelQuiz.sessionsWithAnyQuizPage,
    funnelQuiz.sessionsReachedPlanReady,
    funnelQuiz.sessionsWithPaymentAttempt,
    funnelQuiz.sessionsWithPaymentSuccess,
  ];

  const funnelMax = Math.max(...funnelCounts, 1);

  const planReadyViews = pages['/quiz/plan-ready'] || 0;
  const planReadyExits = exits['/quiz/plan-ready'] || 0;
  const planReadyExitRate =
    planReadyViews > 0
      ? ((planReadyExits / planReadyViews) * 100).toFixed(1)
      : null;

  const quizExitRows = Object.entries(pages)
    .filter(([page]) => page.startsWith('/quiz'))
    .map(([page, views]) => {
      const exitCount = exits[page] || 0;
      const exitRate =
        views > 0 ? Number(((exitCount / views) * 100).toFixed(1)) : 0;
      return { page, views, exitCount, exitRate };
    })
    .sort((a, b) => b.exitCount - a.exitCount);

  const totalQuizExits = quizExitRows.reduce(
    (sum, row) => sum + row.exitCount,
    0
  );

  return (
    <div className={styles.page}>
      <Head>
        <title>Admin Analytics - Mind Я</title>
      </Head>
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Аналітика воронки</h1>
            <p className={styles.subtitle}>
              Живі дані по переходах, кліках та оплатах у воронці тесту.
            </p>
          </div>
        </header>

        <section className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Загальні показники</h2>
            <div className={styles.kpiRow}>
              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Сесій користувачів</div>
                <div className={styles.kpiValue}>{totals.sessions}</div>
              </div>
              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Переглядів сторінок</div>
                <div className={styles.kpiValue}>{totals.pageViews}</div>
              </div>
              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Спроб оплат</div>
                <div className={styles.kpiValue}>{totals.paymentAttempts}</div>
              </div>
              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Успішних оплат</div>
                <div className={styles.kpiValue}>
                  {totals.paymentSuccess}
                  <span className={styles.kpiBadge}>{conversionPercent}%</span>
                </div>
              </div>
              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Виходів на /quiz/plan-ready</div>
                <div className={styles.kpiValue}>
                  {planReadyExits}
                  {planReadyExitRate && (
                    <span className={styles.kpiBadge}>
                      {planReadyExitRate}% від переглядів
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Фунель тесту / плану</h2>
            <div className={styles.funnel}>
              <div className={styles.funnelStep}>
                <div className={styles.funnelLabel}>Будь-яка сторінка /quiz</div>
                <div className={styles.funnelValue}>
                  {funnelQuiz.sessionsWithAnyQuizPage}
                  <span className={styles.funnelPercent}>100%</span>
                </div>
                <div className={styles.funnelBarWrap}>
                  <div
                    className={styles.funnelBar}
                    style={{
                      width: `${Math.round(
                        (funnelQuiz.sessionsWithAnyQuizPage / funnelMax) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className={styles.funnelStep}>
                <div className={styles.funnelLabel}>Дійшли до /quiz/plan-ready</div>
                <div className={styles.funnelValue}>
                  {funnelQuiz.sessionsReachedPlanReady}
                  <span className={styles.funnelPercent}>
                    {(funnelQuiz.rates.quizToPlanReady * 100).toFixed(1)}%
                  </span>
                </div>
                <div className={styles.funnelBarWrap}>
                  <div
                    className={styles.funnelBar}
                    style={{
                      width: `${Math.round(
                        (funnelQuiz.sessionsReachedPlanReady / funnelMax) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className={styles.funnelStep}>
                <div className={styles.funnelLabel}>Натиснули оплату</div>
                <div className={styles.funnelValue}>
                  {funnelQuiz.sessionsWithPaymentAttempt}
                  <span className={styles.funnelPercent}>
                    {(funnelQuiz.rates.planReadyToAttempt * 100).toFixed(1)}%
                  </span>
                </div>
                <div className={styles.funnelBarWrap}>
                  <div
                    className={styles.funnelBar}
                    style={{
                      width: `${Math.round(
                        (funnelQuiz.sessionsWithPaymentAttempt / funnelMax) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className={styles.funnelStep}>
                <div className={styles.funnelLabel}>Оплатили успішно</div>
                <div className={styles.funnelValue}>
                  {funnelQuiz.sessionsWithPaymentSuccess}
                  <span className={styles.funnelPercent}>
                    {(funnelQuiz.rates.attemptToSuccess * 100).toFixed(1)}%
                  </span>
                </div>
                <div className={styles.funnelBarWrap}>
                  <div
                    className={styles.funnelBar}
                    style={{
                      width: `${Math.round(
                        (funnelQuiz.sessionsWithPaymentSuccess / funnelMax) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Перегляди сторінок</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Сторінка</th>
                  <th>Перегляди</th>
                  <th>Виходи</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(pages).map(([page, views]) => (
                  <tr key={page}>
                    <td>{page}</td>
                    <td>{views}</td>
                    <td>{exits[page] || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {quizExitRows.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Де виходять з квізу</h2>
              <p className={styles.cardNote}>
                Усього виходів на квіз‑сторінках: <strong>{totalQuizExits}</strong>
                {quizExitRows[0] && (
                  <>
                    . Найчастіше виходять з: <strong>{quizExitRows[0].page}</strong>
                  </>
                )}
              </p>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Сторінка /quiz</th>
                    <th>Перегляди</th>
                    <th>Виходи</th>
                    <th>Exit rate</th>
                  </tr>
                </thead>
                <tbody>
                  {quizExitRows.map((row) => (
                    <tr key={row.page}>
                      <td>{row.page}</td>
                      <td>{row.views}</td>
                      <td>{row.exitCount}</td>
                      <td>
                        <span className={styles.exitBadge}>
                          {row.exitRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Кліки по ключових елементах</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Мітка кліку</th>
                  <th>Кількість</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(clicks).map(([label, count]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

