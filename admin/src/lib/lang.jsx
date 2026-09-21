import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createT } from './i18n.js';

const KEY = 'zb_admin_lang';
const LangContext = createContext(null);

function boshlangichTil() {
  const saqlangan = localStorage.getItem(KEY);
  if (saqlangan === 'uz' || saqlangan === 'ru') return saqlangan;
  // Birinchi kirishda brauzer tiliga qaraymiz: rus tilli bo'lsa — ruscha.
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'uz';
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(boshlangichTil);

  const setLang = useCallback((next) => {
    localStorage.setItem(KEY, next);
    setLangState(next);
  }, []);

  // <html lang> har doim tanlangan tilga mos tursin — brauzerning
  // "tarjima qilaymi?" taklifi va ekran o'quvchilari shunga qaraydi.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: createT(lang) }), [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang faqat LangProvider ichida ishlaydi');
  return ctx;
}
