import { useState } from 'react';

export default function Logo({ className = '', size = 'md' }) {
  const [failed, setFailed] = useState(false);
  const sizeClass = size === 'sm' ? 'h-8' : 'h-10';

  if (failed) {
    return (
      <span
        className={`inline-block text-2xl font-semibold tracking-tight text-ink ${className}`}
      >
        Kundenbuch
      </span>
    );
  }

  return (
    <img
      src="/logo-hintermair.jpg"
      alt="Mode Hintermair"
      onError={() => setFailed(true)}
      className={`${sizeClass} w-auto select-none ${className}`}
      draggable={false}
    />
  );
}
