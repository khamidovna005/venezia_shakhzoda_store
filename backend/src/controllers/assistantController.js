import ai from '../core/ai.js';
import ProductModel from '../models/Product.js';
import SettingModel from '../models/Setting.js';
import { formatMoney } from '../utils/helpers.js';

/**
 * Botdagi AI sotuvchi.
 *
 * Mijoz oddiy til bilan nima izlayotganini yozadi ("40-razmer qora ko'ylak
 * 300 mingacha"), AI katalogdan mos mahsulotlarni tanlab tavsiya qiladi.
 */

const SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string', description: "Mijozga javob, 1-3 gap, do'stona" },
    productIds: {
      type: 'array',
      items: { type: 'integer' },
      description: 'Eng mos 0-3 ta mahsulot id. Mos narsa bo\'lmasa bo\'sh ro\'yxat',
    },
  },
  required: ['reply', 'productIds'],
  additionalProperties: false,
};

const SYSTEM = `Sen kiyim do'konining yordamchisisan. Mijozga kerakli kiyimni topishga yordam berasan.

Qoidalar:
- Faqat berilgan katalogdagi mahsulotlarni tavsiya qil. Katalogda yo'q narsani o'ylab topma.
- Mos narsa bo'lmasa — buni ochiq ayt va nima borligini qisqacha eslatib o't.
- Mijoz qaysi tilda yozsa, o'sha tilda javob ber (o'zbekcha yoki ruscha).
- Qisqa yoz: 1-3 gap. Narxlarni takrorlama — ular tugmalarda ko'rinadi.
- Do'kon ishi (yetkazib berish, to'lov, buyurtma holati) haqida so'rasa, /help ga yo'naltir.`;

/** Katalogni AI o'qiy oladigan ixcham matnga aylantiradi */
function buildCatalog(products, currency) {
  return products
    .map((p) => {
      const sizes = [...new Set(p.variants.filter((v) => v.stock > 0).map((v) => v.size))];
      const colors = [...new Set(p.variants.filter((v) => v.stock > 0).map((v) => v.colorUz))];
      if (!sizes.length) return null; // omborda yo'q — tavsiya qilinmaydi

      return [
        `id:${p.id}`,
        p.nameUz,
        `narx:${formatMoney(p.price, currency)}`,
        `kategoriya:${p.category?.nameUz ?? '-'}`,
        `o'lchamlar:${sizes.join('/')}`,
        `ranglar:${colors.join('/')}`,
      ].join(' | ');
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Mijoz savoliga javob tayyorlaydi.
 * Qaytadi: `{ reply, products }` yoki AI yoqilmagan bo'lsa `null`.
 */
export async function answer(question) {
  if (!ai.isEnabled()) return null;

  const [products, currency] = await Promise.all([
    ProductModel.listForClient({}),
    SettingModel.get('currency'),
  ]);

  const catalog = buildCatalog(products, currency);
  if (!catalog) return null; // katalog bo'sh — javob berishga asos yo'q

  const result = await ai.askJson({
    system: SYSTEM,
    maxTokens: 1500,
    content: `Katalog:\n${catalog}\n\nMijoz savoli:\n${question}`,
    schema: SCHEMA,
  });

  // AI o'ylab topgan id'larni chiqarib tashlaymiz — faqat haqiqiylari qoladi
  const byId = new Map(products.map((p) => [p.id, p]));
  const matched = (result.productIds || []).map((id) => byId.get(id)).filter(Boolean).slice(0, 3);

  return { reply: result.reply, products: matched, currency };
}

export default { answer };
