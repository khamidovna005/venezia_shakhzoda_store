/**
 * Payme va Click uchun to'lov havolasini yasaydi.
 *
 * Bu yerda faqat mijozni to'lov sahifasiga olib boradigan manzil tuziladi.
 * To'lov haqiqatan o'tgan-o'tmaganini tasdiqlash (callback) alohida ish —
 * u merchant shartnomasi va maxfiy kalitni talab qiladi. Hozircha do'kon
 * egasi to'lovni Payme/Click ilovasida ko'rib, admin panelda "To'landi"
 * deb belgilaydi.
 */

/**
 * Payme checkout manzili.
 * Hujjat: developer.help.paycom.uz — GET usuli.
 *
 * Parametrlar `;` bilan ajratiladi va base64 ga o'giriladi:
 *   m  — merchant id
 *   ac — hisob maydonlari (bizda buyurtma raqami)
 *   a  — summa, TIYINDA (1 so'm = 100 tiyin)
 *   l  — til
 */
export function paymeUrl({ merchantId, orderNo, amount, lang = 'uz' }) {
  if (!merchantId || !orderNo || !(amount > 0)) return null;

  const params = [
    `m=${merchantId}`,
    `ac.order_id=${orderNo}`,
    `a=${Math.round(amount * 100)}`, // so'm -> tiyin
    `l=${lang === 'ru' ? 'ru' : 'uz'}`,
  ].join(';');

  return `https://checkout.paycom.uz/${Buffer.from(params, 'utf8').toString('base64')}`;
}

/**
 * Click to'lov havolasi.
 * Summa so'mda ketadi (Payme'dan farqli — tiyinga o'girilmaydi).
 */
export function clickUrl({ serviceId, merchantId, orderNo, amount }) {
  if (!serviceId || !merchantId || !orderNo || !(amount > 0)) return null;

  const query = new URLSearchParams({
    service_id: String(serviceId),
    merchant_id: String(merchantId),
    amount: String(amount),
    transaction_param: String(orderNo),
  });

  return `https://my.click.uz/services/pay?${query}`;
}

/**
 * Buyurtma va do'kon sozlamalariga qarab kerakli havolani tanlaydi.
 * Ulanmagan bo'lsa null qaytadi — chaqiruvchi shunga qarab ish ko'radi.
 */
export function paymentUrlFor({ method, shop, order, lang }) {
  if (method === 'PAYME') {
    return paymeUrl({
      merchantId: shop.paymeMerchantId,
      orderNo: order.orderNo,
      amount: order.total,
      lang,
    });
  }

  if (method === 'CLICK') {
    return clickUrl({
      serviceId: shop.clickServiceId,
      merchantId: shop.clickMerchantId,
      orderNo: order.orderNo,
      amount: order.total,
    });
  }

  return null;
}

export default { paymeUrl, clickUrl, paymentUrlFor };
