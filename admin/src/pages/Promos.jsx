import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { money, date } from '../lib/format.js';

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
      toast('Promokod yaratildi ✓');
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
      toast(promo.isPublic ? `${promo.code} endi maxfiy` : `${promo.code} do‘konda ko‘rinadi`);
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  const remove = async (promo) => {
    if (!confirm(`${promo.code} o‘chirilsinmi?`)) return;
    try {
      await api.deletePromo(promo.id);
      toast('O‘chirildi');
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Promokodlar</h1>
          <p>Mijozlar savatchada kiritadigan chegirma kodlari</p>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">➕ Yangi promokod</div>
        <form className="modal-body" onSubmit={add}>
          <div className="form-grid">
            <div className="form-row">
              <label>Kod</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="BAHOR20"
              />
            </div>
            <div className="form-row">
              <label>Turi</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="PERCENT">Foizda (%)</option>
                <option value="FIXED">Belgilangan summa</option>
              </select>
            </div>
            <div className="form-row">
              <label>{form.type === 'PERCENT' ? 'Necha foiz' : "Necha so'm"}</label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              />
            </div>
            <div className="form-row">
              <label>
                Minimal summa <span className="hint">— 0 = cheklovsiz</span>
              </label>
              <input
                type="number"
                value={form.minTotal}
                onChange={(e) => setForm({ ...form, minTotal: Number(e.target.value) })}
              />
            </div>
            <div className="form-row">
              <label>
                Ishlatish limiti <span className="hint">— 0 = cheksiz</span>
              </label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
              />
            </div>
            <div className="form-row">
              <label>Amal qilish muddati</label>
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
                Do‘konda ko‘rsatish
              </label>
              <span className="hint">
                Belgilansa — mijozlar do‘kon sahifasida bu kodni ko‘radi va bir bosishda
                nusxalaydi. Belgilanmasa — kod ishlaydi, lekin faqat siz aytgan odam biladi.
              </span>
            </div>
          </div>
          <button className="btn" style={{ marginTop: 14 }} type="submit">
            Yaratish
          </button>
        </form>
      </div>

      <div className="panel">
        {loading ? (
          <div className="spinner" />
        ) : promos.length === 0 ? (
          <div className="empty-state">
            <div className="ico">🎟</div>
            Promokodlar yo‘q
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kod</th>
                  <th>Chegirma</th>
                  <th>Min. summa</th>
                  <th>Ishlatilgan</th>
                  <th>Muddati</th>
                  <th>Ko‘rinishi</th>
                  <th>Holat</th>
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
                        title={
                          p.isPublic
                            ? 'Mijozlar do‘konda ko‘radi — bosib yashirasiz'
                            : 'Faqat siz aytgan odam biladi — bosib ko‘rsatasiz'
                        }
                      >
                        {p.isPublic ? '👁 Ko‘rinadi' : '🔒 Maxfiy'}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`badge ${p.isActive ? 'confirmed' : 'grey'}`}
                        onClick={() => toggle(p)}
                      >
                        {p.isActive ? 'Faol' : "O'chiq"}
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
