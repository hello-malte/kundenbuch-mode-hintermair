import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Camera, Trash2, X, Plus, Edit3, Check } from 'lucide-react';
import { db, addTimelineEntry, deleteTimelineEntry } from '../../db/database';
import { resizeMany } from '../../utils/photo';

export default function TimelineTab({ customerId }) {
  const [composing, setComposing] = useState(false);
  const entries = useLiveQuery(
    () =>
      db.timeline_entries
        .where('kunden_id')
        .equals(customerId)
        .reverse()
        .sortBy('datum'),
    [customerId]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setComposing(true)}
          className="inline-flex items-center gap-2 bg-brand text-white font-medium rounded-full px-4 py-2 active:scale-95 transition-transform duration-200"
        >
          <Camera size={16} /> Neuer Eintrag
        </button>
      </div>

      {composing && (
        <ComposeEntry
          customerId={customerId}
          onClose={() => setComposing(false)}
        />
      )}

      {entries && entries.length === 0 && !composing && (
        <div className="text-muted text-center py-16">
          Noch keine Einkäufe erfasst.
          <br />
          Tippe oben auf <span className="text-brand">Neuer Eintrag</span>.
        </div>
      )}

      <ul className="space-y-4">
        {(entries || []).map((e) => (
          <EntryCard key={e.id} entry={e} />
        ))}
      </ul>
    </div>
  );
}

function ComposeEntry({ customerId, onClose }) {
  const [photos, setPhotos] = useState([]);
  const [notiz, setNotiz] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handleFiles = async (e) => {
    const list = Array.from(e.target.files || []);
    e.target.value = '';
    if (!list.length) return;
    const remaining = 5 - photos.length;
    const data = await resizeMany(list.slice(0, remaining), 1400);
    setPhotos((p) => [...p, ...data].slice(0, 5));
  };

  const save = async () => {
    if (!photos.length && !notiz.trim()) return;
    setSaving(true);
    try {
      await addTimelineEntry({
        customerId,
        fotos: photos,
        notiz: notiz.trim()
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Neuer Eintrag</h3>
        <button onClick={onClose} className="p-1 text-muted" aria-label="Abbrechen">
          <X size={18} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scroll-touch -mx-1 px-1">
        {photos.map((p, i) => (
          <div key={i} className="relative shrink-0">
            <img src={p} alt="" className="w-24 h-24 rounded-lg object-cover" />
            <button
              onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
              className="absolute -top-1.5 -right-1.5 bg-ink rounded-full p-1 text-white"
              aria-label="Foto entfernen"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {photos.length < 5 && (
          <button
            onClick={() => fileRef.current?.click()}
            className="shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-black/15 flex flex-col items-center justify-center text-muted active:bg-surface2"
          >
            <Plus size={20} />
            <span className="text-xs mt-1">{photos.length}/5</span>
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleFiles}
        className="hidden"
      />

      <textarea
        value={notiz}
        onChange={(e) => setNotiz(e.target.value)}
        placeholder="Marke, Größe, Artikel, freier Text …"
        rows={3}
        className="w-full bg-surface2 rounded-lg p-3 text-sm outline-none resize-none focus:ring-1 focus:ring-brand"
      />

      <button
        onClick={save}
        disabled={saving || (!photos.length && !notiz.trim())}
        className="w-full bg-brand text-white font-medium py-2.5 rounded-lg disabled:opacity-40 active:scale-[0.98] transition-transform duration-200"
      >
        {saving ? 'Speichere …' : 'Speichern'}
      </button>
    </div>
  );
}

function EntryCard({ entry }) {
  const [idx, setIdx] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.notiz || '');

  const date = new Date(entry.datum);
  const fotos = entry.fotos || [];

  const handleDelete = async () => {
    if (confirm('Eintrag löschen?')) await deleteTimelineEntry(entry.id);
  };

  const saveEdit = async () => {
    await db.timeline_entries.update(entry.id, { notiz: draft.trim() });
    setEditing(false);
  };

  return (
    <li className="bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted">
        <span>
          {date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}{' '}
          ·{' '}
          {date.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing((v) => !v)}
            className="p-1.5 active:opacity-60"
            aria-label="Bearbeiten"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 active:opacity-60"
            aria-label="Löschen"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

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

      <div className="px-4 py-3">
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="w-full bg-surface2 rounded-lg p-2.5 text-sm outline-none resize-none focus:ring-1 focus:ring-brand"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setDraft(entry.notiz || '');
                  setEditing(false);
                }}
                className="px-3 py-1.5 text-sm text-muted"
              >
                Abbrechen
              </button>
              <button
                onClick={saveEdit}
                className="inline-flex items-center gap-1 bg-brand text-white text-sm font-medium rounded-full px-3 py-1.5"
              >
                <Check size={14} /> Speichern
              </button>
            </div>
          </div>
        ) : entry.notiz ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{entry.notiz}</p>
        ) : (
          <p className="text-sm text-muted italic">Keine Notiz</p>
        )}
      </div>
    </li>
  );
}
