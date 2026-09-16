import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

/* ------------------------------------------------------------------ */
/*  KATEGORIYALAR                                                      */
/* ------------------------------------------------------------------ */
const categories = [
  { slug: 'koylak', nameUz: "Ko'ylaklar", nameRu: 'Платья', emoji: '👗', sortOrder: 1 },
  { slug: 'futbolka', nameUz: 'Futbolkalar', nameRu: 'Футболки', emoji: '👕', sortOrder: 2 },
  { slug: 'shim', nameUz: 'Shimlar', nameRu: 'Брюки и джинсы', emoji: '👖', sortOrder: 3 },
  { slug: 'ustki-kiyim', nameUz: 'Ustki kiyim', nameRu: 'Верхняя одежда', emoji: '🧥', sortOrder: 4 },
  { slug: 'aksessuar', nameUz: 'Aksessuarlar', nameRu: 'Аксессуары', emoji: '👜', sortOrder: 5 },
];

/* ------------------------------------------------------------------ */
/*  MAHSULOTLAR                                                        */
/* ------------------------------------------------------------------ */
const CLOTHING_SIZES = ['S', 'M', 'L', 'XL'];

/** Har o'lcham uchun bir nechta rang varianti yaratadi */
const makeVariants = (colors, sizes = CLOTHING_SIZES, stock = 8) =>
  colors.flatMap((color) =>
    sizes.map((size) => ({
      size,
      colorUz: color.uz,
      colorRu: color.ru,
      colorHex: color.hex,
      stock: size === 'S' || size === 'XL' ? Math.max(2, stock - 4) : stock,
    })),
  );

const BLACK = { uz: 'Qora', ru: 'Чёрный', hex: '#111111' };
const WHITE = { uz: 'Oq', ru: 'Белый', hex: '#F5F5F5' };
const BEIGE = { uz: 'Bej', ru: 'Бежевый', hex: '#D8C3A5' };
const BLUE = { uz: "Ko'k", ru: 'Синий', hex: '#2C4A7C' };
const RED = { uz: 'Qizil', ru: 'Красный', hex: '#B4232A' };
const GREY = { uz: 'Kulrang', ru: 'Серый', hex: '#8A8A8A' };
const GREEN = { uz: 'Yashil', ru: 'Зелёный', hex: '#3F5E45' };

