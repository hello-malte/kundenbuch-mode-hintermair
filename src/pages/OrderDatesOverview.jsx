import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Calendar, Plus, X, Truck, SlidersHorizontal } from 'lucide-react';
import {
  db,
  createOrderAppointment,
  SAISON_OPTIONS,
  SAISON_LABELS_ALL,
  SUPPLIER_KATEGORIEN,
  shortYear
} from '../db/database';
import Logo from '../components/Logo';

const KATEGORIE_LABELS = Object.fromEntries(
  SUPPLIER_KATEGORIEN.map((k) => [k.value, k.label])
);

export default function OrderDatesOverview() {
  const [picking, setPicking] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState({
    abteilung: '',
    saison: '',
    saison_jahr: ''
  });
  const navigate = useNavigate();

  const data = useLiveQuery(async () => {
    const [appts, suppliers] = await Promise.all([
      db.order_appointments.toArray(),
      db.suppliers.toArray()
    ]);
    const map = new Map(suppliers.map((s) => [s.id, s]));
    return appts.map((a) => ({ ...a, supplier: map.get(a.lieferant_id) }));
  }, []);

  const hasActiveFilter = Boolean(
    filter.abteilung || filter.saison || filter.saison_jahr
  );

  const filtered = useMemo(() => {
    const list = data || [];
    if (!hasActiveFilter) return list;
    return list.filter((a) => {
      if (filter.saison && a.saison !== filter.saison) return false;
      if (
        filter.saison_jahr &&
        String(a.saison_jahr || '') !== filter.saison_jahr
      )
        return false;
      if (filter.abteilung) {
        const abt = a.abteilungen || [];
        if (!abt.includes(filter.abteilung)) return false;
      }
      return true;
    });
  }, [data, filter, hasActiveFilter]);

  if (data === undefined) {
    return <div className="p-8 text-muted">Lade …</div>;
  }

  const nowIso = new Date().toISOString();
  const upcoming = filtered
    .filter((a) => (a.termin_am || '') >= nowIso)
    .sort((a, b) =>
      (a.termin_am || a.erstellt_am || '').localeCompare(
        b.termin_am || b.erstellt_am || ''
      )
    );
  const past = filtered
    .filter((a) => (a.termin_am || '') < nowIso)
    .sort((a, b) =>
      (b.termin_am || b.erstellt_am || '').localeCompare(
        a.termin_am || a.erstellt_am || ''
      )
    );

  const totalBudget = filtered.reduce(
    (sum, a) => sum + (parseFloat(a.budget_wert) || 0),
    0
  );
  const totalStueck = filtered.reduce(
    (sum, a) => sum + (parseFloat(a.budget_stueckzahl) || 0),
    0
  );

  return (
    <div className="safe-top">
      <header className="px-4 pt-3 pb-3 sticky top-0 bg-bg/95 backdrop-blur z-30">
        <div className="flex items-center justify-between mb-3 min-h-[40px]">
          <Logo />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterOpen(true)}
              className={`p-2 active:opacity-60 relative ${
                hasActiveFilter ? 'text-brand' : 'text-muted'
              }`}
              aria-label="Filter"
            >
              <SlidersHorizontal size={22} />
              {hasActiveFilter && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand ring-2 ring-bg" />
              )}
            </button>
            <Calendar size={22} className="text-brand" />
          </div>
        </div>

        {hasActiveFilter && (
          <div className="bg-brand/10 ring-1 ring-brand/30 rounded-2xl p-3 mb-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="text-[10px] uppercase tracking-[0.15em] text-brand font-medium">
                Filter aktiv
              </div>
              <button
                onClick={() =>
                  setFilter({ abteilung: '', saison: '', saison_jahr: '' })
                }
                className="text-xs text-brand active:opacity-60"
              >
                Zurücksetzen
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {filter.abteilung && (
                <Chip label={KATEGORIE_LABELS[filter.abteilung]} />
              )}
              {filter.saison && (
                <Chip
                  label={`${SAISON_LABELS_ALL[filter.saison]}${
                    filter.saison_jahr ? shortYear(filter.saison_jahr) : ''
                  }`}
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <SumBox label="Budget" value={`${totalBudget.toLocaleString('de-DE')} €`} />
              <SumBox label="Stück" value={totalStueck.toLocaleString('de-DE')} />
            </div>
          </div>
        )}
      </header>

      {filtered.length === 0 ? (
        <div className="text-muted text-center py-16 px-6">
          {hasActiveFilter ? (
            <>Keine Order für diese Auswahl.</>
          ) : (
            <>
              Noch keine Order.
              <br />
              Tippe auf <span className="text-brand">+</span> um eine neue Order anzulegen.
            </>
          )}
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

      {filterOpen && (
        <FilterSheet
          filter={filter}
          onApply={(f) => {
            setFilter(f);
            setFilterOpen(false);
          }}
          onCancel={() => setFilterOpen(false)}
        />
      )}
    </div>
  );
}

function Chip({ label }) {
  return (
    <span className="inline-block bg-brand text-white rounded-full px-2.5 py-0.5 text-xs font-medium">
      {label}
    </span>
  );
}

function SumBox({ label, value }) {
  return (
    <div className="bg-surface rounded-xl p-2.5 ring-1 ring-brand/20">
      <div className="text-[10px] uppercase tracking-wider text-muted font-medium">
        {label}
      </div>
      <div className="text-base font-bold text-ink leading-tight mt-0.5 truncate">
        {value}
      </div>
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
  const saisonLabel = SAISON_LABELS_ALL[a.saison];
  const artikelCount = (a.artikel || []).length;
  const abteilungen = (a.abteilungen || [])
    .map((v) => KATEGORIE_LABELS[v])
    .filter(Boolean);

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
              {a.saison_jahr ? shortYear(a.saison_jahr) : ''}
            </span>
          )}
          {abteilungen.length > 0 && (
            <span className="text-brand">· {abteilungen.join(', ')}</span>
          )}
          {a.budget_wert && <span>· {a.budget_wert} €</span>}
          {a.budget_stueckzahl && <span>· {a.budget_stueckzahl} Stk.</span>}
          {artikelCount > 0 && <span>· {artikelCount} Artikel</span>}
        </div>
      </Link>
    </li>
  );
}

