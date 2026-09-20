export const tg = window.Telegram?.WebApp ?? null;

export const isTelegram = Boolean(tg?.initData);

export function initTelegram() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  try {
    tg.setHeaderColor('#ffffff');
    tg.setBackgroundColor('#ffffff');
    tg.disableVerticalSwipes?.();
  } catch {
    /* eski Telegram versiyalari bu metodlarni bilmaydi */
  }
}

export function haptic(type = 'light') {
  try {
    if (type === 'success' || type === 'error' || type === 'warning') {
      tg?.HapticFeedback?.notificationOccurred(type);
    } else {
      tg?.HapticFeedback?.impactOccurred(type);
    }
  } catch {
    /* ignore */
  }
}

export function closeApp() {
  tg?.close();
}

const LOCATION_TIMEOUT = 8000;

/** Va'da belgilangan vaqtda tugamasa — majburan to'xtatamiz */
function withTimeout(promise, ms, reason) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(reason)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

/** LocationManager'ni tayyorlaydi (hujjat bo'yicha birinchi qadam) */
function initManager(lm) {
  return new Promise((resolve) => {
    if (lm.isInited) return resolve();
    try {
      lm.init(() => resolve());
    } catch {
      resolve(); // init yo'q bo'lsa ham keyingi qadamni sinaymiz
    }
  });
}

/** Telegram'ning LocationManager'i orqali so'rash */
function viaTelegram(lm) {
  return new Promise((resolve, reject) => {
    try {
      lm.getLocation((data) => {
        if (data?.latitude != null) resolve({ lat: data.latitude, lng: data.longitude });
        else reject(new Error('DENIED'));
      });
    } catch {
      reject(new Error('UNSUPPORTED'));
    }
  });
}

/** Brauzerning odatdagi geolokatsiyasi */
function viaBrowser() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('UNSUPPORTED'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        // 1 = ruxsat berilmadi, 2 = joy aniqlanmadi, 3 = vaqt tugadi.
        // Farqlash muhim: mijozga noto'g'ri sabab ko'rsatmaslik uchun.
        reject(new Error(err?.code === 1 ? 'DENIED' : 'TIMEOUT'));
      },
      { enableHighAccuracy: true, timeout: LOCATION_TIMEOUT },
    );
  });
}

/**
 * Mijozning joylashuvini ilova ichidan so'raydi.
 *
 * Ikkita mustaqil yo'l sinaladi va ikkalasi ham tugaguncha taslim
 * bo'linmaydi:
 *   1. Telegram LocationManager (Bot API 8.0+, telefonlarda)
 *   2. Brauzer geolokatsiyasi (Telegram Desktop'da ko'pincha shu ishlaydi)
 *
 * `isLocationAvailable === false` bo'lsa ham brauzer yo'li sinaladi —
 * bu bayroq faqat Telegram'ning o'z mexanizmi haqida gapiradi, brauzer
 * geolokatsiyasi esa undan mustaqil.
 *
 * Xato tashlamaydi: har doim tushunarli natija qaytaradi.
 *
 * @returns {Promise<{ok:true, lat:number, lng:number}
 *                 | {ok:false, reason:'denied'|'unavailable'|'timeout'|'none', canAskAgain:boolean}>}
 */
export async function requestLocation() {
  const lm = tg?.LocationManager;
  let radEtilgan = false;

  if (lm) {
    await withTimeout(initManager(lm), 2500, 'TIMEOUT').catch(() => {});

    // Avval so'ralgan va rad etilgan bo'lsa, qayta so'rov oynasi chiqmaydi.
    // Shunda Telegram yo'lini o'tkazib yuboramiz, lekin brauzerni baribir
    // sinaymiz — u alohida ruxsat so'rashi mumkin.
    radEtilgan = lm.isAccessRequested === true && lm.isAccessGranted === false;

    // Telegram o'zi "menda lokatsiya yo'q" desa, 8 soniya javobsiz kutmaymiz.
    // Bu bayroq faqat Telegram mexanizmiga tegishli — brauzer yo'li baribir
    // quyida sinaladi.
    const telegramSinaladi = lm.isLocationAvailable !== false && !radEtilgan;

    if (telegramSinaladi) {
      try {
        const point = await withTimeout(viaTelegram(lm), LOCATION_TIMEOUT, 'TIMEOUT');
        return { ok: true, ...point };
      } catch (err) {
        if (err.message === 'DENIED') radEtilgan = true;
      }
    }
  }

  // Brauzer yo'li — Telegram nima degan bo'lsa ham sinaymiz
  try {
    const point = await withTimeout(viaBrowser(), LOCATION_TIMEOUT + 1000, 'TIMEOUT');
    return { ok: true, ...point };
  } catch (err) {
    if (radEtilgan || err.message === 'DENIED') {
      return { ok: false, reason: 'denied', canAskAgain: Boolean(lm) };
    }
    if (err.message === 'UNSUPPORTED') {
      return { ok: false, reason: 'unavailable', canAskAgain: false };
    }
    return { ok: false, reason: 'timeout', canAskAgain: false };
  }
}

/**
 * Telegram'ning lokatsiya sozlamalarini ochadi.
 *
 * Hujjat: "faqat foydalanuvchi harakatiga javoban chaqirish mumkin".
 * Shuning uchun bu tugma bosilgan zahoti, `await` lardan OLDIN chaqiriladi.
 */
export function openLocationSettings() {
  try {
    tg?.LocationManager?.openSettings?.();
    return true;
  } catch {
    return false;
  }
}

/** Telegram'dan kelgan foydalanuvchi (brauzerda test qilganda null) */
export const tgUser = tg?.initDataUnsafe?.user ?? null;
