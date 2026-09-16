const strings = {
  uz: {
    // Onboarding
    onb1Title: 'Sizga yangi kiyim kerakmi?',
    onb1Text: 'Eng so‘nggi kolleksiyalarni telefoningizdan tanlang va bir kunda qabul qiling.',
    onb2Title: 'Bu qanday ishlaydi?',
    onb2Text: 'Tanlang, o‘lchamni belgilang, buyurtma bering — qolganini biz qilamiz.',
    onb3Title: '10 000+ mijoz biz bilan',
    onb3Text: 'Original mahsulot, halol narx va 7 kun ichida almashtirish kafolati.',
    start: 'Boshlash',
    skip: 'O‘tkazib yuborish',
    next: 'Keyingi',

    // Navigatsiya
    home: 'Bosh sahifa',
    catalog: 'Katalog',
    cart: 'Savatcha',
    profile: 'Profil',

    // Home
    hello: 'Assalomu alaykum',
    welcomeText: 'Bugun o‘zingizga nimadir tanlaymizmi?',
    newOrder: 'Yangi buyurtma berish',
    heroSub: 'Yangi kolleksiya allaqachon saytda',
    hits: 'Eng ko‘p sotilganlar',
    newArrivals: 'Yangi kelganlar',
    seeAll: 'Hammasi',

    // Katalog
    all: 'Hammasi',
    search: 'Qidirish...',
    sortNew: 'Yangi',
    sortCheap: 'Arzon',
    sortExpensive: 'Qimmat',
    sortPopular: 'Ommabop',
    nothingFound: 'Hech narsa topilmadi',
    tryAnother: 'Boshqa so‘z bilan qidirib ko‘ring',

    // Mahsulot
    size: 'O‘lcham',
    color: 'Rang',
    sizeGuide: 'O‘lchamlar jadvali',
    composition: 'Tarkibi va xususiyatlari',
    addToCart: 'Savatchaga qo‘shish',
    outOfStock: 'Sotib bo‘lindi',
    chooseSize: 'O‘lchamni tanlang',
    left: 'qoldi',
    inStock: 'mavjud',

    // Savatcha
    cartEmpty: 'Savatchangiz bo‘sh',
    cartEmptyText: 'Katalogdan o‘zingizga yoqqan kiyimni tanlang',
    goToCatalog: 'Katalogga o‘tish',
    upsellQuestion: (name, price) => `Bunga qo‘shimcha ravishda ${name} ni atigi ${price} ga qo‘shasizmi?`,
    promoPlaceholder: 'Promokod',
    apply: 'Qo‘llash',
    subtotal: 'Mahsulotlar',
    discount: 'Chegirma',
    delivery: 'Yetkazib berish',
    free: 'Bepul',
    total: 'Jami',
    yourData: 'Ma‘lumotlaringiz',
    name: 'Ismingiz',
    phone: 'Telefon raqam',
    address: 'Yetkazib berish manzili',
    addressPlaceholder: 'Ko‘cha, uy, kvartira...',
    sendLocation: '📍 Lokatsiyani yuborish',
    locationSaved: '📍 Lokatsiya qo‘shildi',
    commentPlaceholder: 'Izoh (ixtiyoriy)',
    paymentMethod: 'To‘lov turi',
    cash: 'Naqd (kuryerga)',
    cardTransfer: 'Karta o‘tkazmasi',
    payme: 'Payme',
    click: 'Click',
    soon: 'tez kunda',
    confirmOrder: 'Buyurtmani tasdiqlash',
    sending: 'Yuborilmoqda...',
    freeDeliveryHint: (amount) => `${amount} dan yuqori buyurtmaga yetkazish bepul`,

    // Profil
    myOrders: '📜 Mening buyurtmalarim',
    favorites: '❤️ Sevimlilar',
    language: '🌐 Til',
    contact: '☎️ Aloqa',
    noOrders: 'Hali buyurtmalar yo‘q',
    noFavorites: 'Sevimlilar ro‘yxati bo‘sh',
    reorder: 'Yana shundan buyurtma qilish',
    orderAdded: 'Savatchaga qo‘shildi',
    back: 'Orqaga',

    // Holatlar
    NEW: 'Yangi',
    CONFIRMED: 'Tasdiqlandi',
    SHIPPING: 'Yo‘lda',
    DELIVERED: 'Yetkazildi',
    CANCELLED: 'Bekor qilindi',

    // Xabarlar
    orderSuccess: 'Buyurtmangiz qabul qilindi!',
    orderSuccessText: 'Botga xabar yubordik. Menejerimiz tez orada bog‘lanadi 👗',
    close: 'Yopish',
    loading: 'Yuklanmoqda...',
    errorTitle: 'Xatolik',
    retry: 'Qayta urinish',
    added: 'Qo‘shildi ✓',
  },

  ru: {
    onb1Title: 'Нужна новая одежда?',
    onb1Text: 'Выбирайте последние коллекции с телефона и получайте за один день.',
    onb2Title: 'Как это работает?',
    onb2Text: 'Выберите, укажите размер, оформите заказ — остальное сделаем мы.',
    onb3Title: '10 000+ клиентов с нами',
    onb3Text: 'Оригинал, честная цена и обмен в течение 7 дней.',
    start: 'Начать',
    skip: 'Пропустить',
    next: 'Далее',

    home: 'Главная',
    catalog: 'Каталог',
    cart: 'Корзина',
    profile: 'Профиль',

    hello: 'Здравствуйте',
    welcomeText: 'Подберём что-нибудь сегодня?',
    newOrder: 'Сделать заказ',
    heroSub: 'Новая коллекция уже в продаже',
    hits: 'Хиты продаж',
    newArrivals: 'Новинки',
    seeAll: 'Все',

    all: 'Все',
    search: 'Поиск...',
    sortNew: 'Новые',
    sortCheap: 'Дешевле',
    sortExpensive: 'Дороже',
    sortPopular: 'Популярные',
    nothingFound: 'Ничего не найдено',
    tryAnother: 'Попробуйте другой запрос',

    size: 'Размер',
    color: 'Цвет',
    sizeGuide: 'Таблица размеров',
    composition: 'Состав и особенности',
    addToCart: 'В корзину',
    outOfStock: 'Распродано',
    chooseSize: 'Выберите размер',
    left: 'осталось',
    inStock: 'в наличии',

    cartEmpty: 'Корзина пуста',
    cartEmptyText: 'Выберите понравившуюся вещь в каталоге',
    goToCatalog: 'В каталог',
    upsellQuestion: (name, price) => `Добавить ${name} всего за ${price}?`,
    promoPlaceholder: 'Промокод',
    apply: 'Применить',
    subtotal: 'Товары',
    discount: 'Скидка',
    delivery: 'Доставка',
    free: 'Бесплатно',
    total: 'Итого',
    yourData: 'Ваши данные',
    name: 'Ваше имя',
    phone: 'Номер телефона',
    address: 'Адрес доставки',
    addressPlaceholder: 'Улица, дом, квартира...',
    sendLocation: '📍 Отправить локацию',
    locationSaved: '📍 Локация добавлена',
    commentPlaceholder: 'Комментарий (необязательно)',
    paymentMethod: 'Способ оплаты',
    cash: 'Наличные (курьеру)',
    cardTransfer: 'Перевод на карту',
    payme: 'Payme',
    click: 'Click',
    soon: 'скоро',
    confirmOrder: 'Подтвердить заказ',
    sending: 'Отправляем...',
    freeDeliveryHint: (amount) => `Доставка бесплатно от ${amount}`,

    myOrders: '📜 Мои заказы',
    favorites: '❤️ Избранное',
    language: '🌐 Язык',
    contact: '☎️ Связаться',
    noOrders: 'Заказов пока нет',
    noFavorites: 'Список избранного пуст',
    reorder: 'Заказать снова',
    orderAdded: 'Добавлено в корзину',
    back: 'Назад',

    NEW: 'Новый',
    CONFIRMED: 'Подтверждён',
    SHIPPING: 'В пути',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменён',

    orderSuccess: 'Заказ принят!',
    orderSuccessText: 'Мы написали вам в бот. Менеджер скоро свяжется 👗',
    close: 'Закрыть',
    loading: 'Загрузка...',
    errorTitle: 'Ошибка',
    retry: 'Повторить',
    added: 'Добавлено ✓',
  },
};

export function createT(lang) {
  const pack = strings[lang] || strings.uz;
  return (key, ...args) => {
    const value = pack[key] ?? strings.uz[key] ?? key;
    return typeof value === 'function' ? value(...args) : value;
  };
}

/** Mahsulot nomi/tavsifini tanlangan tilda olish */
export function pick(obj, field, lang) {
  const suffix = lang === 'ru' ? 'Ru' : 'Uz';
  return obj?.[`${field}${suffix}`] ?? obj?.[`${field}Uz`] ?? '';
}

export function money(amount, currency = "so'm") {
  return `${Math.round(Number(amount) || 0).toLocaleString('ru-RU').replace(/ /g, ' ')} ${currency}`;
}

export default strings;
