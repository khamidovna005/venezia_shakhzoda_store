import ai from '../core/ai.js';
import ImageModel from '../models/Image.js';
import CategoryModel from '../models/Category.js';

/** AI imkoniyatlari yoqilganmi — admin panel shunga qarab tugmani ko'rsatadi */
export function status(_req, res) {
  res.json({ ok: true, enabled: ai.isEnabled() });
}

/* ------------------------------------------------------------------ */
/*  RASMDAN MAHSULOT KARTOCHKASI                                       */
/* ------------------------------------------------------------------ */

const PRODUCT_SCHEMA = {
  type: 'object',
  properties: {
    nameUz: { type: 'string', description: "O'zbekcha nom, 2-5 so'z" },
    nameRu: { type: 'string', description: 'Ruscha nom, 2-5 so\'z' },
    descUz: { type: 'string', description: "O'zbekcha tavsif, 1-2 gap" },
    descRu: { type: 'string', description: 'Ruscha tavsif, 1-2 gap' },
    featuresUz: { type: 'array', items: { type: 'string' }, description: "3-5 ta qisqa xususiyat" },
    featuresRu: { type: 'array', items: { type: 'string' }, description: '3-5 ta qisqa xususiyat' },
    materialUz: { type: 'string', description: "Taxminiy material, masalan: Paxta 100%" },
    materialRu: { type: 'string' },
    categorySlug: { type: 'string', description: 'Berilgan ro\'yxatdan eng mos slug' },
  },
  required: [
    'nameUz', 'nameRu', 'descUz', 'descRu',
    'featuresUz', 'featuresRu', 'materialUz', 'materialRu', 'categorySlug',
  ],
  additionalProperties: false,
};

const PRODUCT_SYSTEM = `Sen O'zbekistondagi kiyim do'koni uchun mahsulot kartochkasi yozasan.

Rasmga qarab kiyimni aniqlab, sotuvga tayyor matn yozasan:
- Nom qisqa va aniq bo'lsin (masalan "Klassik oq ko'ylak"), reklama shiori emas
- Tavsif 1-2 gap: nimaligi, nimaga mos kelishi
- Xususiyatlar — ko'rinib turgan faktlar (yoqa turi, yeng uzunligi, kesim)
- Material faqat taxmin; aniq bilmasang eng ehtimollisini yoz
- Ruscha matn o'zbekchaning tarjimasi bo'lsin, ma'nosi bir xil

Rasmda ko'rinmayotgan narsani o'ylab topma. Narx haqida hech narsa yozma.`;

export async function generateProduct(req, res, next) {
  try {
    if (!ai.isEnabled()) {
      return res.status(503).json({ ok: false, error: 'AI sozlanmagan — ANTHROPIC_API_KEY qo\'shing' });
    }

    const { imageUrl } = req.body || {};
    const id = String(imageUrl || '').match(/^\/api\/images\/([\w-]+)$/)?.[1];
    if (!id) {
      return res.status(400).json({ ok: false, error: 'Avval rasm yuklang' });
    }

    const image = await ImageModel.findById(id);
    if (!image) return res.status(404).json({ ok: false, error: 'Rasm topilmadi' });

    const categories = await CategoryModel.listActive();
    const categoryList = categories.map((c) => `${c.slug} — ${c.nameUz}`).join('\n');

    const result = await ai.askJson({
      system: PRODUCT_SYSTEM,
      maxTokens: 3000,
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: image.mimeType,
            data: Buffer.from(image.data).toString('base64'),
          },
        },
        {
          type: 'text',
          text: `Shu kiyim uchun kartochka yoz.\n\nMavjud kategoriyalar:\n${categoryList}`,
        },
      ],
      schema: PRODUCT_SCHEMA,
    });

    // Slug'ni haqiqiy kategoriya id'siga aylantiramiz
    const matched = categories.find((c) => c.slug === result.categorySlug);

    res.json({ ok: true, product: { ...result, categoryId: matched?.id ?? null } });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  TARJIMA                                                            */
/* ------------------------------------------------------------------ */

const TRANSLATE_SCHEMA = {
  type: 'object',
  properties: {
    nameRu: { type: 'string' },
    descRu: { type: 'string' },
    featuresRu: { type: 'array', items: { type: 'string' } },
    materialRu: { type: 'string' },
  },
  required: ['nameRu', 'descRu', 'featuresRu', 'materialRu'],
  additionalProperties: false,
};

export async function translate(req, res, next) {
  try {
    if (!ai.isEnabled()) {
      return res.status(503).json({ ok: false, error: 'AI sozlanmagan' });
    }

    const { nameUz = '', descUz = '', featuresUz = [], materialUz = '' } = req.body || {};
    if (!nameUz.trim()) {
      return res.status(400).json({ ok: false, error: 'Avval o\'zbekcha nomni yozing' });
    }

    const result = await ai.askJson({
      system:
        'Sen kiyim do\'koni matnlarini o\'zbekchadan ruschaga tarjima qilasan. ' +
        'Tarjima tabiiy bo\'lsin, so\'zma-so\'z emas. Bo\'sh maydonni bo\'sh qoldir.',
      maxTokens: 2000,
      content: JSON.stringify({ nameUz, descUz, featuresUz, materialUz }, null, 2),
      schema: TRANSLATE_SCHEMA,
    });

    res.json({ ok: true, translation: result });
  } catch (err) {
    next(err);
  }
}

export default { status, generateProduct, translate };
