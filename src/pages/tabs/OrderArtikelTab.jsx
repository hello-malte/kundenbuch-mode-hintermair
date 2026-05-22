import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, X, Check } from 'lucide-react';
import { updateOrderAppointment } from '../../db/database';
import { resizeMany } from '../../utils/photo';

const emptyArtikel = () => ({ fotos: [], notiz: '' });

export default function OrderArtikelTab({ appointment }) {
  const [artikel, setArtikel] = useState(
    appointment.artikel && appointment.artikel.length
      ? appointment.artikel.map((a) => ({ ...a }))
      : [emptyArtikel()]
  );
  const skipRef = useRef(true);
  const saveTimerRef = useRef(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setArtikel(
      appointment.artikel && appointment.artikel.length
        ? appointment.artikel.map((a) => ({ ...a }))
        : [emptyArtikel()]
    );
    skipRef.current = true;
  }, [appointment.id]);

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      await updateOrderAppointment(appointment.id, { artikel });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    }, 700);
    return () => clearTimeout(saveTimerRef.current);
  }, [artikel, appointment.id]);

  const update = (idx, patch) =>
    setArtikel((arr) =>
      arr.map((a, i) => (i === idx ? { ...a, ...patch } : a))
    );

  const remove = (idx) =>
    setArtikel((arr) =>
      arr.length > 1 ? arr.filter((_, i) => i !== idx) : arr
    );

  const add = () => setArtikel((arr) => [...arr, emptyArtikel()]);

  return (
    <div className="space-y-4 pb-4">
      <ul className="space-y-3">
        {artikel.map((a, idx) => (
          <li
            key={idx}
            className="bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] p-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted uppercase tracking-wider font-medium">
                Artikel {idx + 1}
              </span>
              {artikel.length > 1 && (
                <button
                  onClick={() => remove(idx)}
                  className="p-1 text-muted active:text-red-600"
                  aria-label="Artikel entfernen"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <ArtikelEditor
              artikel={a}
              onChange={(patch) => update(idx, patch)}
            />
          </li>
        ))}
      </ul>

      <button
        onClick={add}
        className="w-full inline-flex items-center justify-center gap-2 bg-surface ring-1 ring-brand/40 text-ink font-medium py-2.5 rounded-lg active:opacity-80 transition-opacity"
      >
        <Plus size={16} /> Weiteren Artikel hinzufügen
      </button>

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

function ArtikelEditor({ artikel, onChange }) {
  const fileRef = useRef(null);
  const handleFiles = async (e) => {
    const list = Array.from(e.target.files || []);
    e.target.value = '';
    if (!list.length) return;
    const remaining = 5 - artikel.fotos.length;
    const data = await resizeMany(list.slice(0, remaining), 1400);
    onChange({ fotos: [...artikel.fotos, ...data].slice(0, 5) });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto scroll-touch -mx-1 px-1">
        {artikel.fotos.map((p, i) => (
          <div key={i} className="relative shrink-0">
            <img src={p} alt="" className="w-24 h-24 rounded-lg object-cover" />
            <button
              onClick={() =>
                onChange({ fotos: artikel.fotos.filter((_, j) => j !== i) })
              }
              className="absolute -top-1.5 -right-1.5 bg-ink rounded-full p-1 text-white"
              aria-label="Foto entfernen"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {artikel.fotos.length < 5 && (
          <button
            onClick={() => fileRef.current?.click()}
            className="shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-black/15 flex flex-col items-center justify-center text-muted active:bg-surface2"
          >
            <Plus size={20} />
            <span className="text-xs mt-1">{artikel.fotos.length}/5</span>
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      <textarea
        value={artikel.notiz}
        onChange={(e) => onChange({ notiz: e.target.value })}
        placeholder="Artikelnummer, Farbe, freier Text …"
        rows={2}
        className="w-full bg-surface2 rounded-lg p-3 text-sm outline-none resize-none ring-1 ring-brand/40 focus:ring-2 focus:ring-brand"
      />
    </div>
  );
}
