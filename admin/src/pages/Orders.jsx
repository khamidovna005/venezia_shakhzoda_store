import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api.js';
import { money, date, STATUS, PAYMENT, PAYMENT_STATUS } from '../lib/format.js';

const FILTERS = [
  { key: 'ALL', label: 'Barchasi' },
  { key: 'NEW', label: '🆕 Yangi' },
  { key: 'CONFIRMED', label: '✅ Tasdiqlangan' },
  { key: 'SHIPPING', label: "🚚 Yo'lda" },
  { key: 'DELIVERED', label: '📦 Yetkazilgan' },
  { key: 'CANCELLED', label: '❌ Bekor' },
];

export default function Orders({ currency, toast, onChanged }) {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await api.orders({ status, search, take: 100 });
        setOrders(res.orders);
        setTotal(res.total);
      } catch (err) {
        toast(err.message);
      } finally {
        setLoading(false);
      }
    },
    [status, search, toast],
  );

  useEffect(() => {
    load();
  }, [load]);

  // Real vaqt effekti: har 15 soniyada jimgina yangilanadi
  useEffect(() => {
    const timer = setInterval(() => load(true), 15000);
    return () => clearInterval(timer);
  }, [load]);

  const changeStatus = async (order, next) => {
    try {
      await api.setOrderStatus(order.id, next);
      toast(`${order.orderNo} → ${STATUS[next].label}. Mijozga botda xabar yuborildi.`);
      load(true);
      onChanged?.();
    } catch (err) {
      toast(err.message);
    }
  };

  const changePayment = async (order, next) => {
    try {
      await api.setPaymentStatus(order.id, next);
      toast(`${order.orderNo} to‘lovi: ${PAYMENT_STATUS[next]}`);
      load(true);
    } catch (err) {
      toast(err.message);
    }
  };

  const remove = async (order) => {
    if (!confirm(`${order.orderNo} buyurtmasi o‘chirilsinmi?`)) return;
    try {
      await api.deleteOrder(order.id);
      toast('Buyurtma o‘chirildi');
      load(true);
      onChanged?.();
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Buyurtmalar</h1>
          <p>
            <span className="live-dot" />
            Jami {total} ta · avtomatik yangilanadi
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => load()}>
          ↻ Yangilash
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
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Raqam, ism yoki telefon..."
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
            Buyurtmalar topilmadi
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Buyurtma</th>
                  <th>Mijoz</th>
                  <th>Mahsulotlar</th>
                  <th>Manzil</th>
                  <th>To‘lov</th>
                  <th>Summa</th>
                  <th>Holat</th>
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
                            <b>{item.nameUz}</b>
                            {item.size && ` · ${item.size}`}
                            {item.colorUz && ` · ${item.colorUz}`} × {item.qty}
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
                              📍 Xaritada
                            </a>
                          </div>
                        )}
                        {order.comment && <div className="cell-sub">💬 {order.comment}</div>}
                      </div>
                    </td>

                    <td>
                      <div className="cell-sub" style={{ marginBottom: 4 }}>
                        {PAYMENT[order.paymentMethod]}
                      </div>
                      <select
                        className="compact"
                        value={order.paymentStatus}
                        onChange={(e) => changePayment(order, e.target.value)}
                      >
                        {Object.entries(PAYMENT_STATUS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
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
                        {Object.entries(STATUS).map(([key, val]) => (
                          <option key={key} value={key}>
                            {val.label}
                          </option>
                        ))}
                      </select>
                      <div style={{ marginTop: 5 }}>
                        <span className={`badge ${STATUS[order.status].cls}`}>
                          {STATUS[order.status].label}
                        </span>
                      </div>
                    </td>

                    <td>
                      <button className="icon-btn" title="O‘chirish" onClick={() => remove(order)}>
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
