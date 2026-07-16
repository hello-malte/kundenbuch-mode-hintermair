import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import {
  updateOrderAppointment,
  SAISON_LABELS_ALL,
  shortYear
} from '../../db/database';

function vorjahrLabel(saison, saison_jahr) {
  if (!saison || !saison_jahr) return 'Vorjahr';
  const jahrNum = parseInt(saison_jahr, 10);
  if (isNaN(jahrNum)) return 'Vorjahr';
  const label = SAISON_LABELS_ALL[saison] || '';
  return `${label}${shortYear(String(jahrNum - 1))}`;
}

export default function OrderKonditionenTab({ appointment }) {
  const [form, setForm] = useState({
    vorjahr_order_wert: appointment.vorjahr_order_wert || '',
    vorjahr_order_stueckzahl: appointment.vorjahr_order_stueckzahl || '',
    budget_wert: appointment.budget_wert || '',
    budget_stueckzahl: appointment.budget_stueckzahl || '',
    liefertermin_von: appointment.liefertermin_von || '',
    liefertermin_bis: appointment.liefertermin_bis || '',
    konditionen: appointment.konditionen || ''
  });
  const skipRef = useRef(true);
  const saveTimerRef = useRef(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setForm({
      vorjahr_order_wert: appointment.vorjahr_order_wert || '',
      vorjahr_order_stueckzahl: appointment.vorjahr_order_stueckzahl || '',
      budget_wert: appointment.budget_wert || '',
      budget_stueckzahl: appointment.budget_stueckzahl || '',
      liefertermin_von: appointment.liefertermin_von || '',
      liefertermin_bis: appointment.liefertermin_bis || '',
      konditionen: appointment.konditionen || ''
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

  const vorjahr = vorjahrLabel(appointment.saison, appointment.saison_jahr);

  return (
    <div className="space-y-4 pb-4">
      <section className="bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] p-4 space-y-3">
        <h3 className="text-xs uppercase tracking-[0.15em] text-brand font-bold">
          {vorjahr}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted mb-1 block">Order (€)</span>
            <input
              type="number"
              inputMode="decimal"
              value={form.vorjahr_order_wert}
              onChange={(e) => set('vorjahr_order_wert', e.target.value)}
              placeholder="0"
              className="w-full bg-surface2 rounded-lg px-3 py-2.5 outline-none ring-1 ring-brand/40 focus:ring-2 focus:ring-brand text-base"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted mb-1 block">Stückzahl</span>
            <input
              type="number"
              inputMode="numeric"
              value={form.vorjahr_order_stueckzahl}
              onChange={(e) => set('vorjahr_order_stueckzahl', e.target.value)}
              placeholder="0"
              className="w-full bg-surface2 rounded-lg px-3 py-2.5 outline-none ring-1 ring-brand/40 focus:ring-2 focus:ring-brand text-base"
            />
          </label>
        </div>
      </section>

      <section className="bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted mb-1 block">Budget (€)</span>
            <input
              type="number"
              inputMode="decimal"
              value={form.budget_wert}
              onChange={(e) => set('budget_wert', e.target.value)}
              placeholder="0"
              className="w-full bg-surface2 rounded-lg px-3 py-2.5 outline-none ring-1 ring-brand/40 focus:ring-2 focus:ring-brand text-base"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted mb-1 block">Stückzahl</span>
            <input
              type="number"
              inputMode="numeric"
              value={form.budget_stueckzahl}
              onChange={(e) => set('budget_stueckzahl', e.target.value)}
              placeholder="0"
              className="w-full bg-surface2 rounded-lg px-3 py-2.5 outline-none ring-1 ring-brand/40 focus:ring-2 focus:ring-brand text-base"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted mb-1 block">
              Liefertermin von
            </span>
            <input
              type="date"
              value={form.liefertermin_von}
              onChange={(e) => set('liefertermin_von', e.target.value)}
              className="w-full bg-surface2 rounded-lg px-3 py-2.5 outline-none ring-1 ring-brand/40 focus:ring-2 focus:ring-brand text-base text-left"
              style={{ colorScheme: 'light' }}
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted mb-1 block">bis</span>
            <input
              type="date"
              value={form.liefertermin_bis}
              onChange={(e) => set('liefertermin_bis', e.target.value)}
              className="w-full bg-surface2 rounded-lg px-3 py-2.5 outline-none ring-1 ring-brand/40 focus:ring-2 focus:ring-brand text-base text-left"
              style={{ colorScheme: 'light' }}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-muted mb-1 block">Konditionen</span>
          <textarea
            value={form.konditionen}
            onChange={(e) => set('konditionen', e.target.value)}
            rows={5}
            placeholder="Discount, Retouren-Vereinbarung, Beteiligung …"
            className="w-full bg-surface2 rounded-lg p-3 outline-none resize-y ring-1 ring-brand/40 focus:ring-2 focus:ring-brand text-base"
          />
        </label>
      </section>

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