const products = [
  {
    slug: 'koylak',
    nameUz: 'Klassik midi ko‘ylak',
    nameRu: 'Классическое платье миди',
    descUz:
      'Har qanday vaziyatga mos keladigan sodda va nafis midi ko‘ylak. Nafas oladigan mato, qulay o‘tirish.',
    descRu:
      'Простое и элегантное платье миди для любого случая. Дышащая ткань, комфортная посадка.',
    featuresUz: ['100% viskoza', 'Midi uzunlik', 'Beli rezinkali', 'Mashinada yuvsa bo‘ladi', 'Astarli'],
    featuresRu: ['100% вискоза', 'Длина миди', 'Резинка на талии', 'Машинная стирка', 'На подкладке'],
    images: [img('1595777457583-95e059d581b8'), img('1572804013309-59a88b7e92f1')],
    price: 349000,
    oldPrice: 450000,
    brand: 'ZB Studio',
    materialUz: 'Viskoza',
    materialRu: 'Вискоза',
    isNew: true,
    isHit: true,
    variants: makeVariants([BLACK, BEIGE, RED]),
  },
  {
    slug: 'koylak',
    nameUz: 'Yozgi gulli ko‘ylak',
    nameRu: 'Летнее платье в цветок',
    descUz: 'Yengil yozgi ko‘ylak. Issiq kunlarda ham salqin his qilasiz.',
    descRu: 'Лёгкое летнее платье. Вы будете чувствовать прохладу даже в жару.',
    featuresUz: ['Yengil shtapel mato', 'Gulli naqsh', 'Qisqa yeng', 'Yozgi kolleksiya'],
    featuresRu: ['Лёгкий штапель', 'Цветочный принт', 'Короткий рукав', 'Летняя коллекция'],
    images: [img('1515372039744-b8f02a3ae446'), img('1503342217505-b0a15ec3261c')],
    price: 265000,
    oldPrice: 320000,
    brand: 'ZB Studio',
    materialUz: 'Shtapel',
    materialRu: 'Штапель',
    isNew: true,
    variants: makeVariants([WHITE, BLUE]),
  },
  {
    slug: 'futbolka',
    nameUz: 'Oversize oq futbolka',
    nameRu: 'Оверсайз белая футболка',
    descUz: 'Qalin, sifatli paxtadan tikilgan oversize futbolka. Har kuni kiyish uchun ideal.',
    descRu: 'Оверсайз-футболка из плотного качественного хлопка. Идеальна на каждый день.',
    featuresUz: ['100% paxta (240 g/m²)', 'Oversize kesim', 'Yoqasi cho‘zilmaydi', 'Unisex'],
    featuresRu: ['100% хлопок (240 г/м²)', 'Оверсайз крой', 'Ворот не растягивается', 'Унисекс'],
    images: [img('1521572163474-6864f9cf17ab'), img('1523381210434-271e8be1f52b')],
    price: 129000,
    oldPrice: 165000,
    brand: 'Basic Line',
    materialUz: 'Paxta',
    materialRu: 'Хлопок',
    isHit: true,
    variants: makeVariants([WHITE, BLACK, GREY], ['S', 'M', 'L', 'XL', 'XXL'], 15),
  },
  {
    slug: 'futbolka',
    nameUz: 'Polo futbolka',
    nameRu: 'Футболка поло',
    descUz: 'Yoqali klassik polo. Ish va dam olish uchun bir xil darajada mos.',
    descRu: 'Классическое поло с воротником. Одинаково подходит для работы и отдыха.',
    featuresUz: ['Pique paxta', 'Sadaf tugmalar', 'Yoqasi shakl saqlaydi', 'Slim fit'],
    featuresRu: ['Хлопок пике', 'Перламутровые пуговицы', 'Держит форму', 'Slim fit'],
    images: [img('1586790170083-2f9ceadc732d'), img('1596755094514-f87e34085b2c')],
    price: 179000,
    brand: 'Basic Line',
    materialUz: 'Pique paxta',
    materialRu: 'Хлопок пике',
    variants: makeVariants([BLUE, WHITE, GREEN]),
  },
  {
    slug: 'shim',
    nameUz: 'To‘q ko‘k slim jinsi',
    nameRu: 'Тёмно-синие джинсы slim',
    descUz: 'Cho‘ziluvchan denim. Kun bo‘yi qulay, shaklini yo‘qotmaydi.',
    descRu: 'Эластичный деним. Комфортно весь день, не теряет форму.',
    featuresUz: ['98% paxta, 2% elastan', 'Slim fit', '5 ta cho‘ntak', 'O‘rta bel'],
    featuresRu: ['98% хлопок, 2% эластан', 'Slim fit', '5 карманов', 'Средняя посадка'],
    images: [img('1542272604-787c3835535d'), img('1541099649105-f69ad21f3246')],
    price: 289000,
    oldPrice: 360000,
    brand: 'Denim Co',
    materialUz: 'Denim',
    materialRu: 'Деним',
    isHit: true,
    variants: makeVariants([BLUE, BLACK], ['28', '30', '32', '34', '36'], 10),
  },
  {
    slug: 'shim',
    nameUz: 'Klassik kostyum shim',
    nameRu: 'Классические брюки',
    descUz: 'Ofis uchun mukammal klassik shim. Strelkasi doim tekis turadi.',
    descRu: 'Идеальные классические брюки для офиса. Стрелки всегда ровные.',
    featuresUz: ['Kostyum mato', 'Strelkali', 'Astarli belbog‘', 'To‘g‘ri kesim'],
    featuresRu: ['Костюмная ткань', 'Со стрелками', 'Подкладка пояса', 'Прямой крой'],
    images: [img('1594633312681-425c7b97ccd1'), img('1473966968600-fa801b869a1a')],
    price: 239000,
    brand: 'ZB Classic',
    materialUz: 'Polyester aralashma',
    materialRu: 'Смесовый полиэстер',
    variants: makeVariants([BLACK, GREY], ['46', '48', '50', '52'], 6),
  },
  {
    slug: 'ustki-kiyim',
    nameUz: 'Bej trench palto',
    nameRu: 'Бежевый тренч',
    descUz: 'Kuz va bahor uchun klassik trench. Suv o‘tkazmaydigan mato.',
    descRu: 'Классический тренч для осени и весны. Водоотталкивающая ткань.',
    featuresUz: ['Suv o‘tkazmaydi', 'Belbog‘li', 'Ikki qator tugma', 'Uzun kesim'],
    featuresRu: ['Водоотталкивающий', 'С поясом', 'Двубортный', 'Удлинённый крой'],
    images: [img('1434389677669-e08b4cac3105'), img('1490481651871-ab68de25d43d')],
    price: 690000,
    oldPrice: 890000,
    brand: 'ZB Outwear',
    materialUz: 'Gabardin',
    materialRu: 'Габардин',
    isNew: true,
    variants: makeVariants([BEIGE, BLACK], ['S', 'M', 'L'], 5),
  },
  {
    slug: 'ustki-kiyim',
    nameUz: 'Kapyushonli hudi',
    nameRu: 'Худи с капюшоном',
    descUz: 'Ichi yumshoq flisli qalin hudi. Salqin kunlarda iliq tutadi.',
    descRu: 'Плотное худи с мягким флисом внутри. Согреет в прохладные дни.',
    featuresUz: ['Ichi fliс', 'Kenguru cho‘ntak', 'Ikki qatlamli kapyushon', 'Unisex'],
    featuresRu: ['Флис внутри', 'Карман-кенгуру', 'Двухслойный капюшон', 'Унисекс'],
    images: [img('1556905055-8f358a7a47b2'), img('1620799140408-edc6dcb6d633')],
    price: 249000,
    oldPrice: 310000,
    brand: 'Basic Line',
    materialUz: 'Paxta + polyester',
    materialRu: 'Хлопок + полиэстер',
    isHit: true,
    variants: makeVariants([BLACK, GREY, GREEN], ['S', 'M', 'L', 'XL'], 12),
  },
  {
    slug: 'ustki-kiyim',
    nameUz: 'Charm ko‘ylakcha (kurtka)',
    nameRu: 'Кожаная куртка',
    descUz: 'Sun’iy charmdan tikilgan yengil kurtka. Zamonaviy va qulay.',
    descRu: 'Лёгкая куртка из экокожи. Современно и удобно.',
    featuresUz: ['Eko-charm', 'Metall zamok', 'Ichi astarli', 'Qisqa kesim'],
    featuresRu: ['Экокожа', 'Металлическая молния', 'На подкладке', 'Укороченный крой'],
    images: [img('1551028719-00167b16eac5'), img('1520975954732-35dd22299614')],
    price: 549000,
    brand: 'ZB Outwear',
    materialUz: 'Eko-charm',
    materialRu: 'Экокожа',
    variants: makeVariants([BLACK], ['S', 'M', 'L', 'XL'], 7),
  },
  {
    slug: 'aksessuar',
    nameUz: 'Charm sumka',
    nameRu: 'Кожаная сумка',
    descUz: 'Kundalik foydalanish uchun ixcham sumka. Ichida bir nechta bo‘lma.',
    descRu: 'Компактная сумка на каждый день. Несколько отделений внутри.',
    featuresUz: ['Eko-charm', 'Uzunligi sozlanadi', '3 ta bo‘lma', 'Metall furnitura'],
    featuresRu: ['Экокожа', 'Регулируемый ремень', '3 отделения', 'Металлическая фурнитура'],
    images: [img('1584917865442-de89df76afd3'), img('1548036328-c9fa89d128fa')],
    price: 320000,
    oldPrice: 399000,
    brand: 'ZB Accessories',
    variants: makeVariants([BLACK, BEIGE], ['ONE'], 10),
  },
  {
    slug: 'aksessuar',
    nameUz: 'Trikotaj sharf',
    nameRu: 'Трикотажный шарф',
    descUz: 'Yumshoq va iliq sharf. Sovuq kunlarning eng yaxshi hamrohi.',
    descRu: 'Мягкий и тёплый шарф. Лучший спутник холодных дней.',
    featuresUz: ['Akril + jun', '180 × 30 sm', 'Terini qitiqlamaydi'],
    featuresRu: ['Акрил + шерсть', '180 × 30 см', 'Не колется'],
    images: [img('1520903920243-00d872a2d1c9'), img('1457545195570-67f207084966')],
    price: 89000,
    brand: 'ZB Accessories',
    variants: makeVariants([GREY, RED, BEIGE], ['ONE'], 20),
  },
  {
    slug: 'aksessuar',
    nameUz: 'Paxta paypoq (3 juft)',
    nameRu: 'Хлопковые носки (3 пары)',
    descUz: 'Nafas oladigan paxta paypoq. 3 juftlik to‘plam.',
    descRu: 'Дышащие хлопковые носки. Набор из 3 пар.',
    featuresUz: ['80% paxta', '3 juft', 'Rezinkasi qismaydi'],
    featuresRu: ['80% хлопок', '3 пары', 'Не давящая резинка'],
    images: [img('1586350977771-b3b0abd50c82')],
    price: 45000,
    brand: 'Basic Line',
    variants: makeVariants([WHITE, BLACK], ['36-40', '41-45'], 30),
  },
];

