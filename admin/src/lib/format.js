export function money(amount, currency = "so'm") {
  return `${Math.round(Number(amount) || 0).toLocaleString('ru-RU').replace(/ /g, ' ')} ${currency}`;
}

export function date(value) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Holat nomlari i18n.js da (status_NEW, payment_CASH, payStatus_PENDING...).
// Bu yerda faqat tilga bog'liq bo'lmagan narsalar qoladi.

/** Buyurtma holatlari — tartibi ro'yxatda va tanlash oynasida shu bo'yicha */
export const STATUS_KEYS = ['NEW', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

/** Har bir holatning rang sinfi (styles.css dagi .badge.new, .badge.shipping...) */
export const STATUS_CLASS = {
  NEW: 'new',
  CONFIRMED: 'confirmed',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_KEYS = ['CASH', 'CARD_TRANSFER', 'PAYME', 'CLICK'];

export const PAYMENT_STATUS_KEYS = ['PENDING', 'PAID', 'FAILED'];
