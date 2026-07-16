import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2, Eye, EyeOff, Edit3, Check, X } from 'lucide-react';
import { db, addOrderItem, updateOrderItem, deleteOrderItem } from '../../db/database';

export default function OrderTab({ customerId }) {
  const [brand, setBrand] = useState('');
  const [notiz, setNotiz] = useState('');
  const [showDone, setShowDone] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const items = useLiveQuery(
    () =>
      db.order_items
        .where('kunden_id')
        .equals(customerId)
        .reverse()
        .sortBy('erstellt_am'),
    [customerId]
  );

  const suppliers = useLiveQuery(
    () =>
      db.suppliers
        .filter((s) => (s.lieferanten_name || '').trim().length > 0)
        .toArray()
        .then((list) =>
          list.sort((a, b) =>
            (a.lieferanten_name || '').localeCompare(
              b.lieferanten_name || '',
              'de'
            )
          )
        ),
    []
  ) || [];

  const add = async () => {
    if (!brand.trim()) return;
    await addOrderItem({ customerId, brand, notiz });
    setBrand('');
    setNotiz('');
  };

  const toggle = (id, val) => updateOrderItem(id, { erledigt: val });

  const visible = (items || []).filter((i) => showDone || !i.erledigt);
  const doneCount = (items || []).filter((i) => i.erledigt).length;

  return (
    <div className="space-y-4 pb-4">
      <div className="bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] p-3 space-y-2">
        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Lieferant (Vorschläge aus Lieferantenliste)"
          list="supplier-suggestions"
          autoComplete="off"
          className="w-full bg-surface2 rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-brand text-base"
        />
        <datalist id="supplier-suggestions">
          {suppliers.map((s) => (
            <option key={s.id} value={s.lieferanten_name} />
          ))}
        </datalist>
        <input
          value={notiz}
          onChange={(e) => setNotiz(e.target.value)}
          placeholder="Notiz (z.B. Blazer Gr. 50, Marine)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          className="w-full bg-surface2 rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-brand text-base"
        />
        <button
          onClick={add}
          disabled={!brand.trim()}
          className="w-full bg-brand text-white font-medium rounded-lg py-2.5 inline-flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-transform duration-200"
        >
          <Plus size={16} /> Hinzufügen
        </button>
      </div>

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

      <ul className="space-y-2">
        {visible.length === 0 && (
          <li className="text-muted text-center py-10">
            Noch keine Brands für diesen Kunden.
          </li>
        )}
        {visible.map((i) =>
          editingId === i.id ? (
            <OrderItemEditor
              key={i.id}
              item={i}
              onSave={async (patch) => {
                await updateOrderItem(i.id, patch);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <OrderItemRow
              key={i.id}
              item={i}
              onToggle={(val) => toggle(i.id, val)}
              onEdit={() => setEditingId(i.id)}
              onDelete={() => deleteOrderItem(i.id)}
            />
          )
        )}
      </ul>
    </div>
  );
}

function OrderItemRow({ item, onToggle, onEdit, onDelete }) {
  return (
    <li className="bg-surface rounded-xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] p-3 flex items-start gap-3">
      <input
        type="checkbox"
        checked={!!item.erledigt}
        onChange={(e) => onToggle(e.target.checked)}
        className="mt-1 w-5 h-5 accent-brand shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div
          className={`font-medium ${
            item.erledigt ? 'line-through text-muted' : ''
          }`}
        >
          {item.brand}
        </div>
        {item.notiz && (
          <div className="text-sm text-muted break-words">{item.notiz}</div>
        )}
      </div>
      <div className="flex flex-col gap-1 shrink-0 -my-0.5">
        <button
          onClick={onEdit}
          className="p-1.5 text-muted active:opacity-60"
          aria-label="Bearbeiten"
        >
          <Edit3 size={16} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-muted active:opacity-60"
          aria-label="Eintrag löschen"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}

function OrderItemEditor({ item, onSave, onCancel }) {
  const [brand, setBrand] = useState(item.brand || '');
  const [notiz, setNotiz] = useState(item.notiz || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!brand.trim() || saving) return;
    setSaving(true);
    try {
      await onSave({ brand: brand.trim(), notiz: notiz.trim() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="bg-surface rounded-xl ring-1 ring-brand/40 p-3 space-y-2">
      <input
        autoFocus
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        placeholder="Lieferant"
        list="supplier-suggestions"
        autoComplete="off"
        className="w-full bg-surface2 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand text-base"
      />
      <input
        value={notiz}
        onChange={(e) => setNotiz(e.target.value)}
        placeholder="Notiz (optional)"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            save();
          }
        }}
        className="w-full bg-surface2 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand text-base"
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-muted active:opacity-60"
        >
          <X size={14} /> Abbrechen
        </button>
        <button
          onClick={save}
          disabled={!brand.trim() || saving}
          className="inline-flex items-center gap-1 bg-brand text-white text-sm font-medium rounded-full px-3 py-1.5 disabled:opacity-40 active:opacity-80"
        >
          <Check size={14} /> Speichern
        </button>
      </div>
    </li>
  );
}
