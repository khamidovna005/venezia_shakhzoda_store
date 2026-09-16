import { useEffect, useState } from 'react';
import api, { imageUrl } from '../lib/api.js';
import { money } from '../lib/format.js';
import ProductForm from './ProductForm.jsx';

export default function Products({ currency, toast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([api.products(), api.categories()]);
      setProducts(p.products);
      setCategories(c.categories);
    } catch (err) {
      toast(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (data) => {
    if (editing === 'new') {
      await api.createProduct(data);
      toast('Mahsulot qo‘shildi ✓');
    } else {
      await api.updateProduct(editing.id, data);
      toast('Mahsulot yangilandi ✓');
    }
    setEditing(null);
    load();
  };

  const remove = async (product) => {
    if (!confirm(`"${product.nameUz}" o‘chirilsinmi?`)) return;
    try {
      await api.deleteProduct(product.id);
      toast('Mahsulot o‘chirildi');
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  const filtered = products.filter((p) =>
    `${p.nameUz} ${p.nameRu} ${p.brand ?? ''}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mahsulotlar</h1>
          <p>Jami {products.length} ta</p>
        </div>
        <button className="btn" onClick={() => setEditing('new')}>
          + Yangi mahsulot
        </button>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="panel">
        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="ico">👕</div>
            Mahsulot topilmadi
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 58 }}>Rasm</th>
                  <th>Nomi</th>
                  <th>Kategoriya</th>
                  <th>Narxi</th>
                  <th>Omborda</th>
                  <th>Sotilgan</th>
                  <th>Holat</th>
                  <th style={{ width: 90 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const stock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                  return (
                    <tr key={p.id}>
                      <td>
                        <img className="thumb" src={imageUrl(p.images?.[0])} alt="" />
                      </td>

                      <td>
                        <div className="cell-main">{p.nameUz}</div>
                        <div className="cell-sub">
                          {p.brand}
                          {p.isNew && ' · NEW'}
                          {p.isHit && ' · HIT'}
                        </div>
                      </td>

                      <td>
                        {p.category.emoji} {p.category.nameUz}
                      </td>

                      <td>
                        <div className="cell-main">{money(p.price, currency)}</div>
                        {p.oldPrice && (
                          <div className="cell-sub" style={{ textDecoration: 'line-through' }}>
                            {money(p.oldPrice, currency)}
                          </div>
                        )}
                      </td>

                      <td>
                        <span className={`badge ${stock > 0 ? 'green' : 'cancelled'}`}>
                          {stock} dona
                        </span>
                        <div className="cell-sub">{p.variants.length} variant</div>
                      </td>

                      <td>{p.soldCount}</td>

                      <td>
                        <span className={`badge ${p.isActive ? 'confirmed' : 'grey'}`}>
                          {p.isActive ? 'Sotuvda' : 'Yashirin'}
                        </span>
                      </td>

                      <td>
                        <button className="icon-btn" onClick={() => setEditing(p)} title="Tahrirlash">
                          ✏️
                        </button>
                        <button className="icon-btn" onClick={() => remove(p)} title="O‘chirish">
                          🗑
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </>
  );
}
