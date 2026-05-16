import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Scissors, User, Search, X } from 'lucide-react';
import { db, toggleAlterationDone } from '../db/database';

export default function AlterationsOverview() {
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [q, setQ] = useState('');

  const data = useLiveQuery(async () => {
    const [items, customers] = await Promise.all([
      db.alterations.toArray(),
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

  const dueTomorrow = useMemo(() => {
    if (!data) return [];
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const tomorrowStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return data.filter(
      (i) => !i.erledigt && i.fertig_bis === tomorrowStr
    );
  }, [data]);

  if (data === undefined) {
    return <div className="p-8 text-muted">Lade …</div>;
  }

  const totalOpen = data.filter((i) => !i.erledigt).length;

  return (
    <div className="safe-top">
      <header className="px-4 pt-3 pb-3 sticky top-0 bg-bg/95 backdrop-blur z-30">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-semibold tracking-tight">Änderungen</h1>
          <Scissors size={22} className="text-brand" />
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
                  const name =
                    `${c.vorname || ''} ${c.nachname || ''}`.trim() || 'Unbenannt';
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

      <div className="px-4 flex items-center justify-between mb-3 mt-3">
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
              Noch keine Änderungen erfasst.
              <br />
              Lege Änderungen im Kundenprofil unter{' '}
              <span className="text-brand">Änderungen</span> an.
            </>
          ) : (
            <>Keine offenen Änderungen. Aktiviere &quot;Nur offene&quot; aus, um alle zu sehen.</>
          )}
        </div>
      ) : (
        <ul className="px-4 space-y-2 pb-4">
          {filtered.map((i) => (
            <OverviewRow
              key={i.id}
              item={i}
              hrefTab="aenderungen"
              onToggle={(val) => toggleAlterationDone(i.id, val)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export function OverviewRow({ item, hrefTab, onToggle }) {
  const c = item.customer;
  const date = new Date(item.datum);
  const thumb = item.fotos?.[0];

  return (
    <li
      className={`bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] overflow-hidden ${
        item.erledigt ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-stretch gap-3">
        <input
          type="checkbox"
          checked={!!item.erledigt}
          onChange={(e) => onToggle(e.target.checked)}
          className="ml-3 mt-3 w-5 h-5 accent-brand shrink-0 self-start"
          aria-label="Erledigt"
        />
        <Link
          to={`/kunden/${c.id}/${hrefTab}`}
          className="flex-1 min-w-0 flex items-center gap-3 py-3 pr-3 active:opacity-70 transition-opacity"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="truncate">
                {c.vorname || ''} {c.nachname || ''}
              </span>
              <span>·</span>
              <span>
                {date.toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'short'
                })}
              </span>
            </div>
            {item.beschreibung && (
              <p
                className={`text-sm leading-snug mt-0.5 line-clamp-2 break-words ${
                  item.erledigt ? 'line-through' : ''
                }`}
              >
                {item.beschreibung}
              </p>
            )}
          </div>
          {thumb ? (
            <img
              src={thumb}
              alt=""
              className={`w-16 h-16 rounded-lg object-cover shrink-0 ${
                item.erledigt ? 'grayscale' : ''
              }`}
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-surface2 flex items-center justify-center text-muted shrink-0">
              <User size={20} strokeWidth={1.5} />
            </div>
          )}
        </Link>
      </div>
    </li>
  );
}