/* ------------------------------------------------------------------ */
/*  STORIES                                                            */
/* ------------------------------------------------------------------ */
const stories = [
  {
    titleUz: 'Yangi kolleksiya',
    titleRu: 'Новая коллекция',
    coverUrl: img('1490481651871-ab68de25d43d'),
    imageUrl: img('1490481651871-ab68de25d43d'),
    sortOrder: 1,
  },
  {
    titleUz: '-30% chegirma',
    titleRu: 'Скидка -30%',
    coverUrl: img('1483985988355-763728e1935b'),
    imageUrl: img('1483985988355-763728e1935b'),
    sortOrder: 2,
  },
  {
    titleUz: 'Kuz-qish',
    titleRu: 'Осень-зима',
    coverUrl: img('1434389677669-e08b4cac3105'),
    imageUrl: img('1434389677669-e08b4cac3105'),
    sortOrder: 3,
  },
  {
    titleUz: 'Bestsellerlar',
    titleRu: 'Бестселлеры',
    coverUrl: img('1445205170230-053b83016050'),
    imageUrl: img('1445205170230-053b83016050'),
    sortOrder: 4,
  },
];

/* ------------------------------------------------------------------ */
/*  PROMOKODLAR                                                        */
/* ------------------------------------------------------------------ */
const promos = [
  { code: 'SALOM10', type: 'PERCENT', value: 10, minTotal: 200000, usageLimit: 0 },
  { code: 'KUZ50', type: 'FIXED', value: 50000, minTotal: 400000, usageLimit: 100 },
];

