import { useEffect, useState } from 'react';
import Img from './Img.jsx';
import { pick } from '../lib/i18n.js';
import { haptic } from '../lib/telegram.js';

export function StoryBar({ stories, lang, onOpen }) {
  if (!stories?.length) return null;

  return (
    <div className="stories">
      {stories.map((story, index) => (
        <div
          key={story.id}
          className="story"
          onClick={() => {
            haptic('light');
            onOpen(index);
          }}
        >
          <div className="story-ring">
            <Img src={story.coverUrl} alt={pick(story, 'title', lang)} />
          </div>
          <span>{pick(story, 'title', lang)}</span>
        </div>
      ))}
    </div>
  );
}

export function StoryViewer({ stories, startIndex, lang, onClose }) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (index < stories.length - 1) setIndex(index + 1);
      else onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [index, stories.length, onClose]);

  const story = stories[index];

  const prev = () => (index > 0 ? setIndex(index - 1) : onClose());
  const next = () => (index < stories.length - 1 ? setIndex(index + 1) : onClose());

  return (
    <div className="story-viewer">
      <div className="story-bars">
        {stories.map((s, i) => (
          <div
            key={s.id}
            className={`story-bar ${i < index ? 'done' : ''} ${i === index ? 'active' : ''}`}
          >
            <i />
          </div>
        ))}
      </div>

      <div className="story-top">
        <span>{pick(story, 'title', lang)}</span>
        <button className="story-close" onClick={onClose}>
          ×
        </button>
      </div>

      <Img src={story.imageUrl} alt={pick(story, 'title', lang)} />

      <div className="story-tap" style={{ left: 0 }} onClick={prev} />
      <div className="story-tap" style={{ right: 0 }} onClick={next} />
    </div>
  );
}
