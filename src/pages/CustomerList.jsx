import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Plus, User, X } from 'lucide-react';
import { db, createCustomer } from '../db/database';
import Logo from '../components/Logo';

export default function CustomerList() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const customers = useLiveQuery(
    () => db.customers.orderBy('nachname').toArray(),
    []
  );

  const filtered = useMemo(() => {
    if (!customers) return [];
    if (!q.trim()) return customers;
    const t = q.trim().toLowerCase();
    return customers.filter(
      (c) =>
        (c.vorname || '').toLowerCase().includes(t) ||
        (c.nachname || '').toLowerCase().includes(t) ||
        (c.telefon || '').toLowerCase().includes(t)
    );
  }, [customers, q]);

  const handleNew = async () => {
    const id = await createCustomer({ vorname: '', nachname: '' });
    navigate(`/kunden/${id}/profil`);
  };

  return (
    <div className="safe-top">
      <header className="px-4 pt-3 pb-3 sticky top-0 bg-bg/95 backdrop-blur z-30">
        <div className="flex items-center justify-between mb-3 min-h-[40px]">
          <Logo />
          <span className="text-xs text-muted">
            {customers ? `${customers.length} Kunde${customers.length === 1 ? '' : 'n'}` : ''}
          </span>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Name oder Telefon"
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

      <ul className="px-4 pt-1 pb-4 space-y-2">
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
          <li key={c.id}>
            <Link
              to={`/kunden/${c.id}`}
              className="flex items-center gap-3 bg-surface rounded-2xl p-3 ring-1 ring-black/5 shadow-sm shadow-black/[0.02] active:bg-surface2 transition-colors duration-200"
            >
              {c.foto ? (
                <img
                  src={c.foto}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center text-muted shrink-0">
                  <User size={22} strokeWidth={1.5} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">
                  {c.vorname || c.nachname
                    ? `${c.vorname} ${c.nachname}`.trim()
                    : <span className="text-muted">Unbenannt</span>}
                </div>
                <div className="text-sm text-muted truncate">
                  {c.telefon || '—'}
                </div>
              </div>
            </Link>
          </li>
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
    </div>
  );
}
