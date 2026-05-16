import { useRef, useState } from 'react';
import { Camera, User } from 'lucide-react';
import { resizeImage } from '../utils/photo';

export default function PhotoButton({ value, onChange, size = 72 }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const data = await resizeImage(file, 700, 0.85);
      onChange(data);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="relative rounded-full overflow-hidden bg-surface ring-1 ring-black/10 flex items-center justify-center shrink-0 active:scale-95 transition-transform duration-200"
        style={{ width: size, height: size }}
        aria-label="Profilfoto ändern"
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <User size={size * 0.5} className="text-muted" strokeWidth={1.5} />
        )}
        <span className="absolute bottom-0 right-0 bg-gold text-black rounded-full p-1 shadow">
          <Camera size={Math.max(12, size * 0.18)} />
        </span>
        {busy && (
          <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs text-white">…</span>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handle}
        className="hidden"
      />
    </>
  );
}
