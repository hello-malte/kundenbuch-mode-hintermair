import { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Plus, Truck, X, Trash2 } from 'lucide-react';
import {
  db,
  createSupplier,
  deleteSupplier,
  SUPPLIER_KATEGORIEN
} from '../db/database';
import Logo from '../components/Logo';

const KATEGORIE_LABELS = Object.fromEntries(
  SUPPLIER_KATEGORIEN.map((k) => [k.value, k.label])
);

export default function SupplierList() {
  const [q, setQ] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const suppliers = useLiveQuery(
    () => db.suppliers.orderBy('lieferanten_name').toArray(),
    []
  );

  const named = useMemo(
    () =>
      (suppliers || []).filter(
        (s) => (s.lieferanten_name || '').trim().length > 0
      ),
    [suppliers]
  );

  const filtered = useMemo(() => {
    if (!q.trim()) return named;
    const t = q.trim().toLowerCase();
    return named.filter((s) =>
      `${s.lieferanten_name || ''} ${s.vorname || ''} ${s.nachname || ''}`
        .toLowerCase()
        .includes(t)
    );
  }, [named, q]);

  const handleNew = async () => {
    const id = await createSupplier({ lieferanten_name: '' });
    navigate(`/einkauf/lieferanten/${id}/profil`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteSupplier(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="safe-top">
      <header className="px-4 pt-3 pb-3 sticky top-0 bg-bg/95 backdrop-blur z-30">
        <div className="flex items-center justify-between mb-3 min-h-[40px]">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">
              {suppliers
                ? `${named.length} Lieferant${named.length === 1 ? '' : 'en'}`
                : ''}
            </span>
          </div>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-surface text-ink placeholder-muted rounded-xl pl-10 pr-9 py-3 outline-none focus:ring-1 focus:ring-brand ring-1 ring-black/5"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted p-1"
              aria-label="Suche leeren"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <ul className="px-4 pt-3 pb-4 space-y-2">
        {suppliers === undefined && (
          <li className="text-muted text-center py-10">Lade …</li>
        )}
        {suppliers && filtered.length === 0 && (
          <li className="text-muted text-center py-12">
            {q
              ? 'Keine Treffer.'
              : 'Noch keine Lieferanten. Tippe auf + um anzulegen.'}
          </li>
        )}
        {filtered.map((s) => (
          <SupplierCard
            key={s.id}
            supplier={s}
            onLongPress={setDeleteTarget}
          />
        ))}
      </ul>

      <button
        onClick={handleNew}
        className="fixed right-4 z-30 w-14 h-14 rounded-full bg-brand text-white flex items-center justify-center shadow-xl shadow-brand/30 active:scale-95 transition-transform duration-200"
        style={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}
        aria-label="Neuer Lieferant"
      >
        <Plus size={26} strokeWidth={2.4} />
      </button>

      <DeleteSheet
        supplier={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function SupplierCard({ supplier, onLongPress }) {
  const timerRef = useRef(null);
  const triggeredRef = useRef(false);
  const startRef = useRef(null);

  const start = (clientX, clientY) => {
    triggeredRef.current = false;
    startRef.current = { x: clientX, y: clientY };
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      triggeredRef.current = true;
      if (navigator.vibrate) navigator.vibrate(35);
      onLongPress(supplier);
    }, 550);
  };
  const moved = (clientX, clientY) => {
    if (!startRef.current) return;
    const dx = clientX - startRef.current.x;
    const dy = clientY - startRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      clearTimeout(timerRef.current);
      startRef.current = null;
    }
  };
  const cancel = () => {
    clearTimeout(timerRef.current);
    startRef.current = null;
  };

  const kategorien = supplier.kategorien || [];

  return (
    <li>
      <Link
        to={`/einkauf/lieferanten/${supplier.id}`}
        onClick={(e) => {
          if (triggeredRef.current) {
            e.preventDefault();
            triggeredRef.current = false;
          }
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) start(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (t) moved(t.clientX, t.clientY);
        }}
        onTouchEnd={cancel}
        onTouchCancel={cancel}
        onMouseDown={(e) => start(e.clientX, e.clientY)}
        onMouseMove={(e) => moved(e.clientX, e.clientY)}
        onMouseUp={cancel}
        onMouseLeave={cancel}
        onContextMenu={(e) => e.preventDefault()}
        className="flex items-center gap-3 bg-surface rounded-2xl p-3 ring-1 ring-black/5 shadow-sm shadow-black/[0.02] active:bg-surface2 transition-colors duration-200 select-none"
      >
        {supplier.foto ? (
          <img
            src={supplier.foto}
            alt=""
            className="w-12 h-12 rounded-full object-cover shrink-0"
            draggable={false}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center text-muted shrink-0">
            <Truck size={20} strokeWidth={1.5} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">
            {supplier.lieferanten_name}
          </div>
          {kategorien.length > 0 && (
            <div className="text-xs text-muted truncate mt-0.5">
              {kategorien.map((k) => KATEGORIE_LABELS[k]).filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}

function DeleteSheet({ supplier, onConfirm, onCancel }) {
  if (!supplier) return null;
  const name = supplier.lieferanten_name || 'Unbenannter Lieferant';
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl ring-1 ring-black/5 shadow-2xl safe-bottom">
        <div className="px-5 pt-5 pb-3 text-center">
          <div className="text-lg font-semibold">{name}</div>
          <p className="text-sm text-muted mt-1">
            Inklusive aller Order-Termine unwiderruflich löschen?
          </p>
        </div>
        <div className="px-4 pb-4 space-y-2">
          <button
            onClick={onConfirm}
            className="w-full bg-red-600 text-white rounded-xl py-3 font-medium active:opacity-80 transition-opacity"
          >
            <Trash2 size={16} className="inline mr-2 -mt-0.5" />
            Löschen
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-surface2 text-ink rounded-xl py-3 font-medium active:opacity-80 transition-opacity"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
