import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { X, Heart, User } from 'lucide-react';
import { db } from '../db/database';

export default function SupplierWishesSheet({ supplier, onClose }) {
  const wishes = useLiveQuery(async () => {
    const supplierName = (supplier?.lieferanten_name || '').trim().toLowerCase();
    if (!supplierName) return [];
    const [items, customers] = await Promise.all([
      db.order_items.toArray(),
      db.customers.toArray()
    ]);
    const customerMap = new Map(customers.map((c) => [c.id, c]));
    return items
      .filter((i) => {
        const brand = (i.brand || '').trim().toLowerCase();
        if (!brand) return false;
        return (
          brand === supplierName ||
          brand.includes(supplierName) ||
          supplierName.includes(brand)
        );
      })
      .map((i) => ({ ...i, customer: customerMap.get(i.kunden_id) }))
      .filter((i) => i.customer)
      .sort((a, b) => {
        if (!!a.erledigt !== !!b.erledigt) return a.erledigt ? 1 : -1;
        return (a.customer.nachname || '').localeCompare(
          b.customer.nachname || '',
          'de'
        );
      });
  }, [supplier?.lieferanten_name]) || [];

  const offen = wishes.filter((w) => !w.erledigt);
  const erledigt = wishes.filter((w) => w.erledigt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl ring-1 ring-black/5 shadow-2xl safe-bottom max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0 border-b border-black/5">
          <div className="flex items-center gap-2 min-w-0">
            <Heart size={18} className="text-brand shrink-0" />
            <h2 className="text-lg font-semibold truncate">
              Kundenwünsche
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted active:opacity-60"
            aria-label="Schließen"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-4 overflow-y-auto scroll-touch space-y-4">
          {wishes.length === 0 && (
            <p className="text-sm text-muted text-center py-8">
              Noch keine Kundenwünsche für{' '}
              <span className="font-medium text-ink">
                {supplier?.lieferanten_name}
              </span>
              .
            </p>
          )}

          {offen.length > 0 && (
            <ul className="space-y-2">
              {offen.map((w) => (
                <WishRow key={w.id} wish={w} onNavigate={onClose} />
              ))}
            </ul>
          )}

          {erledigt.length > 0 && (
            <>
              <h3 className="text-xs uppercase tracking-wider text-muted font-medium pt-2 px-1">
                Erledigt
              </h3>
              <ul className="space-y-2">
                {erledigt.map((w) => (
                  <WishRow key={w.id} wish={w} onNavigate={onClose} />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function WishRow({ wish, onNavigate }) {
  const c = wish.customer;
  const name = `${c.nachname || ''}, ${c.vorname || ''}`.replace(/^, |, $/g, '') || 'Unbenannt';
  return (
    <li>
      <Link
        to={`/verkauf/kunden/${c.id}/order`}
        onClick={onNavigate}
        className={`flex items-center gap-3 bg-surface2 rounded-xl p-3 active:opacity-80 ${
          wish.erledigt ? 'opacity-60' : ''
        }`}
      >
        {c.foto ? (
          <img
            src={c.foto}
            alt=""
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted shrink-0">
            <User size={18} strokeWidth={1.5} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div
            className={`font-medium truncate ${
              wish.erledigt ? 'line-through' : ''
            }`}
          >
            {name}
          </div>
          {wish.notiz && (
            <div className="text-sm text-muted break-words">{wish.notiz}</div>
          )}
        </div>
      </Link>
    </li>
  );
}
