import { useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ value = [], onChange, placeholder = 'Hinzufügen …' }) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (!value.includes(v)) onChange([...value, v]);
    setInput('');
  };
  const remove = (t) => onChange(value.filter((x) => x !== t));

  return (
    <div className="bg-surface rounded-lg p-2 flex flex-wrap gap-1.5 min-h-[44px] ring-1 ring-brand/40">
      {value.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 bg-brand/10 text-brand rounded-full pl-3 pr-1 py-1 text-sm"
        >
          {t}
          <button
            type="button"
            onClick={() => remove(t)}
            className="p-0.5"
            aria-label={`${t} entfernen`}
          >
            <X size={14} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          } else if (e.key === 'Backspace' && !input && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={value.length ? '' : placeholder}
        className="flex-1 bg-transparent outline-none px-2 py-1 min-w-[120px] text-sm"
      />
    </div>
  );
}
