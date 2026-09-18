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

/**
 * Mijozning joylashuvini so'raydi.
 *
 * Telegram ichida brauzerning `navigator.geolocation` funksiyasi ko'pincha
 * bloklanadi — ayniqsa iPhone'da. Shuning uchun avval Telegram'ning o'z
 * LocationManager'i sinaladi, u bo'lmasa brauzerникиga tushiladi.
 *
 * @returns {Promise<{lat:number, lng:number}>}
 */
export function requestLocation() {
  const lm = tg?.LocationManager;

  if (lm) {
    return new Promise((resolve, reject) => {
      const ask = () => {
        lm.getLocation((data) => {
          if (data?.latitude != null) {
            resolve({ lat: data.latitude, lng: data.longitude });
          } else {
            // Foydalanuvchi rad etgan yoki sozlamalarda o'chirilgan
            reject(new Error('DENIED'));
          }
        });
      };

      if (lm.isInited) ask();
      else lm.init(ask);
    });
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('UNSUPPORTED'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('DENIED')),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

/** Telegram sozlamalarini ochadi — lokatsiya rad etilgan bo'lsa kerak bo'ladi */
export function openLocationSettings() {
  tg?.LocationManager?.openSettings?.();
}

/**
 * Tashqi havolani ochadi (Payme / Click to'lov sahifasi).
 *
 * Telegram ichida `window.open` bloklanadi, shuning uchun uning o'z
 * `openLink` metodi ishlatiladi. Brauzerda test qilinganda esa odatdagi
 * yo'l bilan ochiladi.
 */
export function openExternal(url) {
  if (!url) return;
  if (tg?.openLink) tg.openLink(url);
  else window.open(url, '_blank', 'noopener');
}

/** Telegram'dan kelgan foydalanuvchi (brauzerda test qilganda null) */
export const tgUser = tg?.initDataUnsafe?.user ?? null;
