import 'dotenv/config';

const int = (value, fallback) => {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isNaN(n) ? fallback : n;
};

const config = {
  port: int(process.env.PORT, 5000),

  // trim(): panelga qiymat ko'chirilganda oxiriga bo'sh joy yoki yangi qator
  // qo'shilib qolishi mumkin — bu imzo tekshiruvini jimgina buzadi.
  botToken: (process.env.BOT_TOKEN || '').trim(),
  databaseUrl: process.env.DATABASE_URL || '',

  admin: {
    login: process.env.ADMIN_LOGIN || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },

  miniAppUrl: (process.env.MINIAPP_URL || 'http://localhost:5173').replace(/\/$/, ''),
  adminPanelUrl: (process.env.ADMIN_PANEL_URL || 'http://localhost:5174').replace(/\/$/, ''),

  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  allowInsecureAuth: process.env.ALLOW_INSECURE_AUTH === 'true',

  shopName: process.env.SHOP_NAME || "Zukhra Boutique",
  currency: process.env.CURRENCY || "so'm",

  delivery: {
    fee: int(process.env.DELIVERY_FEE, 20000),
    freeFrom: int(process.env.FREE_DELIVERY_FROM, 500000),
  },

  payment: {
    cardNumber: process.env.CARD_NUMBER || '',
    cardHolder: process.env.CARD_HOLDER || '',
    payme: {
      merchantId: process.env.PAYME_MERCHANT_ID || '',
      key: process.env.PAYME_KEY || '',
      get enabled() {
        return Boolean(process.env.PAYME_MERCHANT_ID);
      },
    },
    click: {
      serviceId: process.env.CLICK_SERVICE_ID || '',
      merchantId: process.env.CLICK_MERCHANT_ID || '',
      secretKey: process.env.CLICK_SECRET_KEY || '',
      get enabled() {
        return Boolean(process.env.CLICK_SERVICE_ID);
      },
    },
  },
};

export default config;
