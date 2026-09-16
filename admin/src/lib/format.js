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

export const STATUS = {
  NEW: { label: 'Yangi', cls: 'new' },
  CONFIRMED: { label: 'Tasdiqlandi', cls: 'confirmed' },
  SHIPPING: { label: "Yo'lda", cls: 'shipping' },
  DELIVERED: { label: 'Yetkazildi', cls: 'delivered' },
  CANCELLED: { label: 'Bekor qilindi', cls: 'cancelled' },
};

export const PAYMENT = {
  CASH: 'Naqd',
  CARD_TRANSFER: 'Karta',
  PAYME: 'Payme',
  CLICK: 'Click',
};

export const PAYMENT_STATUS = {
  PENDING: 'Kutilmoqda',
  PAID: "To'landi",
  FAILED: 'Muvaffaqiyatsiz',
};
