import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useLang } from '../lib/lang.jsx';

const FIELDS = [
  { key: 'shopName', label: 'setShopName', hint: 'setShopNameHint' },
  { key: 'currency', label: 'setCurrency', hint: 'setCurrencyHint' },
  { key: 'cardNumber', label: 'setCardNumber', hint: 'setCardNumberHint' },
  { key: 'cardHolder', label: 'setCardHolder', hint: 'setCardHolderHint' },
  { key: 'deliveryFee', label: 'setDeliveryFee', type: 'number' },
  { key: 'freeDeliveryFrom', label: 'setFreeFrom', type: 'number' },
  { key: 'contactPhone', label: 'setPhone', hint: 'setPhoneHint' },
  { key: 'contactAddress', label: 'setAddress', hint: 'setAddressHint' },
];

export default function Settings() {
  const { t } = useLang();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const [pw, setPw] = useState({ current: '', next: '', repeat: '' });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    api
      .settings()
      .then((r) => setForm(r.settings))
      .catch((e) => setError(e.message));
  }, []);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.saveSettings(form);
      flash(t('setSaved'));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwError('');

    if (pw.next.length < 8) return setPwError(t('setPwTooShort'));
    if (pw.next !== pw.repeat) return setPwError(t('setPwMismatch'));

    setPwBusy(true);
    try {
      await api.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', repeat: '' });
      flash(t('setPwChanged'));
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwBusy(false);
    }
  }

  if (error && !form) return <div className="alert error">{error}</div>;
  if (!form) return <div className="spinner" />;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('setTitle')}</h1>
          <p>{t('setSub')}</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <form className="panel" onSubmit={save} style={{ marginBottom: 22 }}>
        <div className="panel-head">{t('setShopBlock')}</div>
        <div className="modal-body">
          <div className="form-grid">
            {FIELDS.map((f) => (
              <div className="form-row" key={f.key}>
                <label>
                  {t(f.label)} {f.hint && <span className="hint">— {t(f.hint)}</span>}
                </label>
                <input
                  type={f.type || 'text'}
                  value={form[f.key] ?? ''}
                  onChange={set(f.key)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" disabled={saving}>
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </form>

      <form className="panel" onSubmit={savePassword}>
        <div className="panel-head">{t('setPwBlock')}</div>
        <div className="modal-body">
          {pwError && <div className="alert error">{pwError}</div>}
          <div className="form-grid">
            <div className="form-row full">
              <label>{t('setPwCurrent')}</label>
              <input
                type="password"
                value={pw.current}
                onChange={(e) => setPw({ ...pw, current: e.target.value })}
                autoComplete="current-password"
              />
            </div>
            <div className="form-row">
              <label>
                {t('setPwNew')} <span className="hint">{t('setPwNewHint')}</span>
              </label>
              <input
                type="password"
                value={pw.next}
                onChange={(e) => setPw({ ...pw, next: e.target.value })}
                autoComplete="new-password"
              />
            </div>
            <div className="form-row">
              <label>{t('setPwRepeat')}</label>
              <input
                type="password"
                value={pw.repeat}
                onChange={(e) => setPw({ ...pw, repeat: e.target.value })}
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" disabled={pwBusy || !pw.current || !pw.next}>
            {pwBusy ? t('setPwChanging') : t('setPwChange')}
          </button>
        </div>
      </form>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
