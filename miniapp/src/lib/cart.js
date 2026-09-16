import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'zb_cart_v1';

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

/** Bir xil mahsulot + o'lcham + rang = bitta qator */
const lineKey = (item) => `${item.productId}-${item.variantId ?? 'none'}`;

export function useCart() {
  const [items, setItems] = useState(read);

  useEffect(() => {
    write(items);
  }, [items]);

  const add = useCallback((item, qty = 1) => {
    setItems((prev) => {
      const key = lineKey(item);
      const existing = prev.find((i) => lineKey(i) === key);
      if (existing) {
        return prev.map((i) => (lineKey(i) === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const addMany = useCallback((newItems) => {
    setItems((prev) => {
      const map = new Map(prev.map((i) => [lineKey(i), { ...i }]));
      for (const item of newItems) {
        const key = lineKey(item);
        if (map.has(key)) map.get(key).qty += item.qty || 1;
        else map.set(key, { ...item, qty: item.qty || 1 });
      }
      return [...map.values()];
    });
  }, []);

  const setQty = useCallback((key, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => lineKey(i) !== key)
        : prev.map((i) => (lineKey(i) === key ? { ...i, qty } : i)),
    );
  }, []);

  const remove = useCallback((key) => {
    setItems((prev) => prev.filter((i) => lineKey(i) !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const has = useCallback((productId) => items.some((i) => i.productId === productId), [items]);

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return { items, add, addMany, setQty, remove, clear, has, count, subtotal, lineKey };
}

export { lineKey };
