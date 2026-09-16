# 🚀 Vercel'ga Frontend Deploy

## VARIANT 1: Browser (eng oson)

### Miniapp (Do'kon)

1. https://vercel.com/new ni oching
2. GitHub login qiling (GitHub integration bor)
3. **Import Git Repository:**
   - `Search your repositories` → `venezia_shakhzoda_store` tanlang
   - **Select**

4. **Configure Project:**
   - **Project Name:** `venezia-miniapp` (yoki istalgan)
   - **Framework Preset:** `Vite`
   - **Root Directory:** `miniapp` (chap tomon "Configure" bosing)

5. **Environment Variables** → **Add:**
   ```
   Key: VITE_API_URL
   Value: https://venezia-backend.onrender.com
   ```
   (Bu Render URL'i, keyinchalik bilan qo'shiladi)

6. **Deploy** bosing

⏳ 2-3 daqiqa — **Deployment Complete**

**Natija:** `https://venezia-miniapp.vercel.app` (yoki vercel o'zi nom beradi)

---

### Admin Panel

Xuddi shunday:

1. https://vercel.com/new
2. Repo: `venezia_shakhzoda_store`
3. **Framework:** `Vite`
4. **Root Directory:** `admin`
5. **Environment Variables:**
   ```
   VITE_API_URL=https://venezia-backend.onrender.com
   ```
6. **Deploy**

**Natija:** `https://venezia-admin.vercel.app` (yoki o'z nomi)

---

## VARIANT 2: Vercel CLI (Terminal'dan)

### 1. Vercel CLI o'rnatish

```bash
npm install -g vercel
```

### 2. Miniapp deploy qilish

```bash
cd ~/Desktop/firstBot/miniapp
vercel --prod
```

Savollar:
- **Set up and deploy?** → `Y`
- **Which scope?** → `Your account`
- **Link to existing project?** → `N`
- **Project name?** → `venezia-miniapp`
- **Modify settings?** → `N`

**Natija:** URL chiqadi

### 3. Admin Panel deploy qilish

```bash
cd ~/Desktop/firstBot/admin
vercel --prod
```

Xuddi shunday qadamlar...

### 4. Environment Variables qo'shish

```bash
vercel env add VITE_API_URL
# → https://venezia-backend.onrender.com
```

Har ikkala app uchun (miniapp va admin).

---

## ✅ Deploy bo'lgandan keyin

### 1. Render'da Backend o'rnatish

[RENDER_DEPLOY.md](RENDER_DEPLOY.md) faylini ko'ring — yuqoridagi qadamlarni bajaring.

Backend URL: `https://venezia-backend.onrender.com` (masalan)

### 2. Frontend'dagi API URL'ni yangilash

Vercel dashboard'da:

**venezia-miniapp** → **Settings** → **Environment Variables**
```
VITE_API_URL=https://venezia-backend.onrender.com
```

**venezia-admin** → **Settings** → **Environment Variables**
```
VITE_API_URL=https://venezia-backend.onrender.com
```

**Ikkalasining** **Deployments** → **Redeploy** bosing

### 3. Telegram Bot'da URL yangilash

@BotFather → `/mybots` → Botingiz → **Bot Settings** → **Menu Button**

```
https://venezia-miniapp.vercel.app
```

### 4. Test qilish

1. Telegram'da bot `/start` bosing
2. "🛍 Do'konni ochish" tugmasi chiqishi kerak
3. Admin Panel: https://venezia-admin.vercel.app
4. Login: `admin` / parol

---

## 🔧 Problemalar

### "VITE_API_URL undefined"
Vercel environment variables'ni qo'shdingizmi? Qa redeploy qiling.

### "Cannot connect to backend"
- Render URL to'g'rimi?
- Render backend deployed bo'lganimi?

### "Bot xatosi"
BotFather'da URL'ni yangilash kerakmi?

---

## 📊 Natijalari

| Komponenta | URL | Status |
|---|---|---|
| Mini App (Do'kon) | https://venezia-miniapp.vercel.app | ✅ |
| Admin Panel | https://venezia-admin.vercel.app | ✅ |
| Backend API | https://venezia-backend.onrender.com | ✅ |
| PostgreSQL | Neon.tech | ✅ |

Barcha bo'lim localhost'da qildik — endi world-wide!

---

## 💾 Kelajakda yangilanish

Backend yoki frontend'da code o'zgartirsa:

```bash
git add .
git commit -m "Yangilanish"
git push origin main
```

Vercel va Render avtomatik **redeploy** qiladi (GitHub'dan).

---

## 🆘 Qo'shimcha

- **Vercel Docs:** vercel.com/docs
- **Render Docs:** render.com/docs
- **Neon Docs:** neon.tech/docs
