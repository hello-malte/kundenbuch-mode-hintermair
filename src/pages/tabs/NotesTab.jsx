import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { updateCustomer } from '../../db/database';
import TagInput from '../../components/TagInput';

export default function NotesTab({ customer }) {
  const [form, setForm] = useState(() => ({ ...customer }));
  const [savedFlash, setSavedFlash] = useState(false);
  const timeoutRef = useRef(null);
  const skipRef = useRef(true);

  useEffect(() => {
    setForm({ ...customer });
    skipRef.current = true;
  }, [customer.id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await updateCustomer(customer.id, {
        notizen_freitext: form.notizen_freitext || '',
        groesse_oberteil: form.groesse_oberteil || '',
        groesse_hose: form.groesse_hose || '',
        schuhgroesse: form.schuhgroesse || '',
        lieblingsmarken: form.lieblingsmarken || [],
        schnitte: form.schnitte || '',
        figur_hinweise: form.figur_hinweise || '',
        allergien: form.allergien || ''
      });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    }, 1000);
    return () => clearTimeout(timeoutRef.current);
  }, [
    form.notizen_freitext,
    form.groesse_oberteil,
    form.groesse_hose,
    form.schuhgroesse,
    form.lieblingsmarken,
    form.schnitte,
    form.figur_hinweise,
    form.allergien,
    customer.id
  ]);

  return (
    <div className="space-y-4 pb-4">
      <label className="block">
        <span className="text-xs text-muted mb-1 block">Freitext</span>
        <textarea
          value={form.notizen_freitext || ''}
          onChange={(e) => set('notizen_freitext', e.target.value)}
          rows={5}
          placeholder="Beliebige Notizen zum Kunden …"
          className="w-full bg-surface rounded-lg p-3 outline-none resize-y focus:ring-1 focus:ring-gold text-base"
        />
      </label>

      <div className="grid grid-cols-3 gap-2">
        {[
          ['groesse_oberteil', 'Oberteil'],
          ['groesse_hose', 'Hose/Rock'],
          ['schuhgroesse', 'Schuhe']
        ].map(([k, label]) => (
          <label key={k}>
            <span className="text-xs text-muted block mb-1">{label}</span>
            <input
              value={form[k] || ''}
              onChange={(e) => set(k, e.target.value)}
              className="w-full bg-surface rounded-lg px-2 py-2 outline-none text-center focus:ring-1 focus:ring-gold text-base"
            />
          </label>
        ))}
      </div>

      <label className="block">
        <span className="text-xs text-muted mb-1 block">Lieblings-Marken</span>
        <TagInput
          value={form.lieblingsmarken || []}
          onChange={(v) => set('lieblingsmarken', v)}
          placeholder="Marke + Enter"
        />
      </label>

      {[
        ['schnitte', 'Bevorzugte Schnitte / Passformen'],
        ['figur_hinweise', 'Figur-Hinweise / Besonderheiten'],
        ['allergien', 'Allergien / Materialunverträglichkeiten']
      ].map(([k, label]) => (
        <label key={k} className="block">
          <span className="text-xs text-muted mb-1 block">{label}</span>
          <textarea
            value={form[k] || ''}
            onChange={(e) => set(k, e.target.value)}
            rows={2}
            className="w-full bg-surface rounded-lg p-3 outline-none resize-none focus:ring-1 focus:ring-gold text-base"
          />
        </label>
      ))}

      <p className="text-xs text-muted text-center pt-1 flex items-center justify-center gap-1.5">
        {savedFlash ? (
          <>
            <Check size={12} className="text-gold" /> Gespeichert
          </>
        ) : (
          'Auto-Speichern aktiv'
        )}
      </p>
    </div>
  );
}