/* ------------------------------------------------------------------ */
/*  ISHGA TUSHIRISH                                                    */
/* ------------------------------------------------------------------ */
async function main() {
  console.log('🌱 Seed boshlandi...');

  // --- Kategoriyalar ---
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
  console.log(`   ✅ ${categories.length} ta kategoriya`);

  const categoryMap = new Map(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id]),
  );

  // --- Mahsulotlar (nomi bo'yicha takrorlanmaydi) ---
  let created = 0;
  for (const { slug, variants, ...product } of products) {
    const exists = await prisma.product.findFirst({ where: { nameUz: product.nameUz } });
    if (exists) continue;

    await prisma.product.create({
      data: {
        ...product,
        categoryId: categoryMap.get(slug),
        variants: { create: variants },
      },
    });
    created += 1;
  }
  console.log(`   ✅ ${created} ta yangi mahsulot (jami: ${await prisma.product.count()})`);

  // --- Stories ---
  if ((await prisma.story.count()) === 0) {
    await prisma.story.createMany({ data: stories });
    console.log(`   ✅ ${stories.length} ta story`);
  }

  // --- Promokodlar ---
  for (const promo of promos) {
    await prisma.promo.upsert({
      where: { code: promo.code },
      update: {},
      create: promo,
    });
  }
  console.log(`   ✅ ${promos.length} ta promokod`);

  console.log('🎉 Seed tugadi!\n');
  console.log('   Promokodlar: SALOM10 (-10%), KUZ50 (-50 000)');
}

main()
  .catch((err) => {
    console.error('❌ Seed xatosi:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
