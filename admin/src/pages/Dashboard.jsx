import { money } from '../lib/format.js';
import { useLang } from '../lib/lang.jsx';
import { pick } from '../lib/i18n.js';

export default function Dashboard({ stats, currency, onGoOrders }) {
  const { t, lang } = useLang();
  if (!stats) return <div className="spinner" />;

  const cards = [
    { label: t('dashNewOrders'), value: stats.newOrders, accent: true },
    { label: t('dashTodayOrders'), value: stats.todayOrders },
    { label: t('dashTodayRevenue'), value: money(stats.todayRevenue, currency) },
    { label: t('dashTotalOrders'), value: stats.totalOrders },
    { label: t('dashDelivered'), value: stats.delivered },
    { label: t('dashRevenue'), value: money(stats.revenue, currency) },
    { label: t('dashProducts'), value: stats.productCount },
    { label: t('dashCustomers'), value: stats.userCount },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('dashTitle')}</h1>
          <p>
            <span className="live-dot" />
            {t('dashSub')}
          </p>
        </div>
        {stats.newOrders > 0 && (
          <button className="btn" onClick={onGoOrders}>
            {t('dashGoOrders', stats.newOrders)}
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
        <div className="panel-head">{t('dashTopProducts')}</div>
        {stats.topProducts.length === 0 ? (
          <div className="empty-state">
            <div className="ico">📊</div>
            {t('dashNoSales')}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>{t('image')}</th>
                  <th>{t('name')}</th>
                  <th>{t('price')}</th>
                  <th>{t('sold')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img className="thumb" src={p.images?.[0]} alt="" />
                    </td>
                    <td className="cell-main">{pick(p, 'name', lang)}</td>
                    <td>{money(p.price, currency)}</td>
                    <td>
                      <span className="badge green">{t('pcs', p.soldCount)}</span>
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
