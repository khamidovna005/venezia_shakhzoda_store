import { useRef, useState } from 'react';
import { api, imageUrl } from '../lib/api.js';
import { useLang } from '../lib/lang.jsx';

const MAX_SIDE = 1400; // px — bundan kattasi do'kon uchun keraksiz
const QUALITY = 0.82;

/**
 * Rasmni brauzerda kichraytirib, so'ng serverga yuboradi.
 * Shu sabab telefondan olingan 5 MB lik surat ~200 KB bo'lib ketadi —
 * yuklash tez, baza ham shishmaydi.
 */
function shrink(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    // Xato kodlari — matnga aylantirish chaqiruvchi tomonda bo'ladi,
    // chunki bu funksiya til kontekstidan tashqarida turadi.
    reader.onerror = () => reject(new Error('upReadError'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('upNotImage'));
      img.onload = () => {
        const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; // PNG shaffofligi qora bo'lib qolmasin
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL('image/jpeg', QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ImageUploader({ value, onChange }) {
  const { t } = useLang();
  const urls = value ? value.split('\n').map((s) => s.trim()).filter(Boolean) : [];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const update = (list) => onChange(list.join('\n'));

  async function handleFiles(files) {
    setError('');
    setBusy(true);
    const added = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const dataUrl = await shrink(file);
        const res = await api.upload(dataUrl);
        added.push(res.url);
      }
      if (added.length) update([...urls, ...added]);
    } catch (err) {
      // shrink() kalit qaytaradi, api esa tayyor matn — t() ikkalasini ham
      // to'g'ri ishlaydi, chunki topilmagan kalit o'zi qaytariladi.
      setError(err.message ? t(err.message) : t('upError'));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const move = (from, to) => {
    if (to < 0 || to >= urls.length) return;
    const next = [...urls];
    [next[from], next[to]] = [next[to], next[from]];
    update(next);
  };

  return (
    <div>
      <div className="uploader">
        {urls.map((url, i) => (
          <div className="uploader-item" key={url + i}>
            <img src={imageUrl(url)} alt="" />
            {i === 0 && <span className="uploader-main">{t('upMain')}</span>}
            <div className="uploader-actions">
              <button type="button" title={t('upLeft')} onClick={() => move(i, i - 1)} disabled={i === 0}>
                ←
              </button>
              <button
                type="button"
                title={t('remove')}
                onClick={() => update(urls.filter((_, j) => j !== i))}
              >
                ✕
              </button>
              <button
                type="button"
                title={t('upRight')}
                onClick={() => move(i, i + 1)}
                disabled={i === urls.length - 1}
              >
                →
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="uploader-add"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? <span className="spinner-sm" /> : <span className="plus">+</span>}
          <span>{busy ? t('loading') : t('upAdd')}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <div className="alert error" style={{ marginTop: 10 }}>{error}</div>}

      <p className="hint" style={{ marginTop: 8 }}>
        {t('upHint')}
      </p>
    </div>
  );
}
