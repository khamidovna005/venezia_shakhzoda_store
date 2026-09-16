# 🚀 Render'ga Backend Deploy

## 1. Render'da Web Service yaratish

1. **https://render.com/dashboard** ni oching (GitHub bilan kirish)
2. **+ New** → **Web Service**
3. GitHub repo select: `venezia_shakhzoda_store`
4. **Branch:** `main`

Quyidagi sozlamalar:

| Setting | Qiymat |
|---|---|
| **Name** | `venezia-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx prisma generate && npx prisma db push` |
| **Start Command** | `npm start` |
| **Plan** | `Free` (yoki Starter) |

---

## 2. Environment Variables

**Settings** → **Environment** → quyidagilarni qo'shing:

```env
DATABASE_URL="postgresql://[username]:[password]@[host]/[database]?sslmode=require"

BOT_TOKEN="YOUR_BOT_TOKEN_HERE"

ADMIN_LOGIN="admin"
ADMIN_PASSWORD="YOUR_SECURE_PASSWORD"

PORT=3000

MINIAPP_URL="https://miniapp-xxx.vercel.app"
ADMIN_PANEL_URL="https://admin-xxx.vercel.app"

JWT_SECRET="YOUR_LONG_RANDOM_SECRET_KEY"

ALLOW_INSECURE_AUTH="false"

SHOP_NAME="Zukhra Boutique"
DELIVERY_FEE=20000
FREE_DELIVERY_FROM=500000
CURRENCY="so'm"

CARD_NUMBER="8600 0000 0000 0000"
CARD_HOLDER="CARDHOLDER NAME"
```

> **DATABASE_URL:** Neon'dan qo'yish. Format:
> ```
> postgresql://username:password@host.neon.tech/neondb?sslmode=require
> ```

---

## 3. Deploy

1. Environment Variables qo'shib bo'lgach **Deploy** bosing
2. Logs'da tekshiring — 2-3 daqiqada tayyor

**Build xatolar bo'lsa:**
```
error: migrations don't match schema
```
→ `npm run db:push -- --force-reset` kerak (staging faqat)

---

## 4. Natijalari

Render beradi: `https://venezia-backend.onrender.com`

Tekshirish:
```bash
curl https://venezia-backend.onrender.com/health
```

> **⚠️ Free plan:** 15 daqiqada olib qo'yiladi agar so'rov bo'lmasa. 
> Bot ishlab turib o'tsa problem yo'q — har 15 min bot so'rov qiladi.

---

## 5. Vercel'dagi URLs'larni Render'ga qo'shish

Environment Variables'da quyidagilarni yangilang:

```env
MINIAPP_URL="https://miniapp-xxx.vercel.app"
ADMIN_PANEL_URL="https://admin-xxx.vercel.app"
```

Keyin Render'da **Redeploy** bosing.

---

## 6. Frontend'dagi API URL'ni yangilash

Vercel'dagi **Environment Variables**'da:

**miniapp .env:**
```
VITE_API_URL=https://venezia-backend.onrender.com
```

**admin .env:**
```
VITE_API_URL=https://venezia-backend.onrender.com
```

Keyin ikkalasini Vercel'da redeploy qiling.

---

## 🔐 Ma'lumot havfsizligi

1. **DATABASE_URL** — maxfiy, Neon'da oling
2. **BOT_TOKEN** — maxfiy, BotFather'dan
3. **JWT_SECRET** — kuchli kalit:
   ```bash
   openssl rand -base64 32
   ```
4. **ADMIN_PASSWORD** — yangi parol o'ylang

GitHub'ga **hech qachon** yubormang — `.env` `.gitignore`'da turibdi.

---

## 🧪 Test qilish

Backend tayyor bo'lgach:

1. Bot `/start` bosing → "Do'konni ochish" tugmasi chiqishi kerak
2. Mini App oching
3. Admin Panel login qiling
4. Bot'dan fotosuratli chek yuboring

**Problem bo'lsa:**
```bash
# Render logs'da tekshiring:
# Settings → Logs

# yoki local'da sinovdan o'tkazish:
MINIAPP_URL=https://xxx.vercel.app npm run dev
```
