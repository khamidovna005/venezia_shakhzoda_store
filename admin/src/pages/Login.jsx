import { useState } from 'react';
import api, { setToken } from '../lib/api.js';
import { useLang } from '../lib/lang.jsx';
import { LANGS } from '../lib/i18n.js';

export default function Login({ onSuccess }) {
  const { t, lang, setLang } = useLang();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login(login.trim(), password);
      setToken(res.token);
      onSuccess({ shopName: res.shopName, currency: res.currency });
    } catch (err) {
      setError(err.message);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="lang-switch login-lang">
          {LANGS.map((l) => (
            <button
              key={l.key}
              type="button"
              className={`lang-btn ${lang === l.key ? 'active' : ''}`}
              onClick={() => setLang(l.key)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <h1>{t('loginTitle')}</h1>
        <p>{t('loginSub')}</p>

        {error && <div className="alert error">{error}</div>}

        <div className="form-row" style={{ marginBottom: 14 }}>
          <label htmlFor="login">{t('loginField')}</label>
          <input
            id="login"
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            autoFocus
          />
        </div>

        <div className="form-row">
          <label htmlFor="password">{t('passwordField')}</label>
          <div className="password-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="eye"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <button className="btn" style={{ width: '100%', marginTop: 20 }} disabled={loading}>
          {loading ? t('loginChecking') : t('loginBtn')}
        </button>

        <p style={{ marginTop: 18, marginBottom: 0, fontSize: 12.5 }}>{t('loginHint')}</p>
      </form>
    </div>
  );
}
