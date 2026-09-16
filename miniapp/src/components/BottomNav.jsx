import { haptic } from '../lib/telegram.js';

const TABS = [
  { key: 'home', ico: '🏠' },
  { key: 'catalog', ico: '🔍' },
  { key: 'cart', ico: '🛒' },
  { key: 'profile', ico: '👤' },
];

export default function BottomNav({ tab, onChange, cartCount, t }) {
  return (
    <nav className="nav">
      {TABS.map(({ key, ico }) => (
        <button
          key={key}
          className={`nav-btn ${tab === key ? 'active' : ''}`}
          onClick={() => {
            haptic('light');
            onChange(key);
          }}
        >
          <span className="ico">{ico}</span>
          {t(key)}
          {key === 'cart' && cartCount > 0 && <span className="nav-dot">{cartCount}</span>}
        </button>
      ))}
    </nav>
  );
}
