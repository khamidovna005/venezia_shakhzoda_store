import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const FIELDS = [
  { key: 'shopName', label: "Do'kon nomi", hint: 'Botdagi salomlashish xabarida chiqadi' },
  { key: 'currency', label: 'Valyuta', hint: "masalan: so'm" },
  { key: 'cardNumber', label: 'Karta raqami', hint: "O'tkazma shu kartaga qilinadi" },
  { key: 'cardHolder', label: 'Karta egasi', hint: 'Kartadagi ism-familiya' },
  { key: 'deliveryFee', label: 'Yetkazib berish narxi', type: 'number' },
  { key: 'freeDeliveryFrom', label: 'Shu summadan bepul', type: 'number' },
  { key: 'contactPhone', label: 'Aloqa telefoni', hint: "Mijozlar ko'radi" },
  { key: 'contactAddress', label: 'Manzil', hint: "Do'kon manzili" },
];

const PAY_FIELDS = [
  { key: 'paymeMerchantId', label: 'Payme merchant ID', hint: 'Payme kabinetidan olinadi' },
  { key: 'clickServiceId', label: 'Click service ID', hint: 'Click kabinetidan olinadi' },
  { key: 'clickMerchantId', label: 'Click merchant ID', hint: 'Click kabinetidan olinadi' },
];

export default function Settings() {
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
      flash('✅ Sozlamalar saqlandi');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwError('');

    if (pw.next.length < 8) return setPwError("Yangi parol kamida 8 ta belgi bo'lsin");
    if (pw.next !== pw.repeat) return setPwError('Yangi parollar bir xil emas');

    setPwBusy(true);
    try {
      await api.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', repeat: '' });
      flash('✅ Parol o‘zgartirildi');
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
          <h1>Sozlamalar</h1>
          <p>Do‘kon ma’lumotlari va kirish paroli</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <form className="panel" onSubmit={save} style={{ marginBottom: 22 }}>
        <div className="panel-head">🏪 Do‘kon ma’lumotlari</div>
        <div className="modal-body">
          <div className="form-grid">
            {FIELDS.map((f) => (
              <div className="form-row" key={f.key}>
                <label>
                  {f.label} {f.hint && <span className="hint">— {f.hint}</span>}
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
        <div className="panel-head" style={{ borderTop: '1px solid var(--line)' }}>
          💳 Payme va Click
        </div>
        <div className="modal-body">
          <div className="alert info" style={{ marginBottom: 14 }}>
            Rekvizitlarni kiritsangiz, mijoz savatchada Payme yoki Click’ni tanlab
            to‘lov sahifasiga o‘tadi. <b>To‘lov o‘tgani avtomatik tekshirilmaydi</b> —
            pulni Payme/Click ilovangizda ko‘rib, buyurtmani “To‘landi” deb belgilaysiz.
          </div>
          <div className="form-grid">
            {PAY_FIELDS.map((f) => (
              <div className="form-row" key={f.key}>
                <label>
                  {f.label} <span className="hint">— {f.hint}</span>
                </label>
                <input type="text" value={form[f.key] ?? ''} onChange={set(f.key)} />
              </div>
            ))}
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn" disabled={saving}>
            {saving ? 'Saqlanmoqda…' : 'Saqlash'}
          </button>
        </div>
      </form>

      <form className="panel" onSubmit={savePassword}>
        <div className="panel-head">🔐 Kirish paroli</div>
        <div className="modal-body">
          {pwError && <div className="alert error">{pwError}</div>}
          <div className="form-grid">
            <div className="form-row full">
              <label>Joriy parol</label>
              <input
                type="password"
                value={pw.current}
                onChange={(e) => setPw({ ...pw, current: e.target.value })}
                autoComplete="current-password"
              />
            </div>
            <div className="form-row">
              <label>
                Yangi parol <span className="hint">— kamida 8 ta belgi</span>
              </label>
              <input
                type="password"
                value={pw.next}
                onChange={(e) => setPw({ ...pw, next: e.target.value })}
                autoComplete="new-password"
              />
            </div>
            <div className="form-row">
              <label>Yangi parolni takrorlang</label>
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
            {pwBusy ? 'O‘zgartirilmoqda…' : 'Parolni o‘zgartirish'}
          </button>
        </div>
      </form>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
