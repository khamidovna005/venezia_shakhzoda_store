import { useEffect, useState } from 'react';
import api from '../lib/api.js';

const EMPTY = { nameUz: '', nameRu: '', emoji: '👕', sortOrder: 0 };

export default function Categories({ toast }) {
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
      toast('Kategoriya qo‘shildi ✓');
      setForm(EMPTY);
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  const remove = async (category) => {
    if (category._count.products > 0) {
      if (
        !confirm(
          `"${category.nameUz}" ichida ${category._count.products} ta mahsulot bor. Ular ham o‘chiriladi. Davom etasizmi?`,
        )
      )
        return;
    } else if (!confirm(`"${category.nameUz}" o‘chirilsinmi?`)) return;

    try {
      await api.deleteCategory(category.id);
      toast('O‘chirildi');
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
          <h1>Kategoriyalar</h1>
          <p>Mini App katalogidagi filtr teglari</p>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">➕ Yangi kategoriya</div>
        <form className="modal-body" onSubmit={add}>
          <div className="form-grid">
            <div className="form-row">
              <label>Nomi (UZ)</label>
              <input
                type="text"
                value={form.nameUz}
                onChange={(e) => setForm({ ...form, nameUz: e.target.value })}
                placeholder="Poyabzal"
              />
            </div>
            <div className="form-row">
              <label>Nomi (RU)</label>
              <input
                type="text"
                value={form.nameRu}
                onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                placeholder="Обувь"
              />
            </div>
            <div className="form-row">
              <label>Emoji</label>
              <input
                type="text"
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              />
            </div>
            <div className="form-row">
              <label>Tartib raqami</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </div>
          </div>
          <button className="btn" style={{ marginTop: 14 }} type="submit">
            Qo‘shish
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
                  <th>Kategoriya</th>
                  <th>Slug</th>
                  <th>Mahsulotlar</th>
                  <th>Tartib</th>
                  <th>Holat</th>
                  <th style={{ width: 50 }} />
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="cell-main">
                      {c.emoji} {c.nameUz}
                      <div className="cell-sub">{c.nameRu}</div>
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
                        {c.isActive ? 'Faol' : 'Yashirin'}
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
