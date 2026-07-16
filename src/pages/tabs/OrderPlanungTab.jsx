import { useState, useEffect, useRef } from 'react';
import { Calendar, Check } from 'lucide-react';
import {
  updateOrderAppointment,
  SAISON_OPTIONS,
  SAISON_LABELS_ALL,
  SUPPLIER_KATEGORIEN
} from '../../db/database';
import { buildOrderAppointmentICS, shareICS } from '../../utils/ical';

export default function OrderPlanungTab({ appointment, supplier }) {
  const [form, setForm] = useState({
    termin_am: appointment.termin_am || '',
    saison: appointment.saison || 'fruehjahr_sommer',
    saison_jahr:
      appointment.saison_jahr || String(new Date().getFullYear()),
    abteilungen: appointment.abteilungen || []
  });
  const skipRef = useRef(true);
  const saveTimerRef = useRef(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setForm({
      termin_am: appointment.termin_am || '',
      saison: appointment.saison || 'fruehjahr_sommer',
      saison_jahr:
        appointment.saison_jahr || String(new Date().getFullYear()),
      abteilungen: appointment.abteilungen || []
    });
    skipRef.current = true;
  }, [appointment.id]);

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      await updateOrderAppointment(appointment.id, form);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    }, 700);
    return () => clearTimeout(saveTimerRef.current);
  }, [form, appointment.id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCalendarExport = async () => {
    if (!form.termin_am) {
      alert('Bitte zuerst einen Termin eintragen.');
      return;
    }
    const supplierName = supplier?.lieferanten_name || 'Lieferant';
    const saisonLabel = SAISON_LABELS_ALL[form.saison] || '';
    const summary = `Order ${supplierName}${saisonLabel ? ` – ${saisonLabel} ${form.saison_jahr || ''}` : ''}`.trim();
    const lines = [];
    if (appointment.budget_wert) lines.push(`Budget: ${appointment.budget_wert} €`);
    if (appointment.budget_stueckzahl)
      lines.push(`Stückzahl: ${appointment.budget_stueckzahl}`);
    if (appointment.liefertermin_von || appointment.liefertermin_bis) {
      lines.push(
        `Liefertermin: ${appointment.liefertermin_von || '–'} bis ${appointment.liefertermin_bis || '–'}`
      );
    }
    if (appointment.konditionen)
      lines.push(`Konditionen: ${appointment.konditionen}`);
    const ics = buildOrderAppointmentICS({
      uid: `kundenbuch-termin-${appointment.id}@mode-hintermair`,
      summary,
      description: lines.join('\n'),
      location:
        [supplier?.strasse, supplier?.plz, supplier?.ort]
          .filter(Boolean)
          .join(', ') || undefined,
      startDate: form.termin_am
    });
    if (!ics) return;
    const supplierSlug = (supplier?.lieferanten_name || 'termin')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    await shareICS(`order-${supplierSlug}.ics`, ics);
  };

  return (
    <div className="space-y-4 pb-4">
      <section className="bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] p-4 space-y-3">
        <label className="block">
          <span className="text-xs text-muted mb-1 block">Termin</span>
          <input
            type="datetime-local"
            value={form.termin_am}
            onChange={(e) => set('termin_am', e.target.value)}
            className="w-full bg-surface2 rounded-lg px-3 py-2.5 outline-none ring-1 ring-brand/40 focus:ring-2 focus:ring-brand text-base text-left"
            style={{ colorScheme: 'light' }}
          />
        </label>

        <div>
          <span className="text-xs text-muted mb-2 block">Saison</span>
          <div className="flex flex-wrap gap-2">
            {SAISON_OPTIONS.map((s) => {
              const active = form.saison === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set('saison', active ? '' : s.value)}
                  className={`px-3 py-2 rounded-full text-sm font-medium ring-1 transition-colors ${
                    active
                      ? 'bg-brand text-white ring-brand'
                      : 'bg-surface text-ink ring-brand/40 active:bg-surface2'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
            <input
              type="number"
              value={form.saison_jahr}
              onChange={(e) => set('saison_jahr', e.target.value)}
              placeholder="Jahr"
              className="w-20 bg-surface2 rounded-full px-3 py-2 outline-none ring-1 ring-brand/40 focus:ring-2 focus:ring-brand text-sm text-center"
            />
          </div>
        </div>

        <div>
          <span className="text-xs text-muted mb-2 block">Abteilung</span>
          <div className="space-y-2">
            {[
              SUPPLIER_KATEGORIEN.slice(0, 3),
              SUPPLIER_KATEGORIEN.slice(3)
            ].map((row, rowIdx) => (
              <div key={rowIdx} className="flex flex-wrap gap-2">
                {row.map((k) => {
                  const active = (form.abteilungen || []).includes(k.value);
                  return (
                    <button
                      key={k.value}
                      type="button"
                      onClick={() => {
                        const current = form.abteilungen || [];
                        const next = active
                          ? current.filter((v) => v !== k.value)
                          : [...current, k.value];
                        set('abteilungen', next);
                      }}
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
            ))}
          </div>
        </div>
      </section>

      <button
        onClick={handleCalendarExport}
        disabled={!form.termin_am}
        className="w-full inline-flex items-center justify-center gap-2 bg-ink text-white font-medium py-3 rounded-lg disabled:opacity-40 active:opacity-80 transition-opacity"
      >
        <Calendar size={16} /> In Kalender speichern (.ics)
      </button>

      <p className="text-xs text-muted text-center pt-1 flex items-center justify-center gap-1.5">
        {savedFlash ? (
          <>
            <Check size={12} className="text-brand" /> Gespeichert
          </>
        ) : (
          'Auto-Speichern aktiv'
        )}
      </p>
    </div>
  );
}
