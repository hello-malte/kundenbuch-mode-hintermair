import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Calendar, Plus, X, Truck } from 'lucide-react';
import { db, createOrderAppointment, SAISON_OPTIONS } from '../db/database';
import Logo from '../components/Logo';

const SAISON_LABELS = Object.fromEntries(SAISON_OPTIONS.map((s) => [s.value, s.label]));

export default function OrderDatesOverview() {
  const [picking, setPicking] = useState(false);
  const navigate = useNavigate();

  const data = useLiveQuery(async () => {
    const [appts, suppliers] = await Promise.all([
      db.order_appointments.toArray(),
      db.suppliers.toArray()
    ]);
    const map = new Map(suppliers.map((s) => [s.id, s]));
    return appts
      .map((a) => ({ ...a, supplier: map.get(a.lieferant_id) }))
      .sort((a, b) =>
        (b.termin_am || b.erstellt_am || '').localeCompare(
          a.termin_am || a.erstellt_am || ''
        )
      );
  }, []);

  if (data === undefined) {
    return <div className="p-8 text-muted">Lade …</div>;
  }

  const nowIso = new Date().toISOString();
  const upcoming = data.filter((a) => (a.termin_am || '') >= nowIso);
  const past = data.filter((a) => (a.termin_am || '') < nowIso);

  return (
    <div className="safe-top">
      <header className="px-4 pt-3 pb-3 sticky top-0 bg-bg/95 backdrop-blur z-30">
        <div className="flex items-center justify-between mb-3 min-h-[40px]">
          <Logo />
          <Calendar size={22} className="text-brand" />
        </div>
      </header>

      {data.length === 0 ? (
        <div className="text-muted text-center py-16 px-6">
          Noch keine Order.
          <br />
          Tippe auf <span className="text-brand">+</span> um eine neue Order anzulegen.
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-6">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-wider text-brand font-medium mb-2 px-1">
                Anstehend
              </h2>
              <ul className="space-y-2">
                {upcoming.map((a) => (
                  <AppointmentRow key={a.id} appointment={a} />
                ))}
              </ul>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-wider text-muted font-medium mb-2 px-1">
                Vergangen
              </h2>
              <ul className="space-y-2">
                {past.map((a) => (
                  <AppointmentRow key={a.id} appointment={a} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <button
        onClick={() => setPicking(true)}
        className="fixed right-4 z-30 w-14 h-14 rounded-full bg-brand text-white flex items-center justify-center shadow-xl shadow-brand/30 active:scale-95 transition-transform duration-200"
        style={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}
        aria-label="Neue Order"
      >
        <Plus size={26} strokeWidth={2.4} />
      </button>

      {picking && (
        <SupplierPicker
          onCancel={() => setPicking(false)}
          onPick={async (supplierId) => {
            const id = await createOrderAppointment({ lieferant_id: supplierId });
            setPicking(false);
            navigate(`/einkauf/termine/${id}`);
          }}
        />
      )}
    </div>
  );
}

function AppointmentRow({ appointment }) {
  const a = appointment;
  const supplier = a.supplier;
  const supplierName = supplier?.lieferanten_name || 'Unbekannter Lieferant';

  let dateLine = 'Kein Termin';
  if (a.termin_am) {
    const d = new Date(a.termin_am);
    dateLine =
      d.toLocaleDateString('de-DE', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) +
      ' · ' +
      d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  const saisonLabel = SAISON_LABELS[a.saison];
  const artikelCount = (a.artikel || []).length;

  return (
    <li>
      <Link
        to={`/einkauf/termine/${a.id}`}
        className="block bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] p-3 active:bg-surface2 transition-colors duration-200"
      >
        <div className="text-brand font-bold text-base leading-tight">
          {dateLine}
        </div>
        <div className="font-medium mt-0.5 truncate">{supplierName}</div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted mt-1">
          {saisonLabel && (
            <span>
              {saisonLabel}
              {a.saison_jahr ? ` ${a.saison_jahr}` : ''}
            </span>
          )}
          {a.budget_wert && <span>· {a.budget_wert} €</span>}
          {a.budget_stueckzahl && <span>· {a.budget_stueckzahl} Stk.</span>}
          {artikelCount > 0 && (
            <span>
              · {artikelCount} Artikel
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

function SupplierPicker({ onCancel, onPick }) {
  const suppliers = useLiveQuery(
    () =>
      db.suppliers
        .filter((s) => (s.lieferanten_name || '').trim().length > 0)
        .toArray(),
    []
  );

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
      <div className="relative w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl ring-1 ring-black/5 shadow-2xl safe-bottom max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h2 className="text-lg font-semibold">Lieferant wählen</h2>
          <button
            onClick={onCancel}
            className="p-1.5 text-muted active:opacity-60"
            aria-label="Schließen"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-4 pb-4 overflow-y-auto scroll-touch">
          {suppliers === undefined ? (
            <div className="text-muted text-center py-10">Lade …</div>
          ) : suppliers.length === 0 ? (
            <div className="text-muted text-center py-10 px-4 text-sm">
              Noch keine Lieferanten angelegt. Lege erst einen{' '}
              <Link to="/einkauf/lieferanten" className="text-brand underline">
                Lieferanten an
              </Link>
              , bevor du Termine einträgst.
            </div>
          ) : (
            <ul className="space-y-2">
              {suppliers.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => onPick(s.id)}
                    className="w-full flex items-center gap-3 bg-surface2 rounded-xl p-3 active:opacity-80 text-left"
                  >
                    {s.foto ? (
                      <img
                        src={s.foto}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted shrink-0">
                        <Truck size={18} strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {s.lieferanten_name}
                      </div>
                      {(s.vorname || s.nachname) && (
                        <div className="text-xs text-muted truncate">
                          {s.vorname} {s.nachname}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
