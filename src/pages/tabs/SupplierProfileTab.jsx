import { useState, useEffect } from 'react';
import { updateSupplier, SUPPLIER_KATEGORIEN } from '../../db/database';

const fields = [
  { key: 'lieferanten_name', label: 'Lieferant / Firma', required: true },
  { key: 'vorname', label: 'Vorname (Kontakt)', autoComplete: 'given-name' },
  { key: 'nachname', label: 'Nachname (Kontakt)', autoComplete: 'family-name' },
  { key: 'mobil', label: 'Mobil', type: 'tel', placeholder: '+49 …', autoComplete: 'tel' },
  { key: 'arbeit', label: 'Arbeit', type: 'tel', placeholder: '+49 …' },
  { key: 'email', label: 'E-Mail', type: 'email', autoComplete: 'email' },
  { key: 'strasse', label: 'Straße', autoComplete: 'street-address' },
  { key: 'plz', label: 'PLZ', autoComplete: 'postal-code', inputMode: 'numeric' },
  { key: 'ort', label: 'Ort', autoComplete: 'address-level2' }
];

export default function SupplierProfileTab({ supplier }) {
  const [form, setForm] = useState(() => ({ ...supplier }));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({ ...supplier });
  }, [supplier.id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleKategorie = (value) => {
    const current = form.kategorien || [];
    if (current.includes(value)) {
      set('kategorien', current.filter((v) => v !== value));
    } else {
      set('kategorien', [...current, value]);
    }
  };

  const valid = (form.lieferanten_name || '').trim().length > 0;

  const save = async () => {
    if (!valid) return;
    await updateSupplier(supplier.id, form);
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
          />
        </label>
      ))}

      <div className="block">
        <span className="text-xs text-muted mb-2 block">Kategorien</span>
        <div className="flex flex-wrap gap-2">
          {SUPPLIER_KATEGORIEN.map((k) => {
            const active = (form.kategorien || []).includes(k.value);
            return (
              <button
                key={k.value}
                type="button"
                onClick={() => toggleKategorie(k.value)}
                className={`px-3 py-2 rounded-full text-sm font-medium ring-1 transition-colors ${
                  active
                    ? 'bg-brand text-white ring-brand'
                    : 'bg-surface text-ink ring-brand/40 active:bg-surface2'
                }`}
              >
                {k.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={save}
        disabled={!valid}
        className="w-full bg-brand text-white font-medium py-3 rounded-lg disabled:opacity-40 active:scale-[0.98] transition-transform duration-200 mt-4"
      >
        {saved ? 'Gespeichert ✓' : 'Speichern'}
      </button>
      {!valid && (
        <p className="text-xs text-muted text-center">
          Lieferanten-Name ist Pflichtfeld.
        </p>
      )}
    </div>
  );
}
