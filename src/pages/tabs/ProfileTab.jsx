import { useState, useEffect } from 'react';
import { updateCustomer } from '../../db/database';

const fields = [
  { key: 'vorname', label: 'Vorname', required: true, autoComplete: 'given-name' },
  { key: 'nachname', label: 'Nachname', required: true, autoComplete: 'family-name' },
  { key: 'telefon', label: 'Telefon', type: 'tel', placeholder: '+49 …', autoComplete: 'tel' },
  { key: 'email', label: 'E-Mail', type: 'email', autoComplete: 'email' },
  { key: 'strasse', label: 'Straße', autoComplete: 'street-address' },
  { key: 'plz', label: 'PLZ', autoComplete: 'postal-code', inputMode: 'numeric' },
  { key: 'ort', label: 'Ort', autoComplete: 'address-level2' },
  { key: 'geburtstag', label: 'Geburtstag', type: 'date' }
];

export default function ProfileTab({ customer }) {
  const [form, setForm] = useState(() => ({ ...customer }));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({ ...customer });
  }, [customer.id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const valid = (form.vorname || '').trim() && (form.nachname || '').trim();

  const save = async () => {
    if (!valid) return;
    await updateCustomer(customer.id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-3 pb-4">
      {fields.map((f) => (
        <label key={f.key} className="block">
          <span className="text-xs text-muted mb-1 block">
            {f.label}
            {f.required && ' *'}
          </span>
          <input
            type={f.type || 'text'}
            placeholder={f.placeholder}
            autoComplete={f.autoComplete}
            inputMode={f.inputMode}
            value={form[f.key] || ''}
            onChange={(e) => set(f.key, e.target.value)}
            className="w-full bg-surface rounded-lg px-3 py-2.5 outline-none ring-1 ring-brand/40 focus:ring-2 focus:ring-brand text-base text-left"
            style={{ colorScheme: 'light' }}
          />
        </label>
      ))}

      <button
        onClick={save}
        disabled={!valid}
        className="w-full bg-brand text-white font-medium py-3 rounded-lg disabled:opacity-40 active:scale-[0.98] transition-transform duration-200 mt-2"
      >
        {saved ? 'Gespeichert ✓' : 'Speichern'}
      </button>
      {!valid && (
        <p className="text-xs text-muted text-center">Vorname und Nachname sind Pflichtfelder.</p>
      )}
    </div>
  );
}
