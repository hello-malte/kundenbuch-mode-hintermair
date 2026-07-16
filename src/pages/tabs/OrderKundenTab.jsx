import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { User, Heart } from 'lucide-react';
import { db } from '../../db/database';

export default function OrderKundenTab({ supplier }) {
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

  if (!supplier) {
    return (
      <div className="py-12 text-center text-muted">
        <p className="text-sm">Kein Lieferant verknüpft.</p>
      </div>
    );
  }

  if (wishes.length === 0) {
    return (
      <div className="py-12 text-center text-muted">
        <Heart size={28} className="text-brand/40 mx-auto mb-2" />
        <p className="text-sm max-w-xs mx-auto">
          Kein Kunde hat{' '}
          <span className="text-ink font-medium">
            {supplier.lieferanten_name}
          </span>{' '}
          in seiner Order-Liste.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {offen.length > 0 && (
        <section>
          <h3 className="text-xs uppercase tracking-wider text-brand font-medium mb-2 px-1">
            Offen ({offen.length})
          </h3>
          <ul className="space-y-2">
            {offen.map((w) => (
              <WishRow key={w.id} wish={w} />
            ))}
          </ul>
        </section>
      )}

      {erledigt.length > 0 && (
        <section>
          <h3 className="text-xs uppercase tracking-wider text-muted font-medium mb-2 px-1">
            Erledigt ({erledigt.length})
          </h3>
          <ul className="space-y-2">
            {erledigt.map((w) => (
              <WishRow key={w.id} wish={w} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function WishRow({ wish }) {
  const c = wish.customer;
  const name =
    `${c.nachname || ''}, ${c.vorname || ''}`.replace(/^, |, $/g, '') ||
    'Unbenannt';
  return (
    <li>
      <Link
        to={`/verkauf/kunden/${c.id}/order`}
        className={`flex items-center gap-3 bg-surface rounded-xl p-3 ring-1 ring-black/5 shadow-sm shadow-black/[0.02] active:bg-surface2 transition-colors ${
          wish.erledigt ? 'opacity-60' : ''
        }`}
      >
        {c.foto ? (
          <img
            src={c.foto}
            alt=""
            className="w-11 h-11 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-surface2 flex items-center justify-center text-muted shrink-0">
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
