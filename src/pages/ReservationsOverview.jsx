import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Bookmark, Search, X } from 'lucide-react';
import { db, toggleReservationDone } from '../db/database';
import { OverviewRow } from './AlterationsOverview';
import Logo from '../components/Logo';

export default function ReservationsOverview() {
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [q, setQ] = useState('');

  const data = useLiveQuery(async () => {
    const [items, customers] = await Promise.all([
      db.reservations.toArray(),
      db.customers.toArray()
    ]);
    const map = new Map(customers.map((c) => [c.id, c]));
    return items
      .map((i) => ({ ...i, customer: map.get(i.kunden_id) }))
      .filter((i) => i.customer)
      .sort((a, b) =>
        (b.erstellt_am || '').localeCompare(a.erstellt_am || '')
      );
  }, []);

  const filtered = useMemo(() => {
    if (data === undefined) return [];
    const t = q.trim().toLowerCase();
    return data.filter((i) => {
      if (onlyOpen && i.erledigt) return false;
      if (!t) return true;
      const name = `${i.customer.vorname || ''} ${i.customer.nachname || ''}`.toLowerCase();
      return name.includes(t);
    });
  }, [data, onlyOpen, q]);

  if (data === undefined) {
    return <div className="p-8 text-muted">Lade …</div>;
  }

  const totalOpen = data.filter((i) => !i.erledigt).length;

  return (
    <div className="safe-top">
      <header className="px-4 pt-3 pb-3 sticky top-0 bg-bg/95 backdrop-blur z-30">
        <div className="flex items-center justify-between mb-3 min-h-[40px]">
          <Logo />
          <Bookmark size={22} className="text-brand" />
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Nachname"
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

      <div className="px-4 flex items-center justify-between mb-3 mt-1">
        <span className="text-sm text-muted">
          {totalOpen} offen · {data.length} insgesamt
        </span>
        <label className="text-sm text-muted inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
            className="accent-brand w-4 h-4"
          />
          Nur offene
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="text-muted text-center py-16 px-6">
          {data.length === 0 ? (
            <>
              Noch keine Reservierungen erfasst.
              <br />
              Lege Reservierungen im Kundenprofil unter{' '}
              <span className="text-brand">Reservierungen</span> an.
            </>
          ) : (
            <>Keine offenen Reservierungen. Aktiviere &quot;Nur offene&quot; aus, um alle zu sehen.</>
          )}
        </div>
      ) : (
        <ul className="px-4 space-y-2 pb-4">
          {filtered.map((i) => (
            <OverviewRow
              key={i.id}
              item={i}
              hrefTab="reservierungen"
              onToggle={(val) => toggleReservationDone(i.id, val)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
