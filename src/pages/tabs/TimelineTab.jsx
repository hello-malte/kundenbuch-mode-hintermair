import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Camera, Trash2, X, Plus, Edit3 } from 'lucide-react';
import {
  db,
  addTimelineEntry,
  updateTimelineEntry,
  deleteTimelineEntry,
  normalizeTimelineEntry
} from '../../db/database';
import { resizeMany } from '../../utils/photo';

const emptyArtikel = () => ({ fotos: [], notiz: '' });

export default function TimelineTab({ customerId }) {
  const [composing, setComposing] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const entries = useLiveQuery(
    () =>
      db.timeline_entries
        .where('kunden_id')
        .equals(customerId)
        .reverse()
        .sortBy('datum'),
    [customerId]
  );

  const normalized = (entries || []).map(normalizeTimelineEntry);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setComposing(true)}
          className="inline-flex items-center gap-2 bg-brand text-white font-medium rounded-full px-4 py-2 active:scale-95 transition-transform duration-200"
        >
          <Camera size={16} /> Neuer Einkauf
        </button>
      </div>

      {composing && (
        <EntryEditor
          initialArtikel={[emptyArtikel()]}
          title="Neuer Einkauf"
          onCancel={() => setComposing(false)}
          onSave={async (artikel) => {
            await addTimelineEntry({ customerId, artikel });
            setComposing(false);
          }}
        />
      )}

      {editingEntry && (
        <EntryEditor
          initialArtikel={editingEntry.artikel}
          title="Einkauf bearbeiten"
          onCancel={() => setEditingEntry(null)}
          onSave={async (artikel) => {
            await updateTimelineEntry(editingEntry.id, { artikel });
            setEditingEntry(null);
          }}
        />
      )}

      {entries && entries.length === 0 && !composing && (
        <div className="text-muted text-center py-16">
          Noch keine Einkäufe erfasst.
          <br />
          Tippe oben auf <span className="text-brand">Neuer Einkauf</span>.
        </div>
      )}

      <ul className="space-y-4">
        {normalized.map((e) => (
          <EntryCard
            key={e.id}
            entry={e}
            hidden={editingEntry?.id === e.id}
            onEdit={() => setEditingEntry(e)}
          />
        ))}
      </ul>
    </div>
  );
}

function EntryEditor({ initialArtikel, title, onCancel, onSave }) {
  const [artikel, setArtikel] = useState(() =>
    initialArtikel?.length ? initialArtikel.map((a) => ({ ...a })) : [emptyArtikel()]
  );
  const [saving, setSaving] = useState(false);

  const update = (idx, patch) =>
    setArtikel((arr) => arr.map((a, i) => (i === idx ? { ...a, ...patch } : a)));

  const remove = (idx) =>
    setArtikel((arr) => (arr.length > 1 ? arr.filter((_, i) => i !== idx) : arr));

  const add = () => setArtikel((arr) => [...arr, emptyArtikel()]);

  const hasContent = artikel.some(
    (a) => a.fotos.length > 0 || a.notiz.trim().length > 0
  );

  const save = async () => {
    if (!hasContent || saving) return;
    setSaving(true);
    try {
      await onSave(artikel);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <button
          onClick={onCancel}
          className="p-1 text-muted"
          aria-label="Abbrechen"
        >
          <X size={18} />
        </button>
      </div>

      <ul className="space-y-4">
        {artikel.map((a, idx) => (
          <li key={idx} className="bg-surface2 rounded-xl p-3 space-y-3">
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
        className="w-full inline-flex items-center justify-center gap-2 bg-surface2 text-ink font-medium py-2.5 rounded-lg active:opacity-80 transition-opacity"
      >
        <Plus size={16} /> Weiteren Artikel hinzufügen
      </button>

      <button
        onClick={save}
        disabled={saving || !hasContent}
        className="w-full bg-brand text-white font-medium py-3 rounded-lg disabled:opacity-40 active:scale-[0.98] transition-transform duration-200"
      >
        {saving ? 'Speichere …' : 'Speichern'}
      </button>
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
            className="shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-black/15 flex flex-col items-center justify-center text-muted active:bg-surface"
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
        placeholder="Marke, Größe, Artikel, freier Text …"
        rows={2}
        className="w-full bg-surface rounded-lg p-3 text-sm outline-none resize-none focus:ring-1 focus:ring-brand"
      />
    </div>
  );
}

function EntryCard({ entry, hidden, onEdit }) {
  if (hidden) return null;
  const date = new Date(entry.datum);
  const artikel = entry.artikel || [];

  const handleDelete = async () => {
    if (confirm('Einkauf löschen?')) await deleteTimelineEntry(entry.id);
  };

  return (
    <li className="bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="text-brand font-bold text-base min-w-0">
          <span>
            {date.toLocaleDateString('de-DE', {
              weekday: 'long',
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
            {' · '}
            {date.toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {artikel.length > 1 && (
            <span className="font-medium opacity-80"> · {artikel.length} Artikel</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-muted shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 active:opacity-60"
            aria-label="Bearbeiten"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 active:opacity-60"
            aria-label="Löschen"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <ul className="divide-y divide-black/5">
        {artikel.map((a, idx) => (
          <ArtikelView key={idx} artikel={a} />
        ))}
      </ul>
    </li>
  );
}

function ArtikelView({ artikel }) {
  const [idx, setIdx] = useState(0);
  const fotos = artikel.fotos || [];

  return (
    <li>
      {fotos.length > 0 && (
        <div className="relative aspect-square bg-black select-none">
          <img
            src={fotos[idx]}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />
          {fotos.length > 1 && (
            <>
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs rounded-full px-2 py-0.5">
                {idx + 1}/{fotos.length}
              </div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {fotos.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === idx ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                className="absolute left-0 top-0 bottom-0 w-1/3"
                aria-label="Vorheriges Foto"
              />
              <button
                onClick={() => setIdx((i) => Math.min(fotos.length - 1, i + 1))}
                className="absolute right-0 top-0 bottom-0 w-1/3"
                aria-label="Nächstes Foto"
              />
            </>
          )}
        </div>
      )}

      {artikel.notiz && (
        <p className="px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">
          {artikel.notiz}
        </p>
      )}
    </li>
  );
}
