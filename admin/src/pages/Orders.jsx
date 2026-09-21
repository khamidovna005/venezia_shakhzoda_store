import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api.js';
import {
  money,
  date,
  STATUS_KEYS,
  STATUS_CLASS,
  PAYMENT_STATUS_KEYS,
} from '../lib/format.js';
import { useLang } from '../lib/lang.jsx';
import { pick } from '../lib/i18n.js';

const FILTERS = [
  { key: 'ALL', label: 'filterAll' },
  { key: 'NEW', label: 'filterNew' },
  { key: 'CONFIRMED', label: 'filterConfirmed' },
  { key: 'SHIPPING', label: 'filterShipping' },
  { key: 'DELIVERED', label: 'filterDelivered' },
  { key: 'CANCELLED', label: 'filterCancelled' },
];

/** Bir marta yuklanadigan buyurtmalar soni */
const PAGE = 50;

export default function Orders({ currency, toast, onChanged }) {
  const { t, lang } = useLang();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  // Nechta sahifa ochilgani. Har doim boshidan yuklaymiz (skip: 0) —
  // shunda yangi buyurtma kelib qolsa ham ro'yxat siljib ketmaydi va
  // takrorlanmaydi.
  const [pages, setPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(
    async ({ silent = false, pages: want = 1 } = {}) => {
      if (!silent) setLoading(true);
      try {
        const res = await api.orders({ status, search, skip: 0, take: PAGE * want });
        setOrders(res.orders);
        setTotal(res.total);
        setPages(want);
      } catch (err) {
        toast(err.message);
      } finally {
        setLoading(false);
      }
    },
    [status, search, toast],
  );

  // Filtr yoki qidiruv o'zgarsa — birinchi sahifadan boshlanadi
  useEffect(() => {
    load({ pages: 1 });
  }, [load]);

  // Real vaqt effekti: har 15 soniyada jimgina yangilanadi.
  // Ochilgan sahifalar soni saqlanadi — ro'yxat qisqarib qolmaydi.
  useEffect(() => {
    const timer = setInterval(() => load({ silent: true, pages }), 15000);
    return () => clearInterval(timer);
  }, [load, pages]);

  const loadMore = async () => {
    setLoadingMore(true);
    await load({ silent: true, pages: pages + 1 });
    setLoadingMore(false);
  };

  const changeStatus = async (order, next) => {
    try {
      await api.setOrderStatus(order.id, next);
      toast(t('orderStatusChanged', order.orderNo, t(`status_${next}`)));
      load({ silent: true, pages });
      onChanged?.();
    } catch (err) {
      toast(err.message);
    }
  };

  const changePayment = async (order, next) => {
    try {
      await api.setPaymentStatus(order.id, next);
      toast(t('orderPaymentChanged', order.orderNo, t(`payStatus_${next}`)));
      load({ silent: true, pages });
    } catch (err) {
      toast(err.message);
    }
  };

  const remove = async (order) => {
    if (!confirm(t('orderRemoveConfirm', order.orderNo))) return;
    try {
      await api.deleteOrder(order.id);
      toast(t('orderRemoved'));
      load({ silent: true, pages });
      onChanged?.();
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('ordersTitle')}</h1>
          <p>
            <span className="live-dot" />
            {orders.length < total ? t('ordersShowing', orders.length, total) : t('total', total)} ·{' '}
            {t('autoRefresh')}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => load({ pages })}>
          {t('refresh')}
        </button>
      </div>

      <div className="toolbar">
        <div className="tabs">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`tab ${status === f.key ? 'active' : ''}`}
              onClick={() => setStatus(f.key)}
            >
              {t(f.label)}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder={t('ordersSearch')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginLeft: 'auto' }}
        />
      </div>

      <div className="panel">
        {loading ? (
          <div className="spinner" />
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="ico">📭</div>
            {t('ordersNotFound')}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('colOrder')}</th>
                  <th>{t('colCustomer')}</th>
                  <th>{t('colItems')}</th>
                  <th>{t('colAddress')}</th>
                  <th>{t('colPayment')}</th>
                  <th>{t('colSum')}</th>
                  <th>{t('statusCol')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className="cell-main">{order.orderNo}</div>
                      <div className="cell-sub">{date(order.createdAt)}</div>
                    </td>

                    <td>
                      <div className="cell-main">{order.customerName}</div>
                      <div className="cell-sub">
                        <a href={`tel:${order.phone}`}>{order.phone}</a>
                        {order.user?.username && <> · @{order.user.username}</>}
                      </div>
                    </td>

                    <td>
                      <div className="items-list">
                        {order.items.map((item, i) => (
                          <div key={i}>
                            <b>{pick(item, 'name', lang)}</b>
                            {item.size && ` · ${item.size}`}
                            {pick(item, 'color', lang) && ` · ${pick(item, 'color', lang)}`} ×{' '}
                            {item.qty}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td>
                      <div className="items-list">
                        {order.address || '—'}
                        {order.lat && (
                          <div>
                            <a
                              href={`https://maps.google.com/?q=${order.lat},${order.lng}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {t('onMap')}
                            </a>
                          </div>
                        )}
                        {order.comment && <div className="cell-sub">💬 {order.comment}</div>}
                      </div>
                    </td>

                    <td>
                      <div className="cell-sub" style={{ marginBottom: 4 }}>
                        {t(`payment_${order.paymentMethod}`)}
                      </div>
                      <select
                        className="compact"
                        value={order.paymentStatus}
                        onChange={(e) => changePayment(order, e.target.value)}
                      >
                        {PAYMENT_STATUS_KEYS.map((key) => (
                          <option key={key} value={key}>
                            {t(`payStatus_${key}`)}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <div className="cell-main">{money(order.total, currency)}</div>
                      {order.discount > 0 && (
                        <div className="cell-sub">
                          −{money(order.discount, currency)}
                          {order.promoCode && ` (${order.promoCode})`}
                        </div>
                      )}
                    </td>

                    <td>
                      <select
                        className="compact"
                        value={order.status}
                        onChange={(e) => changeStatus(order, e.target.value)}
                      >
                        {STATUS_KEYS.map((key) => (
                          <option key={key} value={key}>
                            {t(`status_${key}`)}
                          </option>
                        ))}
                      </select>
                      <div style={{ marginTop: 5 }}>
                        <span className={`badge ${STATUS_CLASS[order.status]}`}>
                          {t(`status_${order.status}`)}
                        </span>
                      </div>
                    </td>

                    <td>
                      <button className="icon-btn" title={t('remove')} onClick={() => remove(order)}>
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Eski buyurtmalar yo'qolmasin — qolganini shu yerdan ochamiz */}
        {!loading && orders.length < total && (
          <div className="load-more">
            <button className="btn btn-ghost" onClick={loadMore} disabled={loadingMore}>
              {loadingMore
                ? t('loading')
                : t('ordersLoadMore', Math.min(PAGE, total - orders.length))}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
