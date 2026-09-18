import { useState } from 'react';
import { haptic } from '../lib/telegram.js';
import { money } from '../lib/i18n.js';

/**
 * Mijozga ochiq promokodlarni ko'rsatadi.
 *
 * Bosilganda kod nusxalanadi — mijoz uni savatchaga qo'lda ko'chirib
 * yozishi shart emas.
 */
export default function PromoBar({ promos, lang, currency, t }) {
  const [copied, setCopied] = useState('');

  if (!promos?.length) return null;

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      haptic('success');
      setTimeout(() => setCopied(''), 1800);
    } catch {
      // Clipboard ishlamasa ham kod ko'rinib turibdi — mijoz o'qib oladi
      haptic('warning');
    }
  };

  const discountOf = (p) =>
    p.type === 'PERCENT' ? `−${p.value}%` : `−${money(p.value, currency)}`;

  return (
    <div className="section">
      <div className="section-head">
        <span className="section-title">🎟 {t('promoTitle')}</span>
      </div>

      <div className="promo-list">
        {promos.map((p) => (
          <button
            key={p.code}
            type="button"
            className={`promo-chip ${copied === p.code ? 'is-copied' : ''}`}
            onClick={() => copy(p.code)}
          >
            <span className="promo-code">{p.code}</span>
            <span className="promo-off">{discountOf(p)}</span>
            {p.minTotal > 0 && (
              <span className="promo-cond">
                {money(p.minTotal, currency)} {t('promoFrom')}
              </span>
            )}
            <span className="promo-hint">
              {copied === p.code ? t('promoCopied') : t('promoTap')}
            </span>
            {p.left != null && p.left <= 10 && (
              <span className="promo-left">{t('promoLeft', p.left)}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
