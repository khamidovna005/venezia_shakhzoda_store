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
    brand: 'Aura Studio',
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
    brand: 'Aura Studio',
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
    brand: 'Aura Classic',
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
    brand: 'Nord Outwear',
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
    brand: 'Nord Outwear',
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
    brand: 'Aura Accessories',
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
    brand: 'Aura Accessories',
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

  /* ---------------- Ko‘ylaklar ---------------- */
  {
    slug: 'koylak',
    nameUz: 'Trikotaj ko‘ylak',
    nameRu: 'Трикотажное платье',
    descUz: 'Tanaga yopishib turmaydigan yumshoq trikotaj ko‘ylak. Kuz va bahor uchun qulay.',
    descRu: 'Мягкое трикотажное платье свободного кроя. Удобно осенью и весной.',
    featuresUz: ['Yumshoq trikotaj', 'Cho‘zilmaydi', 'Uzun yeng', 'Tizzadan past'],
    featuresRu: ['Мягкий трикотаж', 'Не растягивается', 'Длинный рукав', 'Ниже колена'],
    images: [img('1753192108753-81be0db2f7fe'), img('1671848633245-79cc98b0dbe8')],
    price: 289000,
    brand: 'Aura Studio',
    materialUz: 'Trikotaj',
    materialRu: 'Трикотаж',
    isNew: true,
    variants: makeVariants([GREY, BLACK, BEIGE]),
  },
  {
    slug: 'koylak',
    nameUz: 'Oqshom ko‘ylagi',
    nameRu: 'Вечернее платье',
    descUz: 'To‘y va tantanali kechalar uchun uzun ko‘ylak. Yengil astar bilan.',
    descRu: 'Длинное платье для свадеб и торжеств. С лёгкой подкладкой.',
    featuresUz: ['Uzun fason', 'Astarli', 'Yon tomonda yashirin zamok', 'Bayram uchun'],
    featuresRu: ['Длинный фасон', 'На подкладке', 'Скрытая молния сбоку', 'Для торжеств'],
    images: [img('1602010069450-0a62034f235c'), img('1599662875272-64de8289f6d8')],
    price: 620000,
    oldPrice: 750000,
    brand: 'Aura Studio',
    materialUz: 'Atlas aralashmasi',
    materialRu: 'Атласная смесь',
    isHit: true,
    variants: makeVariants([BLACK, RED], CLOTHING_SIZES, 5),
  },
  {
    slug: 'koylak',
    nameUz: 'Yozgi sarafan',
    nameRu: 'Летний сарафан',
    descUz: 'Yelkasi ochiq yengil sarafan. Dam olish va issiq kunlar uchun.',
    descRu: 'Лёгкий сарафан с открытыми плечами. Для отдыха и жарких дней.',
    featuresUz: ['100% paxta', 'Yelkasi ochiq', 'Cho‘ntakli', 'Yozgi kolleksiya'],
    featuresRu: ['100% хлопок', 'Открытые плечи', 'С карманами', 'Летняя коллекция'],
    images: [img('1619794724492-651397287d94'), img('1567401893414-76b7b1e5a7a5')],
    price: 215000,
    brand: 'Aura Studio',
    materialUz: 'Paxta',
    materialRu: 'Хлопок',
    variants: makeVariants([WHITE, BLUE, BEIGE]),
  },

  /* ---------------- Futbolkalar ---------------- */
  {
    slug: 'futbolka',
    nameUz: 'Oversize futbolka',
    nameRu: 'Оверсайз футболка',
    descUz: 'Keng fasondagi zich paxta futbolka. Kundalik kiyim uchun ideal.',
    descRu: 'Плотная хлопковая футболка свободного кроя. Идеальна на каждый день.',
    featuresUz: ['Zich paxta 220 g/m²', 'Oversize fason', 'Cho‘kmaydi', 'Uniseks'],
    featuresRu: ['Плотный хлопок 220 г/м²', 'Оверсайз', 'Не садится', 'Унисекс'],
    images: [img('1740711152088-88a009e877bb'), img('1621072156002-e2fccdc0b176')],
    price: 145000,
    brand: 'Basic Line',
    materialUz: 'Paxta',
    materialRu: 'Хлопок',
    isNew: true,
    variants: makeVariants([BLACK, WHITE, GREY], CLOTHING_SIZES, 14),
  },
  {
    slug: 'futbolka',
    nameUz: 'Trikotaj polo',
    nameRu: 'Трикотажное поло',
    descUz: 'Yoqali trikotaj polo. Ish va dam olish orasidagi oltin o‘rtalik.',
    descRu: 'Поло с воротником. Золотая середина между работой и отдыхом.',
    featuresUz: ['Pique to‘qima', 'Yoqali', 'Uch tugmali', 'Shaklini saqlaydi'],
    featuresRu: ['Ткань пике', 'С воротником', 'Три пуговицы', 'Держит форму'],
    images: [img('1642764873654-9eef0467b342'), img('1602810316693-3667c854239a')],
    price: 189000,
    oldPrice: 230000,
    brand: 'Basic Line',
    materialUz: 'Pique paxta',
    materialRu: 'Хлопок пике',
    variants: makeVariants([WHITE, BLUE, GREEN]),
  },
  {
    slug: 'futbolka',
    nameUz: 'Uzun yengli longsliv',
    nameRu: 'Лонгслив',
    descUz: 'Salqin kunlar uchun uzun yengli futbolka. Yakka o‘zi ham, ustidan ham kiyiladi.',
    descRu: 'Лонгслив для прохладных дней. Носится отдельно и под верх.',
    featuresUz: ['Uzun yeng', 'Yengil paxta', 'Yon choklari tekis', 'Kundalik fason'],
    featuresRu: ['Длинный рукав', 'Лёгкий хлопок', 'Ровные боковые швы', 'Повседневный крой'],
    images: [img('1594938291221-94f18cbb5660'), img('1607345366928-199ea26cfe3e')],
    price: 165000,
    brand: 'Basic Line',
    materialUz: 'Paxta',
    materialRu: 'Хлопок',
    variants: makeVariants([BLACK, GREY], CLOTHING_SIZES, 12),
  },

  /* ---------------- Shimlar ---------------- */
  {
    slug: 'shim',
    nameUz: 'To‘g‘ri kesim jinsi',
    nameRu: 'Прямые джинсы',
    descUz: 'Klassik to‘g‘ri kesim jinsi shim. Har qanday futbolka va ko‘ylakka mos.',
    descRu: 'Классические прямые джинсы. Подходят к любой футболке и рубашке.',
    featuresUz: ['Zich denim', 'To‘g‘ri kesim', 'Besh cho‘ntak', 'O‘rta bel'],
    featuresRu: ['Плотный деним', 'Прямой крой', 'Пять карманов', 'Средняя посадка'],
    images: [img('1602293589930-45aad59ba3ab'), img('1714143136372-ddaf8b606da7')],
    price: 320000,
    brand: 'Denim Co',
    materialUz: 'Denim',
    materialRu: 'Деним',
    isHit: true,
    variants: makeVariants([BLUE, BLACK], ['28', '30', '32', '34'], 9),
  },
  {
    slug: 'shim',
    nameUz: 'Ofis shimi',
    nameRu: 'Офисные брюки',
    descUz: 'Ofis va tadbirlar uchun tekis shim. Strelkasi yo‘qolmaydi.',
    descRu: 'Ровные брюки для офиса и мероприятий. Стрелки не теряются.',
    featuresUz: ['Kostyum matosi', 'Strelkali', 'Astarli bel', 'Dazmollash oson'],
    featuresRu: ['Костюмная ткань', 'Со стрелками', 'Подкладка на поясе', 'Легко гладить'],
    images: [img('1475178626620-a4d074967452'), img('1715758890151-2c15d5d482aa')],
    price: 385000,
    brand: 'Aura Classic',
    materialUz: 'Polyester aralashmasi',
    materialRu: 'Смесь полиэстера',
    variants: makeVariants([BLACK, GREY], ['28', '30', '32', '34'], 7),
  },
  {
    slug: 'shim',
    nameUz: 'Chino shim',
    nameRu: 'Брюки чинос',
    descUz: 'Jinsi bilan klassik shim orasidagi variant. Kundalik ham, ishga ham.',
    descRu: 'Вариант между джинсами и классикой. И на каждый день, и на работу.',
    featuresUz: ['Paxta + elastan', 'Yengil cho‘ziladi', 'To‘rt cho‘ntak', 'Ingichka kesim'],
    featuresRu: ['Хлопок + эластан', 'Слегка тянется', 'Четыре кармана', 'Зауженный крой'],
    images: [img('1727777840115-e173c91444e4'), img('1721637286605-ae9be19d681f')],
    price: 275000,
    oldPrice: 340000,
    brand: 'Basic Line',
    materialUz: 'Paxta + elastan',
    materialRu: 'Хлопок + эластан',
    variants: makeVariants([BEIGE, GREEN, BLACK], ['28', '30', '32', '34'], 8),
  },

  /* ---------------- Ustki kiyim ---------------- */
  {
    slug: 'ustki-kiyim',
    nameUz: 'Jun palto',
    nameRu: 'Шерстяное пальто',
    descUz: 'Uzun jun palto. Qishda iliq, ko‘rinishi esa klassik.',
    descRu: 'Длинное шерстяное пальто. Тепло зимой, вид классический.',
    featuresUz: ['Jun aralashmasi', 'To‘liq astarli', 'Uzun fason', 'Ichki cho‘ntak'],
    featuresRu: ['Смесь шерсти', 'Полная подкладка', 'Длинный фасон', 'Внутренний карман'],
    images: [img('1539533113208-f6df8cc8b543'), img('1608635680046-aebf91c1a9c8')],
    price: 890000,
    oldPrice: 1150000,
    brand: 'Nord Outwear',
    materialUz: 'Jun aralashmasi',
    materialRu: 'Смесь шерсти',
    isHit: true,
    variants: makeVariants([BEIGE, BLACK], CLOTHING_SIZES, 4),
  },
  {
    slug: 'ustki-kiyim',
    nameUz: 'Bomber kurtka',
    nameRu: 'Куртка-бомбер',
    descUz: 'Kuz uchun yengil bomber. Shamol o‘tkazmaydi, harakatni cheklamaydi.',
    descRu: 'Лёгкий бомбер на осень. Не продувается, не стесняет движений.',
    featuresUz: ['Shamol o‘tkazmaydi', 'Rezinkali yeng va bel', 'Ikki yon cho‘ntak', 'Yengil'],
    featuresRu: ['Ветрозащита', 'Резинка на манжетах и поясе', 'Два боковых кармана', 'Лёгкая'],
    images: [img('1594748504715-2e715b1034bf'), img('1551734412-cbc8e1904805')],
    price: 495000,
    brand: 'Nord Outwear',
    materialUz: 'Polyester',
    materialRu: 'Полиэстер',
    isNew: true,
    variants: makeVariants([BLACK, GREEN], CLOTHING_SIZES, 6),
  },

  /* ---------------- Aksessuarlar ---------------- */
  {
    slug: 'aksessuar',
    nameUz: 'Quti sumka',
    nameRu: 'Сумка-коробочка',
    descUz: 'Sun‘iy charmdan tikilgan quti shaklidagi sumka. Shaklini yo‘qotmaydi.',
    descRu: 'Сумка-коробочка из экокожи. Не теряет форму.',
    featuresUz: ['Sun‘iy charm', 'Uzunligi rostlanadi', 'Ichida cho‘ntak', '24 × 16 × 9 sm'],
    featuresRu: ['Экокожа', 'Регулируемый ремень', 'Внутренний карман', '24 × 16 × 9 см'],
    images: [img('1559563458-527698bf5295'), img('1597633125184-9fd7e54f0ff7')],
    price: 340000,
    brand: 'Aura Accessories',
    materialUz: 'Sun‘iy charm',
    materialRu: 'Экокожа',
    isNew: true,
    variants: makeVariants([BLACK, BEIGE, RED], ['ONE'], 10),
  },
  {
    slug: 'aksessuar',
    nameUz: 'Krossbodi sumka',
    nameRu: 'Сумка кроссбоди',
    descUz: 'Yelkadan osiladigan kichik sumka. Telefon, hamyon va kalitga yetadi.',
    descRu: 'Небольшая сумка через плечо. Хватает на телефон, кошелёк и ключи.',
    featuresUz: ['Yengil', 'Uzun tasma', 'Zamokli', '19 × 13 × 6 sm'],
    featuresRu: ['Лёгкая', 'Длинный ремень', 'На молнии', '19 × 13 × 6 см'],
    images: [img('1523779105320-d1cd346ff52b'), img('1574271143515-5cddf8da19be')],
    price: 185000,
    oldPrice: 240000,
    brand: 'Aura Accessories',
    materialUz: 'Sun‘iy charm',
    materialRu: 'Экокожа',
    variants: makeVariants([BLACK, GREY], ['ONE'], 12),
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
