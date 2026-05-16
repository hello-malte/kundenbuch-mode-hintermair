import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Share2, Search, X } from 'lucide-react';
import { db } from '../db/database';
import { shareText } from '../utils/share';
import Logo from '../components/Logo';

export default function OrderOverview() {
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [q, setQ] = useState('');
  const [toast, setToast] = useState('');

  const data = useLiveQuery(async () => {
    const [items, customers] = await Promise.all([
      db.order_items.toArray(),
      db.customers.toArray()
    ]);
    const map = new Map(customers.map((c) => [c.id, c]));
    return items
      .map((i) => ({ ...i, customer: map.get(i.kunden_id) }))
      .filter((i) => i.customer);
  }, []);

  if (data === undefined) {
    return <div className="p-8 text-muted">Lade …</div>;
  }

  const t = q.trim().toLowerCase();
  const filtered = data.filter((i) => {
    if (onlyOpen && i.erledigt) return false;
    if (!t) return true;
    return (i.brand || '').toLowerCase().includes(t);
  });
  const byBrand = {};
  for (const i of filtered) {
    const b = i.brand.trim().toUpperCase();
    if (!byBrand[b]) byBrand[b] = [];
    byBrand[b].push(i);
  }
  const brands = Object.keys(byBrand).sort((a, b) => a.localeCompare(b, 'de'));

  for (const b of brands) {
    byBrand[b].sort((a, b) =>
      (a.customer.nachname || '').localeCompare(b.customer.nachname || '', 'de')
    );
  }

  const buildText = () => {
    const today = new Date().toLocaleDateString('de-DE');
    const lines = [`Order — ${today}`, ''];
    for (const b of brands) {
      lines.push(b);
      for (const i of byBrand[b]) {
        const c = i.customer;
        const marker = i.erledigt ? '✓' : '•';
        const name = `${c.nachname || ''}, ${c.vorname || ''}`.replace(/^, |, $/g, '');
        lines.push(`  ${marker} ${name}${i.notiz ? ' — ' + i.notiz : ''}`);
      }
      lines.push('');
    }
    return lines.join('\n').trimEnd();
  };

  const handleShare = async () => {
    if (!brands.length) return;
    const res = await shareText('Order', buildText());
    if (res === 'copied') {
      setToast('In die Zwischenablage kopiert');
      setTimeout(() => setToast(''), 2000);
    } else if (res === 'unsupported') {
      setToast('Teilen nicht verfügbar');
      setTimeout(() => setToast(''), 2000);
    }
  };

  return (
    <div className="safe-top">
      <header className="px-4 pt-3 pb-3 sticky top-0 bg-bg/95 backdrop-blur z-30">
        <div className="flex items-center justify-between mb-3 min-h-[40px]">
          <Logo />
          <button
            onClick={handleShare}
            disabled={!brands.length}
            className="p-2 text-brand disabled:opacity-30 active:opacity-60"
            aria-label="Teilen"
          >
            <Share2 size={22} />
          </button>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Brand"
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
          {filtered.length} Eintrag{filtered.length === 1 ? '' : 'e'} ·{' '}
          {brands.length} Brand{brands.length === 1 ? '' : 's'}
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

      {brands.length === 0 ? (
        <div className="text-muted text-center py-16 px-6">
          {data.length === 0 ? (
            <>
              Noch keine Order-Einträge.
              <br />
              Lege Brands im Kundenprofil unter{' '}
              <span className="text-brand">Order</span> an.
            </>
          ) : (
            <>Alle Einträge sind erledigt. Aktiviere &quot;Nur offene&quot; aus, um sie zu sehen.</>
          )}
        </div>
      ) : (
        <ul className="px-4 space-y-5 pb-4">
          {brands.map((b) => (
            <li key={b}>
              <h2 className="text-brand font-semibold tracking-wider text-sm uppercase mb-2 px-1">
                {b}
              </h2>
              <ul className="bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] divide-y divide-black/5 overflow-hidden">
                {byBrand[b].map((i) => (
                  <li key={i.id}>
                    <Link
                      to={`/kunden/${i.customer.id}/order`}
                      className={`flex items-start justify-between gap-3 p-3 active:bg-surface2 transition-colors duration-200 ${
                        i.erledigt ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div
                          className={`font-medium ${
                            i.erledigt ? 'line-through' : ''
                          }`}
                        >
                          {i.customer.nachname || '—'}
                          {i.customer.vorname ? `, ${i.customer.vorname}` : ''}
                        </div>
                        {i.notiz && (
                          <div className="text-sm text-muted break-words">
                            {i.notiz}
                          </div>
                        )}
                      </div>
                      {i.erledigt && (
                        <span className="text-xs text-brand shrink-0 mt-1">✓</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 bg-ink text-white text-sm rounded-full px-4 py-2 shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
