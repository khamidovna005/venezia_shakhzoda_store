const dict = {
  uz: {
    welcome: (name, shop) =>
      `Assalomu alaykum, <b>${name}</b>! 👋\n\n<b>${shop}</b> — zamonaviy kiyimlar do'koniga xush kelibsiz.\n\nYozuv maydoni yonidagi ko'k <b>🛍 Do'kon</b> tugmasini bosing va xarid qilishni boshlang.`,
    openShop: '🛍 Do‘konni ochish',
    myOrders: '📜 Buyurtmalarim',
    sharePhone: '📞 Telefon raqamni yuborish',
    contactUs: '☎️ Biz bilan aloqa',
    help: 'ℹ️ Yordam',
    phoneSaved: (phone) =>
      `✅ Rahmat! Telefon raqamingiz saqlandi: <b>${phone}</b>\n\nEndi buyurtma berishingiz mumkin.`,
    phoneNeeded:
      'Buyurtma berish uchun telefon raqamingiz kerak. Pastdagi <b>📞 Telefon raqamni yuborish</b> tugmasini bosing.',
    orderAccepted: (orderNo) =>
      `🎉 <b>Buyurtmangiz muvaffaqiyatli qabul qilindi!</b>\n\nBuyurtma raqami: <code>${orderNo}</code>\n\nMenejerimiz tez orada siz bilan bog'lanadi 👗`,
    noOrders: "Sizda hali buyurtmalar yo'q. 🛍 Do‘konni ochib, birinchi xaridni qiling!",
    ordersTitle: '📜 <b>Sizning buyurtmalaringiz</b>',
    statusChanged: (orderNo, status) =>
      `🔔 <b>${orderNo}</b> raqamli buyurtmangiz holati o'zgardi:\n\n${status}`,
    askReceipt: (orderNo, card, holder, total) =>
      `💳 <b>To'lov uchun ma'lumot</b>\n\nBuyurtma: <code>${orderNo}</code>\nSumma: <b>${total}</b>\n\nKarta: <code>${card}</code>\nEgasi: <b>${holder}</b>\n\nPulni o'tkazgach, chek (skrinshot) rasmini shu yerga yuboring 📸`,
    askLocation:
      "📍 <b>Lokatsiyangizni yuborasizmi?</b>\n\nKuryer sizni tez va aniq topishi uchun kerak. Pastdagi tugmani bosing — bir soniyada yuboriladi.",
    shareLocation: '📍 Lokatsiyani yuborish',
    skipLocation: '⏭ Keyinroq',
    locationThanks: (orderNo) =>
      `✅ Rahmat! Lokatsiya <b>${orderNo}</b> raqamli buyurtmangizga qo‘shildi.\n\nKuryer sizni xaritadan topadi 🚚`,
    askLocationNow:
      "📍 <b>Lokatsiyani yuboring</b>\n\nPastdagi tugmani bosing — keyin do‘kon oynasiga qayting, lokatsiya avtomatik qo‘shiladi.",
    locationSavedBackToApp:
      '✅ Lokatsiya qabul qilindi!\n\nEndi do‘kon oynasiga qayting — u yerda avtomatik qo‘shiladi.',
    locationSkipped: 'Yaxshi. Manzil bo‘yicha yetkazamiz — kerak bo‘lsa menejer qo‘ng‘iroq qiladi.',
    receiptSaved:
      '✅ Chek qabul qilindi. Menejerimiz to‘lovni tekshirib, buyurtmani tasdiqlaydi.',
    receiptNoOrder:
      "Hozircha to'lov kutilayotgan buyurtmangiz yo'q. Avval buyurtma bering.",
    contactInfo: (shop) =>
      `☎️ <b>${shop}</b>\n\nTelefon: +998 90 123 45 67\nIsh vaqti: 09:00 — 21:00\nManzil: Toshkent sh.\n\nSavollaringiz bo'lsa yozing — javob beramiz!`,
    helpText:
      "🛍 <b>Qanday buyurtma beraman?</b>\n\n1. <b>Do‘konni ochish</b> tugmasini bosing\n2. Kiyimni tanlang, o'lcham va rangni belgilang\n3. Savatchaga qo'shing\n4. <b>Buyurtmani tasdiqlash</b> tugmasini bosing\n\nTayyor! Menejer siz bilan bog'lanadi.",
    langChanged: '✅ Til o‘zgartirildi: <b>O‘zbekcha</b>',
  },
  ru: {
    welcome: (name, shop) =>
      `Здравствуйте, <b>${name}</b>! 👋\n\n<b>${shop}</b> — добро пожаловать в магазин современной одежды.\n\nНажмите синюю кнопку <b>🛍 Do'kon</b> рядом с полем ввода и начните покупки.`,
    openShop: '🛍 Открыть магазин',
    myOrders: '📜 Мои заказы',
    sharePhone: '📞 Отправить номер телефона',
    contactUs: '☎️ Связаться с нами',
    help: 'ℹ️ Помощь',
    phoneSaved: (phone) =>
      `✅ Спасибо! Ваш номер сохранён: <b>${phone}</b>\n\nТеперь вы можете оформить заказ.`,
    phoneNeeded:
      'Для заказа нужен ваш номер телефона. Нажмите кнопку <b>📞 Отправить номер телефона</b>.',
    orderAccepted: (orderNo) =>
      `🎉 <b>Ваш заказ успешно принят!</b>\n\nНомер заказа: <code>${orderNo}</code>\n\nНаш менеджер скоро свяжется с вами 👗`,
    noOrders: 'У вас пока нет заказов. Откройте магазин и сделайте первую покупку!',
    ordersTitle: '📜 <b>Ваши заказы</b>',
    statusChanged: (orderNo, status) =>
      `🔔 Статус заказа <b>${orderNo}</b> изменён:\n\n${status}`,
    askReceipt: (orderNo, card, holder, total) =>
      `💳 <b>Информация для оплаты</b>\n\nЗаказ: <code>${orderNo}</code>\nСумма: <b>${total}</b>\n\nКарта: <code>${card}</code>\nВладелец: <b>${holder}</b>\n\nПосле перевода отправьте сюда скриншот чека 📸`,
    askLocation:
      '📍 <b>Отправите вашу локацию?</b>\n\nЭто нужно, чтобы курьер быстро вас нашёл. Нажмите кнопку ниже — отправится за секунду.',
    shareLocation: '📍 Отправить локацию',
    skipLocation: '⏭ Позже',
    locationThanks: (orderNo) =>
      `✅ Спасибо! Локация добавлена к заказу <b>${orderNo}</b>.\n\nКурьер найдёт вас по карте 🚚`,
    askLocationNow:
      '📍 <b>Отправьте локацию</b>\n\nНажмите кнопку ниже, затем вернитесь в магазин — локация добавится автоматически.',
    locationSavedBackToApp:
      '✅ Локация получена!\n\nВернитесь в окно магазина — она добавится автоматически.',
    locationSkipped: 'Хорошо. Доставим по адресу — при необходимости менеджер позвонит.',
    receiptSaved: '✅ Чек принят. Менеджер проверит оплату и подтвердит заказ.',
    receiptNoOrder: 'У вас нет заказов, ожидающих оплаты.',
    contactInfo: (shop) =>
      `☎️ <b>${shop}</b>\n\nТелефон: +998 90 123 45 67\nВремя работы: 09:00 — 21:00\nАдрес: г. Ташкент\n\nПишите — мы ответим!`,
    helpText:
      '🛍 <b>Как сделать заказ?</b>\n\n1. Нажмите <b>Открыть магазин</b>\n2. Выберите вещь, размер и цвет\n3. Добавьте в корзину\n4. Нажмите <b>Подтвердить заказ</b>\n\nГотово! Менеджер свяжется с вами.',
    langChanged: '✅ Язык изменён: <b>Русский</b>',
  },
};

export const ORDER_STATUS_LABELS = {
  uz: {
    NEW: '🆕 Yangi',
    CONFIRMED: '✅ Tasdiqlandi',
    SHIPPING: '🚚 Yo‘lda',
    DELIVERED: '📦 Yetkazildi',
    CANCELLED: '❌ Bekor qilindi',
  },
  ru: {
    NEW: '🆕 Новый',
    CONFIRMED: '✅ Подтверждён',
    SHIPPING: '🚚 В пути',
    DELIVERED: '📦 Доставлен',
    CANCELLED: '❌ Отменён',
  },
};

export function t(lang, key, ...args) {
  const pack = dict[lang] || dict.uz;
  const value = pack[key] ?? dict.uz[key];
  return typeof value === 'function' ? value(...args) : value;
}

export default t;
