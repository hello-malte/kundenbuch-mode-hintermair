import { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Plus, User, X, Settings, Trash2, Cake, Scissors } from 'lucide-react';
import { db, createCustomer, deleteCustomer } from '../db/database';
import Logo from '../components/Logo';
import BackupMenu from '../components/BackupMenu';

function todayMonthDay() {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function tomorrowDateString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function computeAge(geburtstag) {
  if (!geburtstag) return null;
  const year = parseInt(geburtstag.slice(0, 4), 10);
  if (!year) return null;
  return new Date().getFullYear() - year;
}

export default function CustomerList() {
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const customers = useLiveQuery(
    () => db.customers.orderBy('nachname').toArray(),
    []
  );

  const named = useMemo(
    () =>
      (customers || []).filter(
        (c) => `${c.vorname || ''} ${c.nachname || ''}`.trim().length > 0
      ),
    [customers]
  );

  const filtered = useMemo(() => {
    if (!q.trim()) return named;
    const t = q.trim().toLowerCase();
    return named.filter((c) =>
      `${c.vorname || ''} ${c.nachname || ''}`.toLowerCase().includes(t)
    );
  }, [named, q]);

  const birthdayToday = useMemo(() => {
    if (!customers) return [];
    const md = todayMonthDay();
    return customers.filter(
      (c) => c.geburtstag && c.geburtstag.slice(5) === md
    );
  }, [customers]);

  const dueTomorrow = useLiveQuery(async () => {
    const tomorrow = tomorrowDateString();
    const items = await db.alterations
      .filter((a) => !a.erledigt && a.fertig_bis === tomorrow)
      .toArray();
    if (!items.length) return [];
    const ids = [...new Set(items.map((a) => a.kunden_id))];
    const custs = await db.customers.bulkGet(ids);
    const map = new Map(custs.filter(Boolean).map((c) => [c.id, c]));
    return items
      .map((a) => ({ ...a, customer: map.get(a.kunden_id) }))
      .filter((a) => a.customer);
  }, []) || [];

  const handleNew = async () => {
    const id = await createCustomer({ vorname: '', nachname: '' });
    navigate(`/kunden/${id}/profil`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteCustomer(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="safe-top">
      <header className="px-4 pt-3 pb-3 sticky top-0 bg-bg/95 backdrop-blur z-30">
        <div className="flex items-center justify-between mb-3 min-h-[40px]">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">
              {customers ? `${named.length} Kunde${named.length === 1 ? '' : 'n'}` : ''}
            </span>
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 -mr-1 text-muted active:text-ink"
              aria-label="Daten verwalten"
            >
              <Settings size={20} />
            </button>
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

      {birthdayToday.length > 0 && (
        <div className="px-4 pt-3">
          <div className="bg-brand/10 ring-1 ring-brand/40 rounded-2xl p-3 flex items-start gap-3">
            <Cake size={22} className="text-brand shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider text-brand font-medium">
                Heute Geburtstag
              </div>
              <div className="text-sm mt-0.5 leading-relaxed">
                {birthdayToday.map((c, i) => {
                  const name = `${c.vorname || ''} ${c.nachname || ''}`.trim() || 'Unbenannt';
                  const age = computeAge(c.geburtstag);
                  return (
                    <span key={c.id}>
                      {i > 0 && ', '}
                      <Link
                        to={`/kunden/${c.id}`}
                        className="font-medium text-ink"
                      >
                        {name}
                        {age != null && (
                          <span className="text-muted font-normal"> ({age})</span>
                        )}
                      </Link>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {dueTomorrow.length > 0 && (
        <div className="px-4 pt-3">
          <div className="bg-brand text-white rounded-2xl p-3 flex items-start gap-3">
            <Scissors size={22} className="shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider font-medium opacity-90">
                Morgen fertig
              </div>
              <div className="text-sm mt-0.5 leading-relaxed">
                {dueTomorrow.map((a, i) => {
                  const c = a.customer;
                  const name = `${c.vorname || ''} ${c.nachname || ''}`.trim() || 'Unbenannt';
                  return (
                    <span key={a.id}>
                      {i > 0 && ', '}
                      <Link
                        to={`/kunden/${c.id}/aenderungen`}
                        className="font-medium underline-offset-2"
                      >
                        {name}
                      </Link>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <ul className="px-4 pt-3 pb-4 space-y-2">
        {customers === undefined && (
          <li className="text-muted text-center py-10">Lade …</li>
        )}
        {customers && filtered.length === 0 && (
          <li className="text-muted text-center py-12">
            {q
              ? 'Keine Treffer.'
              : 'Noch keine Kunden. Tippe auf + um anzulegen.'}
          </li>
        )}
        {filtered.map((c) => (
          <CustomerCard
            key={c.id}
            customer={c}
            onLongPress={setDeleteTarget}
          />
        ))}
      </ul>

      <button
        onClick={handleNew}
        className="fixed right-4 z-30 w-14 h-14 rounded-full bg-brand text-white flex items-center justify-center shadow-xl shadow-brand/30 active:scale-95 transition-transform duration-200"
        style={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}
        aria-label="Neuer Kunde"
      >
        <Plus size={26} strokeWidth={2.4} />
      </button>

      <BackupMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <DeleteSheet
        customer={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function CustomerCard({ customer, onLongPress }) {
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
      onLongPress(customer);
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

  return (
    <li>
      <Link
        to={`/kunden/${customer.id}`}
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
        {customer.foto ? (
          <img
            src={customer.foto}
            alt=""
            className="w-12 h-12 rounded-full object-cover shrink-0"
            draggable={false}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center text-muted shrink-0">
            <User size={22} strokeWidth={1.5} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">
            {`${customer.vorname || ''} ${customer.nachname || ''}`.trim()}
          </div>
        </div>
      </Link>
    </li>
  );
}

function DeleteSheet({ customer, onConfirm, onCancel }) {
  if (!customer) return null;
  const name =
    `${customer.vorname || ''} ${customer.nachname || ''}`.trim() ||
    'Unbenannter Kunde';

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
            Inklusive aller Timeline-Einträge, Notizen und Order-Daten unwiderruflich löschen?
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
