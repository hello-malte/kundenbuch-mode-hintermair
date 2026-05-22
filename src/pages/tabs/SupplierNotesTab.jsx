import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { updateSupplier } from '../../db/database';

export default function SupplierNotesTab({ supplier }) {
  const [form, setForm] = useState(() => ({ ...supplier }));
  const [savedFlash, setSavedFlash] = useState(false);
  const timeoutRef = useRef(null);
  const skipRef = useRef(true);

  useEffect(() => {
    setForm({ ...supplier });
    skipRef.current = true;
  }, [supplier.id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await updateSupplier(supplier.id, {
        notizen_freitext: form.notizen_freitext || ''
      });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    }, 1000);
    return () => clearTimeout(timeoutRef.current);
  }, [form.notizen_freitext, supplier.id]);

  return (
    <div className="space-y-4 pb-4">
      <label className="block">
        <span className="text-xs text-muted mb-1 block">Notizen</span>
        <textarea
          value={form.notizen_freitext || ''}
          onChange={(e) => set('notizen_freitext', e.target.value)}
          rows={10}
          placeholder="Konditionen, Ansprechpartner, Eigenheiten …"
          className="w-full bg-surface rounded-lg p-3 outline-none resize-y ring-1 ring-brand/40 focus:ring-2 focus:ring-brand text-base"
        />
      </label>

      <p className="text-xs text-muted text-center pt-1 flex items-center justify-center gap-1.5">
        {savedFlash ? (
          <>
            <Check size={12} className="text-brand" /> Gespeichert
          </>
        ) : (
          'Auto-Speichern aktiv'
        )}
      </p>
    </div>
  );
}