function FilterSheet({ filter, onApply, onCancel }) {
  const [f, setF] = useState(filter);

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
      <div className="relative w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl ring-1 ring-black/5 shadow-2xl safe-bottom max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h2 className="text-lg font-semibold">Filter</h2>
          <button
            onClick={onCancel}
            className="p-1.5 text-muted active:opacity-60"
            aria-label="Schließen"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-5 pb-4 overflow-y-auto scroll-touch space-y-5">
          <div>
            <span className="text-xs text-muted mb-2 block">Abteilung</span>
            <div className="flex flex-wrap gap-2">
              {SUPPLIER_KATEGORIEN.map((k) => {
                const active = f.abteilung === k.value;
                return (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() =>
                      setF((prev) => ({
                        ...prev,
                        abteilung: active ? '' : k.value
                      }))
                    }
                    className={`px-3 py-2 rounded-full text-sm font-medium ring-1 transition-colors ${
                      active
                        ? 'bg-brand text-white ring-brand'
                        : 'bg-surface text-ink ring-brand/40 active:bg-surface2'
                    }`}
                  >
                    {k.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-xs text-muted mb-2 block">Saison</span>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const yr = new Date().getFullYear();
                const buttons = [
                  { saison: 'fruehjahr_sommer', jahr: String(yr) },
                  { saison: 'herbst_winter', jahr: String(yr) },
                  { saison: 'fruehjahr_sommer', jahr: String(yr + 1) },
                  { saison: 'herbst_winter', jahr: String(yr + 1) }
                ];
                if (
                  f.saison &&
                  f.saison_jahr &&
                  !buttons.some(
                    (b) => b.saison === f.saison && b.jahr === f.saison_jahr
                  )
                ) {
                  buttons.unshift({ saison: f.saison, jahr: f.saison_jahr });
                }
                return buttons.map((b) => {
                  const active =
                    f.saison === b.saison && f.saison_jahr === b.jahr;
                  return (
                    <button
                      key={`${b.saison}-${b.jahr}`}
                      type="button"
                      onClick={() =>
                        setF((prev) => ({
                          ...prev,
                          saison: active ? '' : b.saison,
                          saison_jahr: active ? '' : b.jahr
                        }))
                      }
                      className={`px-3 py-2 rounded-full text-sm font-medium ring-1 transition-colors ${
                        active
                          ? 'bg-brand text-white ring-brand'
                          : 'bg-surface text-ink ring-brand/40 active:bg-surface2'
                      }`}
                    >
                      {SAISON_LABELS_ALL[b.saison]}
                      {shortYear(b.jahr)}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 flex gap-2 shrink-0">
          <button
            onClick={() => onApply({ abteilung: '', saison: '', saison_jahr: '' })}
            className="flex-1 bg-surface2 text-ink font-medium py-3 rounded-xl active:opacity-80"
          >
            Zurücksetzen
          </button>
          <button
            onClick={() => onApply(f)}
            className="flex-1 bg-brand text-white font-medium py-3 rounded-xl active:opacity-80"
          >
            Anwenden
          </button>
        </div>
      </div>
    </div>
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
