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
      () => reject(new Error('DENIED')),
      { enableHighAccuracy: true, timeout: LOCATION_TIMEOUT },
    );
  });
}

/**
 * Mijozning joylashuvini so'raydi.
 *
 * Telegram ichida brauzerning geolokatsiyasi ko'pincha bloklanadi, shuning
 * uchun avval Telegram'ning LocationManager'i sinaladi. Lekin uning
 * callback'i umuman chaqirilmasligi ham mumkin (eski mijoz versiyalarida) —
 * shuning uchun har bir bosqich vaqt chegarasiga o'ralgan. Aks holda tugma
 * "Aniqlanmoqda..." holatida abadiy qotib qoladi.
 *
 * @returns {Promise<{lat:number, lng:number}>}
 */
/**
 * Mijozning joylashuvini so'raydi.
 *
 * Hujjatdagi tartib: init() -> isLocationAvailable -> getLocation().
 * Telegram Desktop/Web'da LocationManager yo'q, shuning uchun brauzer
 * geolokatsiyasi zaxira sifatida sinaladi.
 *
 * Xato tashlamaydi — har doim tushunarli natija qaytaradi, shunda
 * interfeys nima ko'rsatishni aniq biladi va qotib qolmaydi.
 *
 * @returns {Promise<{ok:true, lat:number, lng:number}
 *                 | {ok:false, reason:'denied'|'unavailable'|'timeout'|'none', canAskAgain:boolean}>}
 */
export async function requestLocation() {
  const lm = tg?.LocationManager;

  if (lm) {
    await withTimeout(initManager(lm), 4000, 'TIMEOUT').catch(() => {});

    // Qurilmada lokatsiya umuman yo'q — so'rashdan foyda yo'q
    if (lm.isLocationAvailable === false) {
      return { ok: false, reason: 'unavailable', canAskAgain: false };
    }

    // Avval so'ralgan va rad etilgan — qayta so'rash oyna chiqarmaydi,
    // faqat sozlamalardan yoqish mumkin
    if (lm.isAccessRequested === true && lm.isAccessGranted === false) {
      return { ok: false, reason: 'denied', canAskAgain: true };
    }

    try {
      const point = await withTimeout(viaTelegram(lm), LOCATION_TIMEOUT, 'TIMEOUT');
      return { ok: true, ...point };
    } catch (err) {
      if (err.message === 'DENIED') {
        return { ok: false, reason: 'denied', canAskAgain: true };
      }
      // Javob bermadi — brauzerni sinaymiz
    }
  }

  try {
    const point = await withTimeout(viaBrowser(), LOCATION_TIMEOUT + 1000, 'TIMEOUT');
    return { ok: true, ...point };
  } catch (err) {
    if (err.message === 'UNSUPPORTED') {
      return { ok: false, reason: lm ? 'timeout' : 'none', canAskAgain: false };
    }
    return { ok: false, reason: err.message === 'DENIED' ? 'denied' : 'timeout', canAskAgain: Boolean(lm) };
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
