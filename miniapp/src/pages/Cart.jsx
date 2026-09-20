import { useMemo, useState } from 'react';
import Img from '../components/Img.jsx';
import { pick, money } from '../lib/i18n.js';
import { haptic, requestLocation, openLocationSettings } from '../lib/telegram.js';
import api from '../lib/api.js';

export default function Cart({
  t,
  lang,
  settings,
  user,
  cart,
  upsell,
  onGoCatalog,
  onSuccess,
  toast,
}) {
  const [name, setName] = useState(user?.firstName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationIssue, setLocationIssue] = useState('');
  const [canOpenSettings, setCanOpenSettings] = useState(false);
  const [waitingChat, setWaitingChat] = useState(false);
  const [payment, setPayment] = useState('CASH');

  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const currency = settings.currency;

  /* ---------------- Upsell ---------------- */
  const upsellVariant = upsell?.variants?.find((v) => v.stock > 0) ?? null;
  const upsellInCart = upsell ? cart.items.some((i) => i.productId === upsell.id) : false;

  const toggleUpsell = () => {
    haptic('light');
    if (upsellInCart) {
      const line = cart.items.find((i) => i.productId === upsell.id);
      cart.remove(cart.lineKey(line));
    } else {
      cart.add({
        productId: upsell.id,
        variantId: upsellVariant?.id ?? null,
        nameUz: upsell.nameUz,
        nameRu: upsell.nameRu,
        image: upsell.images?.[0] ?? null,
        size: upsellVariant?.size ?? null,
        colorUz: upsellVariant?.colorUz ?? null,
        colorRu: upsellVariant?.colorRu ?? null,
        colorHex: upsellVariant?.colorHex ?? null,
        price: upsell.price,
      });
    }
  };

  /* ---------------- Hisob-kitob ---------------- */
  const subtotal = cart.subtotal;
  const discount = promo?.discount ?? 0;
  const deliveryFee = subtotal >= settings.freeDeliveryFrom ? 0 : settings.deliveryFee;
  const total = Math.max(0, subtotal - discount) + deliveryFee;

  const remainingForFree = useMemo(
    () => Math.max(0, settings.freeDeliveryFrom - subtotal),
    [settings.freeDeliveryFrom, subtotal],
  );

  /* ---------------- Promokod ---------------- */
  const applyPromo = async () => {
    setPromoError('');
    try {
      const result = await api.checkPromo(promoInput, subtotal);
      setPromo(result);
      haptic('success');
    } catch (err) {
      setPromo(null);
      setPromoError(err.message);
      haptic('error');
    }
  };

  /* ---------------- Lokatsiya ---------------- */
  const getLocation = async () => {
    haptic('light');
    setLocating(true);
    setLocationIssue('');

    const res = await requestLocation();

    if (res.ok) {
      setCoords({ lat: res.lat, lng: res.lng });
      haptic('success');
      setLocating(false);
      return;
    }

    // Ruxsat berilmagan bo'lsa — sozlamani ochish tugmasini ko'rsatamiz
    if (res.reason === 'denied') {
      setLocationIssue('denied');
      setCanOpenSettings(true);
      setLocating(false);
      haptic('warning');
      return;
    }

    // Qurilma ilova ichidan lokatsiya bera olmaydi — chatdagi tugmaga
    // o'tamiz. U Telegram'ning hamma versiyasida ishlaydi.
    await askViaChat();
  };

  /**
   * Chatdagi lokatsiya tugmasini chaqiradi va javobni kutadi.
   * Mijoz chatda tugmani bosishi bilan koordinata savatchaga tushadi.
   */
  const askViaChat = async () => {
    setWaitingChat(true);
    setLocating(false);

    try {
      await api.requestLocation();
    } catch {
      setWaitingChat(false);
      setLocationIssue('timeout');
      setCanOpenSettings(false);
      return;
    }

    // 90 soniya davomida har 3 soniyada natijani so'raymiz
    for (let i = 0; i < 30; i += 1) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const { location } = await api.myLocation();
        if (location) {
          setCoords(location);
          setWaitingChat(false);
          haptic('success');
          return;
        }
      } catch {
        /* tarmoq uzilsa keyingi urinishda qaytadan so'raymiz */
      }
    }

    // Kutish tugadi — mijoz keyinroq bosishi mumkin, buyurtma to'xtamaydi
    setWaitingChat(false);
  };

  /**
   * Telegram sozlamalarini ochadi.
   * Hujjat bo'yicha bu faqat foydalanuvchi bosgan zahoti ishlaydi,
   * shuning uchun bu yerda hech qanday `await` yo'q.
   */
  const openSettings = () => {
    haptic('light');
    openLocationSettings();
    setLocationIssue('');
  };

  /* ---------------- Buyurtma ---------------- */
  const submit = async () => {
    setError('');

    if (!phone.trim() || phone.trim().length < 7) {
      setError(t('phone'));
      haptic('error');
      return;
    }
    if (!address.trim() && !coords) {
      setError(t('address'));
      haptic('error');
      return;
    }

    setSending(true);
    try {
      const { order } = await api.createOrder({
        items: cart.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          qty: i.qty,
        })),
        customerName: name.trim() || user?.firstName,
        phone: phone.trim(),
        address: address.trim() || null,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        comment: comment.trim() || null,
        promoCode: promo?.code ?? null,
        paymentMethod: payment,
      });

      haptic('success');
      cart.clear();
      onSuccess(order);
    } catch (err) {
      setError(err.message);
      haptic('error');
    } finally {
      setSending(false);
    }
  };

  /* ---------------- Bo'sh savatcha ---------------- */
  if (cart.items.length === 0) {
    return (
      <div className="page">
        <div className="header">
          <h1>{t('cart')}</h1>
        </div>
        <div className="empty">
          <div className="empty-ico">🛒</div>
          <h3>{t('cartEmpty')}</h3>
          <p>{t('cartEmptyText')}</p>
          <button className="btn" onClick={onGoCatalog} style={{ maxWidth: 220, margin: '0 auto' }}>
            {t('goToCatalog')}
          </button>
        </div>
      </div>
    );
  }

  const payOptions = [
    { key: 'CASH', label: t('cash'), ico: '💵', enabled: settings.payments.cash },
    { key: 'CARD_TRANSFER', label: t('cardTransfer'), ico: '💳', enabled: settings.payments.cardTransfer },
  ];

  return (
    <div className="page">
      <div className="header">
        <h1>{t('cart')}</h1>
      </div>

      {/* ---- Mahsulotlar ---- */}
      {cart.items.map((item) => {
        const key = cart.lineKey(item);
        return (
          <div className="cart-item" key={key}>
            <Img src={item.image} alt="" />

            <div className="cart-item-body">
              <div className="cart-item-name">{pick(item, 'name', lang)}</div>
              <div className="cart-item-meta">
                {[item.size, pick(item, 'color', lang)].filter(Boolean).join(' · ')}
              </div>
              <div className="qty">
                <button onClick={() => cart.setQty(key, item.qty - 1)}>−</button>
                <span>{item.qty}</span>
                <button onClick={() => cart.setQty(key, item.qty + 1)}>+</button>
              </div>
            </div>

            <div className="cart-item-right">
              <button className="x" onClick={() => cart.remove(key)}>
                ×
              </button>
              <strong style={{ fontSize: 14 }}>{money(item.price * item.qty, currency)}</strong>
            </div>
          </div>
        );
      })}

      {/* ---- Upsell ---- */}
      {upsell && (
        <div className="upsell">
          <Img src={upsell.images?.[0]} alt="" />
          <p>{t('upsellQuestion', pick(upsell, 'name', lang), money(upsell.price, currency))}</p>
          <div className={`switch ${upsellInCart ? 'on' : ''}`} onClick={toggleUpsell} />
        </div>
      )}

      {/* ---- Promokod ---- */}
      <div className="promo-row">
        <input
          value={promoInput}
          onChange={(e) => setPromoInput(e.target.value)}
          placeholder={t('promoPlaceholder')}
        />
        <button className="btn btn-ghost btn-sm" onClick={applyPromo}>
          {t('apply')}
        </button>
      </div>
      {promo && (
        <div className="promo-ok">
          ✓ {promo.code} — {money(promo.discount, currency)}
        </div>
      )}
      {promoError && <div className="promo-err">{promoError}</div>}

      {/* ---- Jami ---- */}
      <div className="totals">
        <div className="total-row">
          <span>{t('subtotal')}</span>
          <span>{money(subtotal, currency)}</span>
        </div>
        {discount > 0 && (
          <div className="total-row" style={{ color: 'var(--danger)' }}>
            <span>{t('discount')}</span>
            <span>−{money(discount, currency)}</span>
          </div>
        )}
        <div className="total-row">
          <span>{t('delivery')}</span>
          <span>{deliveryFee === 0 ? t('free') : money(deliveryFee, currency)}</span>
        </div>
        <div className="total-row">
          <span>{t('total')}</span>
          <span>{money(total, currency)}</span>
        </div>
      </div>

      {remainingForFree > 0 && (
        <p className="muted" style={{ fontSize: 12.5, marginTop: 8, textAlign: 'center' }}>
          🚚 {t('freeDeliveryHint', money(settings.freeDeliveryFrom, currency))}
        </p>
      )}

      {/* ---- Ma'lumotlar ---- */}
      <div className="section">
        <div className="section-title">{t('yourData')}</div>

        <div className="field">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('name')} />
        </div>
        <div className="field">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('phone')}
            inputMode="tel"
          />
        </div>
        <div className="field">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t('addressPlaceholder')}
          />
        </div>
        <div className="field">
          <button
            className={`btn ${coords ? 'btn-ghost' : 'btn-outline'}`}
            onClick={getLocation}
            disabled={locating || waitingChat}
          >
            {locating
              ? t('locationSearching')
              : waitingChat
                ? t('locationWaitingChat')
                : coords
                  ? t('locationSaved')
                  : t('sendLocation')}
          </button>

          {coords && (
            <p className="hint" style={{ marginTop: 6 }}>
              {t('locationHint')}
            </p>
          )}

          {waitingChat && (
            <div className="loc-note">
              <p>{t('locationCheckChat')}</p>
              <p className="hint">{t('locationCheckChatHint')}</p>
            </div>
          )}

          {!coords && !waitingChat && locationIssue && (
            <div className="loc-note">
              <p>{t(`locReason_${locationIssue}`)}</p>
              {canOpenSettings ? (
                <button type="button" className="btn btn-outline btn-sm" onClick={openSettings}>
                  {t('locationAllow')}
                </button>
              ) : (
                <p className="hint">{t('locationLater')}</p>
              )}
            </div>
          )}
        </div>
        <div className="field">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('commentPlaceholder')}
          />
        </div>
      </div>

      {/* ---- To'lov ---- */}
      <div className="section">
        <div className="section-title">{t('paymentMethod')}</div>
        <div className="pay-options">
          {payOptions.map((opt) => (
            <button
              key={opt.key}
              className={`pay-opt ${payment === opt.key ? 'active' : ''}`}
              disabled={!opt.enabled}
              onClick={() => {
                haptic('light');
                setPayment(opt.key);
              }}
            >
              <span className="radio" />
              <span>{opt.ico}</span>
              <span>
                {opt.label}
                {!opt.enabled && <span className="muted"> ({t('soon')})</span>}
              </span>
            </button>
          ))}
        </div>

        {payment === 'CARD_TRANSFER' && settings.card?.number && (
          <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>
            💳 {settings.card.number} · {settings.card.holder}
            <br />
            Buyurtmadan keyin botga chek rasmini yuboring.
          </p>
        )}
      </div>

      {error && (
        <p className="promo-err" style={{ textAlign: 'center', marginTop: 14 }}>
          {error}
        </p>
      )}

      <div className="sticky-cta">
        <button className="btn" disabled={sending} onClick={submit}>
          {sending ? t('sending') : `${t('confirmOrder')} — ${money(total, currency)}`}
        </button>
      </div>
    </div>
  );
}
