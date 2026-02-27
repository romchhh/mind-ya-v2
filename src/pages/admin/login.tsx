import { FormEvent, useState } from 'react';
import Head from 'next/head';
import styles from './login.module.css';
import { useRouter } from 'next/router';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Помилка входу');
        setLoading(false);
        return;
      }
      router.push('/admin');
    } catch (err) {
      console.error(err);
      setError('Не вдалося виконати запит. Спробуй ще раз.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>Admin Login - Mind Я</title>
      </Head>
      <div className={styles.card}>
        <h1 className={styles.title}>Адмін-панель</h1>
        <p className={styles.subtitle}>Увійди за логіном і паролем</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Логін
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className={styles.label}>
            Пароль
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Вхід…' : 'Увійти'}
          </button>
        </form>
        <p className={styles.hint}>
          Логін та пароль задаються в `.env` змінних `ADMIN_USER` та `ADMIN_PASS`.
        </p>
      </div>
    </div>
  );
}

