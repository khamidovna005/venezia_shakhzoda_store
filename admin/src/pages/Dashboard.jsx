import { money } from '../lib/format.js';

export default function Dashboard({ stats, currency, onGoOrders }) {
  if (!stats) return <div className="spinner" />;

  const cards = [
    { label: '🆕 Yangi buyurtmalar', value: stats.newOrders, accent: true },
    { label: '📅 Bugungi buyurtmalar', value: stats.todayOrders },
    { label: '💰 Bugungi savdo', value: money(stats.todayRevenue, currency) },
    { label: '📦 Jami buyurtmalar', value: stats.totalOrders },
    { label: '✅ Yetkazilgan', value: stats.delivered },
    { label: '💵 Umumiy savdo', value: money(stats.revenue, currency) },
    { label: '👕 Mahsulotlar', value: stats.productCount },
    { label: '👥 Mijozlar', value: stats.userCount },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Boshqaruv paneli</h1>
          <p>
            <span className="live-dot" />
            Ma'lumotlar har 15 soniyada yangilanadi
          </p>
        </div>
        {stats.newOrders > 0 && (
          <button className="btn" onClick={onGoOrders}>
            {stats.newOrders} ta yangi buyurtmani ko‘rish →
          </button>
        )}
      </div>

      <div className="stats">
        {cards.map((card) => (
          <div
            className="stat"
            key={card.label}
            style={card.accent && card.value > 0 ? { borderColor: '#4338ca' } : undefined}
          >
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">🔥 Eng ko‘p sotilgan mahsulotlar</div>
        {stats.topProducts.length === 0 ? (
          <div className="empty-state">
            <div className="ico">📊</div>
            Hali savdo bo‘lmagan
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Rasm</th>
                  <th>Nomi</th>
                  <th>Narxi</th>
                  <th>Sotilgan</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img className="thumb" src={p.images?.[0]} alt="" />
                    </td>
                    <td className="cell-main">{p.nameUz}</td>
                    <td>{money(p.price, currency)}</td>
                    <td>
                      <span className="badge green">{p.soldCount} dona</span>
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
