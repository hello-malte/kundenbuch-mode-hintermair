import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2, X, Edit3, Eye, EyeOff, Camera } from 'lucide-react';
import {
  db,
  addAlteration,
  updateAlteration,
  toggleAlterationDone,
  deleteAlteration
} from '../../db/database';
import { resizeMany } from '../../utils/photo';
import PhotoCarousel from '../../components/PhotoCarousel';

export default function AlterationsTab({ customerId }) {
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDone, setShowDone] = useState(true);

  const items = useLiveQuery(
    () =>
      db.alterations
        .where('kunden_id')
        .equals(customerId)
        .reverse()
        .sortBy('erstellt_am'),
    [customerId]
  );

  const all = items || [];
  const doneCount = all.filter((i) => i.erledigt).length;
  const visible = all.filter((i) => showDone || !i.erledigt);
  const offene = visible.filter((i) => !i.erledigt);
  const erledigte = visible.filter((i) => i.erledigt);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setComposing(true)}
          className="inline-flex items-center gap-2 bg-brand text-white font-medium rounded-full px-4 py-2 active:scale-95 transition-transform duration-200"
        >
          <Plus size={16} /> Neue Änderung
        </button>
      </div>

      {composing && (
        <AlterationEditor
          title="Neue Änderung"
          onCancel={() => setComposing(false)}
          onSave={async ({ beschreibung, fotos }) => {
            await addAlteration({ customerId, beschreibung, fotos });
            setComposing(false);
          }}
        />
      )}

      {editing && (
        <AlterationEditor
          title="Änderung bearbeiten"
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={async ({ beschreibung, fotos }) => {
            await updateAlteration(editing.id, { beschreibung, fotos });
            setEditing(null);
          }}
        />
      )}

      {all.length === 0 && !composing && (
        <div className="text-muted text-center py-16">
          Noch keine Änderungen erfasst.
          <br />
          Tippe oben auf <span className="text-brand">Neue Änderung</span>.
        </div>
      )}

      {doneCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowDone((s) => !s)}
            className="text-sm text-muted inline-flex items-center gap-1.5"
          >
            {showDone ? <EyeOff size={14} /> : <Eye size={14} />}
            {showDone
              ? 'Erledigte ausblenden'
              : `${doneCount} Erledigte einblenden`}
          </button>
        </div>
      )}

      {offene.length > 0 && (
        <ul className="space-y-3">
          {offene.map((i) => (
            <AlterationCard
              key={i.id}
              item={i}
              hidden={editing?.id === i.id}
              onEdit={() => setEditing(i)}
            />
          ))}
        </ul>
      )}

      {erledigte.length > 0 && (
        <>
          <h3 className="text-xs uppercase tracking-wider text-muted mt-6 mb-2 px-1">
            Erledigt
          </h3>
          <ul className="space-y-3">
            {erledigte.map((i) => (
              <AlterationCard
                key={i.id}
                item={i}
                hidden={editing?.id === i.id}
                onEdit={() => setEditing(i)}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function AlterationEditor({ title, initial, onCancel, onSave }) {
  const [beschreibung, setBeschreibung] = useState(initial?.beschreibung || '');
  const [fotos, setFotos] = useState(initial?.fotos || []);
  const [fertigBis, setFertigBis] = useState(initial?.fertig_bis || '');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handleFiles = async (e) => {
    const list = Array.from(e.target.files || []);
    e.target.value = '';
    if (!list.length) return;
    const remaining = 3 - fotos.length;
    const data = await resizeMany(list.slice(0, remaining), 1400);
    setFotos((p) => [...p, ...data].slice(0, 3));
  };

  const hasContent = beschreibung.trim().length > 0 || fotos.length > 0;

  const save = async () => {
    if (!hasContent || saving) return;
    setSaving(true);
    try {
      await onSave({ beschreibung, fotos, fertig_bis: fertigBis });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <button onClick={onCancel} className="p-1 text-muted" aria-label="Abbrechen">
          <X size={18} />
        </button>
      </div>

      <textarea
        value={beschreibung}
        onChange={(e) => setBeschreibung(e.target.value)}
        placeholder="z.B. Hose Marke X um 3 cm kürzen, Saum versäubern"
        rows={3}
        className="w-full bg-surface2 rounded-lg p-3 text-sm outline-none resize-none focus:ring-1 focus:ring-brand"
      />

      <label className="block">
        <span className="text-xs text-muted mb-1 block">Fertig bis</span>
        <input
          type="date"
          value={fertigBis}
          onChange={(e) => setFertigBis(e.target.value)}
          className="w-full bg-surface2 rounded-lg px-3 py-2.5 outline-none text-base text-left focus:ring-1 focus:ring-brand"
          style={{ colorScheme: 'light' }}
        />
      </label>

      <div className="flex gap-2 overflow-x-auto scroll-touch -mx-1 px-1">
        {fotos.map((p, i) => (
          <div key={i} className="relative shrink-0">
            <img src={p} alt="" className="w-24 h-24 rounded-lg object-cover" />
            <button
              onClick={() => setFotos(fotos.filter((_, j) => j !== i))}
              className="absolute -top-1.5 -right-1.5 bg-ink rounded-full p-1 text-white"
              aria-label="Foto entfernen"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {fotos.length < 3 && (
          <button
            onClick={() => fileRef.current?.click()}
            className="shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-black/15 flex flex-col items-center justify-center text-muted active:bg-surface2"
          >
            <Camera size={20} />
            <span className="text-xs mt-1">{fotos.length}/3</span>
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

function AlterationCard({ item, hidden, onEdit }) {
  const fotos = item.fotos || [];
  const date = new Date(item.datum);
  if (hidden) return null;

  const handleDelete = async () => {
    if (confirm('Änderung löschen?')) await deleteAlteration(item.id);
  };

  return (
    <li className="bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] overflow-hidden">
      <div className={`flex items-start gap-3 p-3 ${item.erledigt ? 'opacity-60' : ''}`}>
        <input
          type="checkbox"
          checked={!!item.erledigt}
          onChange={(e) => toggleAlterationDone(item.id, e.target.checked)}
          className="mt-1 w-5 h-5 accent-brand shrink-0"
          aria-label="Erledigt"
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted">
            {date.toLocaleDateString('de-DE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
            {item.erledigt && item.erledigt_am && (
              <>
                {' '}· erledigt {new Date(item.erledigt_am).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'short'
                })}
              </>
            )}
          </div>
          {item.beschreibung && (
            <p
              className={`text-sm whitespace-pre-wrap leading-relaxed mt-1 ${
                item.erledigt ? 'line-through' : ''
              }`}
            >
              {item.beschreibung}
            </p>
          )}
          {item.fertig_bis && !item.erledigt && (
            <DueBadge dateStr={item.fertig_bis} />
          )}
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 text-muted active:opacity-60"
            aria-label="Bearbeiten"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-muted active:opacity-60"
            aria-label="Löschen"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <PhotoCarousel
        fotos={fotos}
        faded={item.erledigt}
        shareTitle="Änderung"
        shareText={item.beschreibung || ''}
      />
    </li>
  );
}

function DueBadge({ dateStr }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  let label;
  let tone;
  if (diffDays < 0) {
    label = `Überfällig seit ${due.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}`;
    tone = 'bg-red-600 text-white';
  } else if (diffDays === 0) {
    label = 'Heute fertig';
    tone = 'bg-brand text-white';
  } else if (diffDays === 1) {
    label = 'Morgen fertig';
    tone = 'bg-brand text-white';
  } else {
    label = `Fertig bis ${due.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}`;
    tone = 'bg-brand/10 text-brand';
  }

  return (
    <span
      className={`inline-block mt-1.5 text-xs font-medium rounded-full px-2.5 py-0.5 ${tone}`}
    >
      {label}
    </span>
  );
}
