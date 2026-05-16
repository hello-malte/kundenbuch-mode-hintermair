import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { db, addOrderItem, updateOrderItem, deleteOrderItem } from '../../db/database';

export default function OrderTab({ customerId }) {
  const [brand, setBrand] = useState('');
  const [notiz, setNotiz] = useState('');
  const [showDone, setShowDone] = useState(false);

  const items = useLiveQuery(
    () =>
      db.order_items
        .where('kunden_id')
        .equals(customerId)
        .reverse()
        .sortBy('erstellt_am'),
    [customerId]
  );

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
          placeholder="Brand (z.B. CIRCOLO 1901)"
          className="w-full bg-surface2 rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-brand text-base"
        />
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
        {visible.map((i) => (
          <li
            key={i.id}
            className="bg-surface rounded-xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] p-3 flex items-start gap-3"
          >
            <input
              type="checkbox"
              checked={!!i.erledigt}
              onChange={(e) => toggle(i.id, e.target.checked)}
              className="mt-1 w-5 h-5 accent-brand shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div
                className={`font-medium ${
                  i.erledigt ? 'line-through text-muted' : ''
                }`}
              >
                {i.brand}
              </div>
              {i.notiz && (
                <div className="text-sm text-muted break-words">{i.notiz}</div>
              )}
            </div>
            <button
              onClick={() => deleteOrderItem(i.id)}
              className="p-1.5 text-muted active:opacity-60 shrink-0"
              aria-label="Eintrag löschen"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
