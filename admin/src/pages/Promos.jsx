import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { money, date } from '../lib/format.js';
import { useLang } from '../lib/lang.jsx';

const EMPTY = {
  code: '',
  type: 'PERCENT',
  value: 10,
  minTotal: 0,
  usageLimit: 0,
  expiresAt: '',
  // Yangi kod odatda e'lon qilish uchun yaratiladi, shuning uchun standart
  // holatda belgilangan. Maxfiy kod kerak bo'lsa belgi yechiladi.
  isPublic: true,
};

export default function Promos({ currency, toast }) {
  const { t } = useLang();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.promos();
      setPromos(res.promos);
    } catch (err) {
      toast(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    try {
      await api.createPromo({ ...form, expiresAt: form.expiresAt || null });
      toast(t('promoCreated'));
      setForm(EMPTY);
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  const toggle = async (promo) => {
    try {
      await api.updatePromo(promo.id, { ...promo, isActive: !promo.isActive });
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  const togglePublic = async (promo) => {
    try {
      await api.updatePromo(promo.id, { ...promo, isPublic: !promo.isPublic });
      toast(promo.isPublic ? t('promoNowSecret', promo.code) : t('promoNowVisible', promo.code));
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  const remove = async (promo) => {
    if (!confirm(t('promoRemoveConfirm', promo.code))) return;
    try {
      await api.deletePromo(promo.id);
      toast(t('removed'));
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('promoTitle')}</h1>
          <p>{t('promoSub')}</p>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">{t('promoNew')}</div>
        <form className="modal-body" onSubmit={add}>
          <div className="form-grid">
            <div className="form-row">
              <label>{t('promoCode')}</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="BAHOR20"
              />
            </div>
            <div className="form-row">
              <label>{t('promoType')}</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="PERCENT">{t('promoPercent')}</option>
                <option value="FIXED">{t('promoFixed')}</option>
              </select>
            </div>
            <div className="form-row">
              <label>
                {form.type === 'PERCENT' ? t('promoHowMuchPercent') : t('promoHowMuchSum')}
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              />
            </div>
            <div className="form-row">
              <label>
                {t('promoMinTotal')} <span className="hint">{t('promoMinHint')}</span>
              </label>
              <input
                type="number"
                value={form.minTotal}
                onChange={(e) => setForm({ ...form, minTotal: Number(e.target.value) })}
              />
            </div>
            <div className="form-row">
              <label>
                {t('promoLimit')} <span className="hint">{t('promoLimitHint')}</span>
              </label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
              />
            </div>
            <div className="form-row">
              <label>{t('promoExpires')}</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
            <div className="form-row full">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                />
                {t('promoShowInShop')}
              </label>
              <span className="hint">{t('promoShowHint')}</span>
            </div>
          </div>
          <button className="btn" style={{ marginTop: 14 }} type="submit">
            {t('create')}
          </button>
        </form>
      </div>

      <div className="panel">
        {loading ? (
          <div className="spinner" />
        ) : promos.length === 0 ? (
          <div className="empty-state">
            <div className="ico">🎟</div>
            {t('promoNone')}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('promoCode')}</th>
                  <th>{t('promoDiscount')}</th>
                  <th>{t('promoMinShort')}</th>
                  <th>{t('promoUsed')}</th>
                  <th>{t('promoExpiryShort')}</th>
                  <th>{t('promoVisibility')}</th>
                  <th>{t('statusCol')}</th>
                  <th style={{ width: 50 }} />
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.id}>
                    <td className="cell-main">
                      <code>{p.code}</code>
                    </td>
                    <td>{p.type === 'PERCENT' ? `${p.value}%` : money(p.value, currency)}</td>
                    <td>{p.minTotal ? money(p.minTotal, currency) : '—'}</td>
                    <td>
                      {p.usedCount}
                      {p.usageLimit > 0 && ` / ${p.usageLimit}`}
                    </td>
                    <td>{p.expiresAt ? date(p.expiresAt) : '∞'}</td>
                    <td>
                      <button
                        className={`badge ${p.isPublic ? 'new' : 'grey'}`}
                        onClick={() => togglePublic(p)}
                        title={p.isPublic ? t('promoVisibleTitle') : t('promoSecretTitle')}
                      >
                        {p.isPublic ? t('promoVisible') : t('promoSecret')}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`badge ${p.isActive ? 'confirmed' : 'grey'}`}
                        onClick={() => toggle(p)}
                      >
                        {p.isActive ? t('active') : t('disabled')}
                      </button>
                    </td>
                    <td>
                      <button className="icon-btn" onClick={() => remove(p)}>
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
