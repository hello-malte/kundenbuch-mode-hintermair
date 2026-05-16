import { useState } from 'react';

export default function Logo({ className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`text-2xl font-semibold tracking-tight text-ink ${className}`}>
        Kundenbuch
      </span>
    );
  }

  return (
    <img
      src="/logo-hintermair.jpg"
      alt="Mode Hintermair"
      onError={() => setFailed(true)}
      className={`h-10 w-auto select-none ${className}`}
      draggable={false}
    />
  );
}
