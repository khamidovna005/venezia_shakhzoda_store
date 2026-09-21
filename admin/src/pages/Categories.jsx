import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { useLang } from '../lib/lang.jsx';
import { pick } from '../lib/i18n.js';

const EMPTY = { nameUz: '', nameRu: '', emoji: '👕', sortOrder: 0 };

export default function Categories({ toast }) {
  const { t, lang } = useLang();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.categories();
      setCategories(res.categories);
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
    if (!form.nameUz.trim()) return;
    try {
      await api.createCategory(form);
      toast(t('catAdded'));
      setForm(EMPTY);
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  const remove = async (category) => {
    const nomi = pick(category, 'name', lang);
    if (category._count.products > 0) {
      if (!confirm(t('catRemoveWithProducts', nomi, category._count.products))) return;
    } else if (!confirm(t('removeConfirm', nomi))) return;

    try {
      await api.deleteCategory(category.id);
      toast(t('removed'));
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  const toggle = async (category) => {
    try {
      await api.updateCategory(category.id, { ...category, isActive: !category.isActive });
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('catTitle')}</h1>
          <p>{t('catSub')}</p>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">{t('catNew')}</div>
        <form className="modal-body" onSubmit={add}>
          <div className="form-grid">
            <div className="form-row">
              <label>{t('catNameUz')}</label>
              <input
                type="text"
                value={form.nameUz}
                onChange={(e) => setForm({ ...form, nameUz: e.target.value })}
                placeholder="Poyabzal"
              />
            </div>
            <div className="form-row">
              <label>{t('catNameRu')}</label>
              <input
                type="text"
                value={form.nameRu}
                onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                placeholder="Обувь"
              />
            </div>
            <div className="form-row">
              <label>{t('catEmoji')}</label>
              <input
                type="text"
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              />
            </div>
            <div className="form-row">
              <label>{t('catOrder')}</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </div>
          </div>
          <button className="btn" style={{ marginTop: 14 }} type="submit">
            {t('add')}
          </button>
        </form>
      </div>

      <div className="panel">
        {loading ? (
          <div className="spinner" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('colCategory')}</th>
                  <th>Slug</th>
                  <th>{t('navProducts')}</th>
                  <th>{t('catOrderShort')}</th>
                  <th>{t('statusCol')}</th>
                  <th style={{ width: 50 }} />
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="cell-main">
                      {c.emoji} {pick(c, 'name', lang)}
                      <div className="cell-sub">{lang === 'ru' ? c.nameUz : c.nameRu}</div>
                    </td>
                    <td>
                      <code>{c.slug}</code>
                    </td>
                    <td>{c._count.products}</td>
                    <td>{c.sortOrder}</td>
                    <td>
                      <button
                        className={`badge ${c.isActive ? 'confirmed' : 'grey'}`}
                        onClick={() => toggle(c)}
                      >
                        {c.isActive ? t('active') : t('hidden')}
                      </button>
                    </td>
                    <td>
                      <button className="icon-btn" onClick={() => remove(c)}>
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
