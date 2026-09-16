import { useState } from 'react';
import { imageUrl } from '../lib/api.js';

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400">
       <rect width="100%" height="100%" fill="#f2f2f4"/>
       <text x="50%" y="50%" font-size="46" text-anchor="middle" dy=".35em">👗</text>
     </svg>`,
  );

/** Rasm yuklanmasa chiroyli placeholder ko'rsatadi */
export default function Img({ src, alt = '', ...rest }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed || !src ? FALLBACK : imageUrl(src)}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
