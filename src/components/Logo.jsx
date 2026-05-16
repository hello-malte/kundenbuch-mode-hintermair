import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ className = '', size = 'md' }) {
  const [failed, setFailed] = useState(false);
  const sizeClass = size === 'sm' ? 'h-8' : 'h-10';

  return (
    <Link
      to="/"
      className={`inline-block active:opacity-70 transition-opacity ${className}`}
      aria-label="Zur Startseite"
    >
      {failed ? (
        <span className="text-2xl font-semibold tracking-tight text-ink">
          Kundenbuch
        </span>
      ) : (
        <img
          src="/logo-hintermair.jpg"
          alt="Mode Hintermair"
          onError={() => setFailed(true)}
          className={`${sizeClass} w-auto select-none`}
          draggable={false}
        />
      )}
    </Link>
  );
}
