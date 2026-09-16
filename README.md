# 🛍 Zukhra Boutique — Telegram Mini App kiyim do'koni

Uchta qismdan iborat loyiha:

| Papka | Nima | Port |
|---|---|---|
| `backend/` | Node.js — Telegram bot + API (Express + Prisma + PostgreSQL) | 5000 |
| `miniapp/` | Mijozlar uchun Telegram Mini App (React) | 5173 |
| `admin/` | Ma'murlar uchun Admin Panel (React) | 5174 |

---

## 1. Paketlarni o'rnatish

Uchta terminalda (yoki ketma-ket) bitta marta bajariladi:

```bash
cd ~/Desktop/firstBot/backend && npm install
cd ~/Desktop/firstBot/miniapp && npm install
cd ~/Desktop/firstBot/admin   && npm install
```

---

## 2. Bazani tayyorlash

```bash
cd ~/Desktop/firstBot/backend

npx prisma generate     # Prisma klientini yaratish
npx prisma db push      # Jadvallarni Neon bazasiga yozish
npm run db:seed         # 5 kategoriya, 12 mahsulot, 4 story, 2 promokod
```

> Bazani ko'z bilan ko'rish uchun: `npm run db:studio`
> Hammasini tozalab, qaytadan boshlash uchun: `npm run db:reset`

---

## 3. Localhost'da yurgizish

**3 ta alohida terminal oching** va har birida bittadan buyruq yozing:

```bash
# 1-terminal — Backend + Bot
cd ~/Desktop/firstBot/backend && npm run dev
```

```bash
# 2-terminal — Mini App
cd ~/Desktop/firstBot/miniapp && npm run dev
```

```bash
# 3-terminal — Admin Panel
cd ~/Desktop/firstBot/admin && npm run dev
```

Manzillar:
- Mini App (brauzerda test uchun): http://localhost:5173
- Admin Panel: http://localhost:5174

---

## 4. Admin Panelga kirish

http://localhost:5174 ni oching va login/parolni kiriting.

Standart qiymatlar:

```
Login:  admin
Parol:  admin123
```

**Parolni almashtirish:** `backend/.env` faylidagi shu qatorlarni tahrirlang va
backend terminalini `Ctrl+C` bilan to'xtatib, `npm run dev` ni qayta yozing:

```
ADMIN_LOGIN="admin"
ADMIN_PASSWORD="admin123"
```

> Sessiya 7 kun amal qiladi. Chiqish uchun chap pastdagi **🚪 Chiqish** tugmasi.

---

## 5. ngrok orqali Telegram'ga ulash

```bash
# 4-terminal
ngrok http 5173
```

ngrok bergan `https://....ngrok-free.app` manzilini oling va:

1. `backend/.env` ichida `MINIAPP_URL` ni shu manzilga almashtiring.
2. Backend'ni qayta ishga tushiring.
3. Telegram'da `@BotFather` → `/mybots` → botingiz → **Bot Settings** → **Menu Button** →
   **Configure Menu Button** → shu URL'ni yuboring.

> ⚠️ `/api` so'rovlari Vite proxy orqali backend'ga o'tadi (`miniapp/vite.config.js`),
> shuning uchun **faqat bitta** ngrok tunneli kerak.

---

## Nima ishlaydi

**Mini App:** onboarding · stories · katalog + qidiruv + filtr · o'lcham/rang tanlash ·
o'lchamlar jadvali · sevimlilar · savatcha · upsell · promokod · lokatsiya ·
4 xil to'lov · buyurtmalar tarixi · "yana buyurtma qilish" · UZ/RU

**Admin Panel:** statistika · buyurtmalar (holat o'zgartirish → mijozga botda xabar) ·
mahsulotlar CRUD (variantlar bilan) · kategoriyalar · promokodlar · mijozlar + xabar yuborish

**Bot:** `/start` `/help` `/lang` · telefon qabul qilish ·
buyurtma tasdiqi · to'lov cheki (rasm) qabul qilish

> ⚠️ Telegram "🛍 Do'konni ochish" tugmasiga **faqat https** manzil qo'ya oladi.
> ngrok ishga tushmagan bo'lsa bot tugmani ko'rsatmaydi va nima qilish kerakligini yozadi.
