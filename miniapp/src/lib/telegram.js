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

/** Telegram'ning LocationManager'i orqali so'rash */
function viaTelegram(lm) {
  return new Promise((resolve, reject) => {
    const ask = () => {
      if (lm.isLocationAvailable === false) return reject(new Error('UNSUPPORTED'));
      lm.getLocation((data) => {
        if (data?.latitude != null) resolve({ lat: data.latitude, lng: data.longitude });
        else reject(new Error('DENIED'));
      });
    };

    try {
      if (lm.isInited) ask();
      else lm.init(ask);
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
export async function requestLocation() {
  const lm = tg?.LocationManager;
  // LocationManager Bot API 8.0 dan boshlab bor
  const supported = lm && (!tg.isVersionAtLeast || tg.isVersionAtLeast('8.0'));

  // Telegram ataylab rad etilganini faqat shu ikki belgi bilan bilish mumkin.
  // `getLocation` ning bo'sh javobi o'zi rad etish degani emas — Telegram
  // Desktop/Web'da u umuman qo'llab-quvvatlanmasligi ham mumkin.
  let ataylabRad = false;

  if (supported) {
    try {
      return await withTimeout(viaTelegram(lm), LOCATION_TIMEOUT, 'TIMEOUT');
    } catch (err) {
      ataylabRad =
        err.message === 'DENIED' && lm.isAccessRequested === true && lm.isAccessGranted === false;
      // Qolgan barcha hollarda brauzerni sinab ko'ramiz
    }
  }

  try {
    return await withTimeout(viaBrowser(), LOCATION_TIMEOUT + 1000, 'TIMEOUT');
  } catch (err) {
    // "Ruxsat berilmagan" degan xabarni faqat haqiqatan shunday bo'lsa chiqaramiz
    if (ataylabRad) throw new Error('DENIED');
    throw err;
  }
}

/** Telegram'dan kelgan foydalanuvchi (brauzerda test qilganda null) */
export const tgUser = tg?.initDataUnsafe?.user ?? null;
