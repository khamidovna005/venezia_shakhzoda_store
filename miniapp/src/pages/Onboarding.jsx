import { useState } from 'react';
import { haptic } from '../lib/telegram.js';

const SLIDES = [
  { emoji: '🛍️', bg: '#FDF2F4', title: 'onb1Title', text: 'onb1Text' },
  { emoji: '📦', bg: '#F1F5FD', title: 'onb2Title', text: 'onb2Text' },
  { emoji: '⭐️', bg: '#FDF8EE', title: 'onb3Title', text: 'onb3Text' },
];

export default function Onboarding({ t, onFinish }) {
  const [step, setStep] = useState(0);
  const isLast = step === SLIDES.length - 1;
  const slide = SLIDES[step];

  const next = () => {
    haptic('light');
    if (isLast) onFinish();
    else setStep(step + 1);
  };

  return (
    <div className="onb">
      <button className="onb-skip" onClick={onFinish}>
        {t('skip')}
      </button>

      <div className="onb-art">
        <div className="onb-art-inner" style={{ background: slide.bg }} key={step}>
          {slide.emoji}
        </div>
      </div>

      <h2>{t(slide.title)}</h2>
      <p>{t(slide.text)}</p>

      <div className="dots">
        {SLIDES.map((_, i) => (
          <span key={i} className={`dot ${i === step ? 'active' : ''}`} />
        ))}
      </div>

      <button className="btn" onClick={next}>
        {isLast ? t('start') : t('next')}
      </button>
    </div>
  );
}
