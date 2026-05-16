import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Bookmark } from 'lucide-react';
import { db, toggleReservationDone } from '../db/database';
import { OverviewRow } from './AlterationsOverview';

export default function ReservationsOverview() {
  const [onlyOpen, setOnlyOpen] = useState(true);

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

  if (data === undefined) {
    return <div className="p-8 text-muted">Lade …</div>;
  }

  const filtered = data.filter((i) => !onlyOpen || !i.erledigt);
  const totalOpen = data.filter((i) => !i.erledigt).length;

  return (
    <div className="safe-top">
      <header className="px-4 pt-3 pb-3 sticky top-0 bg-bg/95 backdrop-blur z-30 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Reservierungen</h1>
        <Bookmark size={22} className="text-brand" />
      </header>

      <div className="px-4 flex items-center justify-between mb-3">
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
