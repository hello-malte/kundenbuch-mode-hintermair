import { useState, useRef } from 'react';
import { Share2 } from 'lucide-react';
import { sharePhoto } from '../utils/share';

export default function PhotoCarousel({ fotos, faded = false, shareTitle, shareText }) {
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState(false);

  const timerRef = useRef(null);
  const triggeredRef = useRef(false);
  const startRef = useRef(null);

  if (!fotos || fotos.length === 0) return null;

  const safeIdx = Math.min(idx, fotos.length - 1);

  const triggerShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await sharePhoto(fotos[safeIdx], {
        title: shareTitle,
        text: shareText,
        filename: `kundenbuch-foto-${Date.now()}.jpg`
      });
      if (res === 'unsupported') {
        setHint(true);
        setTimeout(() => setHint(false), 2200);
      }
    } finally {
      setBusy(false);
    }
  };

  const onTouchStart = (e) => {
    if (e.touches.length > 1) return;
    const t = e.touches[0];
    triggeredRef.current = false;
    startRef.current = { x: t.clientX, y: t.clientY };
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      triggeredRef.current = true;
      if (navigator.vibrate) navigator.vibrate(40);
      triggerShare();
    }, 550);
  };
  const onTouchMove = (e) => {
    if (!startRef.current) return;
    const t = e.touches[0];
    if (!t) return;
    const dx = t.clientX - startRef.current.x;
    const dy = t.clientY - startRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      clearTimeout(timerRef.current);
      startRef.current = null;
    }
  };
  const onTouchEnd = () => {
    clearTimeout(timerRef.current);
    startRef.current = null;
  };

  const onClickCapture = (e) => {
    if (triggeredRef.current) {
      e.preventDefault();
      e.stopPropagation();
      triggeredRef.current = false;
    }
  };

  const imgClass = `w-full h-full object-cover transition duration-500 ${
    faded ? 'grayscale opacity-60' : ''
  }`;

  return (
    <div
      className="relative aspect-square bg-black select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      onClickCapture={onClickCapture}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img
        src={fotos[safeIdx]}
        alt=""
        className={imgClass}
        draggable={false}
      />

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          triggerShare();
        }}
        className="absolute top-2 left-2 bg-black/55 text-white rounded-full p-2 active:opacity-80 transition-opacity"
        aria-label="Foto teilen"
      >
        <Share2 size={16} />
      </button>

      {fotos.length > 1 && (
        <>
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs rounded-full px-2 py-0.5">
            {safeIdx + 1}/{fotos.length}
          </div>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {fotos.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i === safeIdx ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            className="absolute left-0 top-0 bottom-0 w-1/3"
            aria-label="Vorheriges Foto"
          />
          <button
            type="button"
            onClick={() => setIdx((i) => Math.min(fotos.length - 1, i + 1))}
            className="absolute right-0 top-0 bottom-0 w-1/3"
            aria-label="Nächstes Foto"
          />
        </>
      )}

      {hint && (
        <div className="absolute inset-x-2 bottom-8 mx-auto max-w-xs bg-black/80 text-white text-xs text-center rounded-lg px-3 py-2">
          Teilen nicht verfügbar. Foto im Browser lange drücken &rarr; Sichern.
        </div>
      )}
    </div>
  );
}
