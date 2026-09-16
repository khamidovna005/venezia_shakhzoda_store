/** 250000 -> "250 000 so'm" */
export function formatMoney(amount, currency = "so'm") {
  const n = Math.round(Number(amount) || 0);
  return `${n.toLocaleString('ru-RU').replace(/ /g, ' ')} ${currency}`.trim();
}

/** Takrorlanmas buyurtma raqami: LS-260915-8341 */
export function generateOrderNo() {
  const d = new Date();
  const ymd = [
    String(d.getFullYear()).slice(2),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LS-${ymd}-${rand}`;
}

/** Sanani o'qish uchun qulay ko'rinishga keltirish */
export function formatDate(date, lang = 'uz') {
  return new Date(date).toLocaleString(lang === 'ru' ? 'ru-RU' : 'ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** JSON javoblarda BigInt/Decimal muammosi bo'lmasligi uchun */
export function toPlain(value) {
  return JSON.parse(JSON.stringify(value, (_k, v) => (typeof v === 'bigint' ? Number(v) : v)));
}

/** So'rov parametrini butun songa aylantirish */
export function toInt(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}
