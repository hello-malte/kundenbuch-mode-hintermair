import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Calendar, Plus } from 'lucide-react';
import {
  db,
  createOrderAppointment,
  SAISON_OPTIONS
} from '../../db/database';

const SAISON_LABELS = Object.fromEntries(
  SAISON_OPTIONS.map((s) => [s.value, s.label])
);

export default function SupplierTermineTab({ supplierId }) {
  const navigate = useNavigate();

  const appointments = useLiveQuery(
    async () =>
      db.order_appointments
        .where('lieferant_id')
        .equals(supplierId)
        .toArray(),
    [supplierId]
  );

  const handleNew = async () => {
    const id = await createOrderAppointment({ lieferant_id: supplierId });
    navigate(`/einkauf/termine/${id}`);
  };

  const list = appointments || [];
  const nowIso = new Date().toISOString();
  const upcoming = list
    .filter((a) => (a.termin_am || '') >= nowIso)
    .sort((a, b) =>
      (a.termin_am || a.erstellt_am || '').localeCompare(
        b.termin_am || b.erstellt_am || ''
      )
    );
  const past = list
    .filter((a) => (a.termin_am || '') < nowIso)
    .sort((a, b) =>
      (b.termin_am || b.erstellt_am || '').localeCompare(
        a.termin_am || a.erstellt_am || ''
      )
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-2 bg-brand text-white font-medium rounded-full px-4 py-2 active:scale-95 transition-transform duration-200"
        >
          <Plus size={16} /> Neue Order
        </button>
      </div>

      {list.length === 0 && (
        <div className="py-12 text-center text-muted">
          <Calendar size={28} className="text-brand/40 mx-auto mb-2" />
          <p className="text-sm">Noch keine Order-Termine.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <section>
          <h3 className="text-xs uppercase tracking-wider text-brand font-medium mb-2 px-1">
            Anstehend
          </h3>
          <ul className="space-y-2">
            {upcoming.map((a) => (
              <AppointmentRow key={a.id} appointment={a} />
            ))}
          </ul>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h3 className="text-xs uppercase tracking-wider text-muted font-medium mb-2 px-1">
            Vergangen
          </h3>
          <ul className="space-y-2">
            {past.map((a) => (
              <AppointmentRow key={a.id} appointment={a} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function AppointmentRow({ appointment }) {
  const a = appointment;
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
        className="block bg-surface rounded-xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] p-3 active:bg-surface2 transition-colors duration-200"
      >
        <div className="text-brand font-bold text-sm leading-tight">
          {dateLine}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted mt-1">
          {saisonLabel && (
            <span>
              {saisonLabel}
              {a.saison_jahr ? ` ${a.saison_jahr}` : ''}
            </span>
          )}
          {a.budget_wert && <span>· {a.budget_wert} €</span>}
          {artikelCount > 0 && <span>· {artikelCount} Artikel</span>}
        </div>
      </Link>
    </li>
  );
}
