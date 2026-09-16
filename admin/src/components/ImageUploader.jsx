import { useRef, useState } from 'react';
import { api, imageUrl } from '../lib/api.js';

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
    reader.onerror = () => reject(new Error('Faylni o‘qib bo‘lmadi'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Bu fayl rasm emas'));
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
      setError(err.message || 'Yuklashda xatolik');
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
            {i === 0 && <span className="uploader-main">asosiy</span>}
            <div className="uploader-actions">
              <button type="button" title="Chapga" onClick={() => move(i, i - 1)} disabled={i === 0}>
                ←
              </button>
              <button
                type="button"
                title="O‘chirish"
                onClick={() => update(urls.filter((_, j) => j !== i))}
              >
                ✕
              </button>
              <button
                type="button"
                title="O‘ngga"
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
          <span>{busy ? 'Yuklanmoqda…' : 'Rasm qo‘shish'}</span>
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
        Kompyuter yoki telefondan tanlang. Birinchi rasm katalogda ko‘rinadi — tartibni
        ← → tugmalari bilan o‘zgartirasiz.
      </p>
    </div>
  );
}
