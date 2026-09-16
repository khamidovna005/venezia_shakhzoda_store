# 🚀 Render'ga Backend Deploy — to'liq qo'llanma

## 0. Nima kerak

- GitHub hisobi (bor ✅)
- Render hisobi — bepul, GitHub bilan kirasiz
- `backend/.env` fayli ochiq tursin — undan qiymatlarni ko'chirasiz

---

## 1. Ro'yxatdan o'tish

1. https://render.com ni oching
2. **Get Started** → **GitHub** bilan kiring
3. Render GitHub'ga ruxsat so'raydi → **Authorize Render**
4. Repozitoriy tanlash so'ralsa: `venezia_shakhzoda_store` ni belgilang

---

## 2. Web Service yaratish

1. Dashboard'da **+ New** → **Web Service**
2. Ro'yxatdan `venezia_shakhzoda_store` → **Connect**

Sozlamalar:

| Katak | Nima yoziladi |
|---|---|
| **Name** | `venezia-backend` |
| **Language** | `Node` |
| **Branch** | `main` |
| **Region** | `Frankfurt (EU Central)` — O'zbekistonga eng yaqini |
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npx prisma generate && npx prisma db push` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

> ⚠️ **Root Directory** ni `backend` deb yozishni unutmang — aks holda Render
> loyiha ildizida `package.json` topolmay xato beradi.

---

## 3. Environment Variables

Pastdagi **Environment Variables** bo'limida **+ Add Environment Variable** bosib,
har birini alohida qo'shasiz.

`backend/.env` faylini oching va qiymatlarni **tirnoqsiz** ko'chiring.
Masalan `.env` da `BOT_TOKEN="123:abc"` bo'lsa, Render'ga `123:abc` deb yoziladi.

### Majburiy

| Key | Value |
|---|---|
| `DATABASE_URL` | `.env` dan ko'chiring (Neon manzili) |
| `BOT_TOKEN` | `.env` dan ko'chiring (BotFather tokeni) |
| `ADMIN_LOGIN` | `admin` |
| `ADMIN_PASSWORD` | **Yangi kuchli parol o'ylang** (`admin123` emas!) |
| `JWT_SECRET` | Uzun tasodifiy matn — pastda qanday olish yozilgan |
| `ALLOW_INSECURE_AUTH` | `false` |
| `NODE_VERSION` | `20` |

### Do'kon sozlamalari

| Key | Value |
|---|---|
| `SHOP_NAME` | `Zukhra Boutique` |
| `DELIVERY_FEE` | `20000` |
| `FREE_DELIVERY_FROM` | `500000` |
| `CURRENCY` | `so'm` |
| `CARD_NUMBER` | Kartangiz raqami |
| `CARD_HOLDER` | Karta egasining ismi |

### Keyinroq qo'shiladi

Bularni **hozir bo'sh qoldiring** — Vercel deploy qilgandan keyin qo'shasiz:

| Key | Value |
|---|---|
| `MINIAPP_URL` | *(Vercel manzili — keyin)* |
| `ADMIN_PANEL_URL` | *(Vercel manzili — keyin)* |

---

### ❌ `PORT` ni QO'SHMANG

Render portni **o'zi beradi**. Qo'lda `PORT` yozsangiz, Render servisni
"ishga tushmadi" deb hisoblaydi va deploy muvaffaqiyatsiz bo'ladi.

Kodda `process.env.PORT` o'qiladi — Render bergani avtomatik ishlatiladi.

---

### 🔑 JWT_SECRET olish

Terminalda:

```bash
openssl rand -base64 32
```

Chiqqan matnni nusxalab `JWT_SECRET` ga qo'ying.

---

### 🔒 `ALLOW_INSECURE_AUTH` nega `false`?

`true` bo'lsa — **istalgan odam** Telegram'siz API'ga kirib, soxta mijoz
sifatida buyurtma bera oladi. Localhost'da test uchun qulay, internetda **xavfli**.

`false` qilinganda Mini App **faqat Telegram ichida** ochiladi — oddiy
brauzerda ochsangiz "Avtorizatsiya xatosi" chiqadi. Bu **normal**.

---

## 4. Deploy

**Deploy Web Service** tugmasini bosing.

Logs oynasida kuzatasiz — **3-5 daqiqa**. Muvaffaqiyatli bo'lsa:

```
🛍  Zukhra Boutique
🚀 Server:      http://localhost:10000
==> Your service is live 🎉
```

Yuqorida manzil chiqadi: `https://venezia-backend.onrender.com`

---

## 5. Tekshirish

Brauzerda oching:

```
https://venezia-backend.onrender.com/api/health
```

Javob shunday bo'lishi kerak:

```json
{"ok":true}
```

Chiqsa — **backend ishlayapti** ✅

---

## 6. Bazaga demo mahsulot qo'yish (ixtiyoriy)

Agar baza bo'sh bo'lsa, Render'da **Shell** bo'limini oching va yozing:

```bash
npm run db:seed
```

> Neon bazangizda mahsulotlar allaqachon bor — bu qadam kerak emas.

---

## ⚠️ MUHIM: Free tarifning cheklovi

Render'ning **bepul** tarifida servis **15 daqiqa** so'rov bo'lmasa **uxlab qoladi**.

Buning oqibati: **bot javob bermay qo'yadi.** Kimdir Mini App'ni ochganda
servis uyg'onadi, lekin bu **50 soniyagacha** vaqt oladi.

### Yechim 1 — bepul "uyg'otgich" (tavsiya)

1. https://uptimerobot.com da ro'yxatdan o'ting (bepul)
2. **+ Add New Monitor**
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `Venezia backend`
   - **URL:** `https://venezia-backend.onrender.com/api/health`
   - **Monitoring Interval:** `5 minutes`
3. **Create Monitor**

Endi har 5 daqiqada so'rov keladi va servis uxlamaydi.

> Bepul tarifda oyiga 750 soat bor — bitta servis uchun to'liq yetadi.

### Yechim 2 — pullik

Render **Starter** — oyiga $7. Hech qachon uxlamaydi.

---

## 7. Keyingi qadam

Backend manzili tayyor bo'lgach → [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)

Frontend'da `VITE_API_URL` ga shu manzilni yozasiz.

---

## 🆘 Xatolar

### `Could not find package.json`
**Root Directory** `backend` deb yozilmagan.

### `Environment variable not found: DATABASE_URL`
`DATABASE_URL` qo'shilmagan yoki tirnoq bilan ko'chirilgan.
Tirnoqlarni (`"`) olib tashlang.

### `Port scan timeout` / `No open ports detected`
Qo'lda `PORT` qo'shgansiz — uni **o'chiring**.

### `polling_error: 409 Conflict`
Bot ikki joyda ishlayapti. Kompyuteringizdagi backend terminalini
`Ctrl+C` bilan to'xtating — bitta vaqtda faqat bitta nusxa ishlashi kerak.

### Bot javob bermayapti
Free tarif uxlab qolgan. Yuqoridagi UptimeRobot yechimini qiling.

### `prisma db push` xato beradi
Neon bazasi uxlab qolgan bo'lishi mumkin — neon.tech'ga kirib
bazani uyg'oting, keyin Render'da **Manual Deploy** → **Deploy latest commit**.
