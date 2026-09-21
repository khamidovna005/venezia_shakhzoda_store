import { useEffect, useState } from 'react';
import api, { imageUrl } from '../lib/api.js';
import { money } from '../lib/format.js';
import { useLang } from '../lib/lang.jsx';
import { pick } from '../lib/i18n.js';
import ProductForm from './ProductForm.jsx';

export default function Products({ currency, toast }) {
  const { t, lang } = useLang();
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
      toast(t('productAdded'));
    } else {
      await api.updateProduct(editing.id, data);
      toast(t('productUpdated'));
    }
    setEditing(null);
    load();
  };

  const remove = async (product) => {
    if (!confirm(t('removeConfirm', pick(product, 'name', lang)))) return;
    try {
      await api.deleteProduct(product.id);
      toast(t('productRemoved'));
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
          <h1>{t('productsTitle')}</h1>
          <p>{t('total', products.length)}</p>
        </div>
        <button className="btn" onClick={() => setEditing('new')}>
          {t('productsNew')}
        </button>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder={t('search')}
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
            {t('productsNotFound')}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 58 }}>{t('image')}</th>
                  <th>{t('name')}</th>
                  <th>{t('colCategory')}</th>
                  <th>{t('price')}</th>
                  <th>{t('colStock')}</th>
                  <th>{t('sold')}</th>
                  <th>{t('statusCol')}</th>
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
                        <div className="cell-main">{pick(p, 'name', lang)}</div>
                        <div className="cell-sub">
                          {p.brand}
                          {p.isNew && ' · NEW'}
                          {p.isHit && ' · HIT'}
                        </div>
                      </td>

                      <td>
                        {p.category.emoji} {pick(p.category, 'name', lang)}
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
                          {t('pcs', stock)}
                        </span>
                        <div className="cell-sub">{t('variantsCount', p.variants.length)}</div>
                      </td>

                      <td>{p.soldCount}</td>

                      <td>
                        <span className={`badge ${p.isActive ? 'confirmed' : 'grey'}`}>
                          {p.isActive ? t('onSale') : t('hidden')}
                        </span>
                      </td>

                      <td>
                        <button className="icon-btn" onClick={() => setEditing(p)} title={t('edit')}>
                          ✏️
                        </button>
                        <button className="icon-btn" onClick={() => remove(p)} title={t('remove')}>
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
