import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Trash2, Calendar, Plus, X, Check } from 'lucide-react';
import {
  db,
  updateOrderAppointment,
  deleteOrderAppointment,
  SAISON_OPTIONS
} from '../db/database';
import { resizeMany } from '../utils/photo';
import { buildOrderAppointmentICS, shareICS } from '../utils/ical';
import PhotoCarousel from '../components/PhotoCarousel';

const emptyArtikel = () => ({ fotos: [], notiz: '' });

export default function OrderAppointmentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tid = Number(id);

  const data = useLiveQuery(async () => {
    const t = await db.order_appointments.get(tid);
    if (!t) return null;
    const supplier = t.lieferant_id
      ? await db.suppliers.get(t.lieferant_id)
      : null;
    return { ...t, supplier };
  }, [tid]);

  const [form, setForm] = useState(null);
  const skipRef = useRef(true);
  const saveTimerRef = useRef(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        termin_am: data.termin_am || '',
        budget_wert: data.budget_wert || '',
        budget_stueckzahl: data.budget_stueckzahl || '',
        liefertermin_von: data.liefertermin_von || '',
        liefertermin_bis: data.liefertermin_bis || '',
        saison: data.saison || '',
        saison_jahr: data.saison_jahr || String(new Date().getFullYear()),
        konditionen: data.konditionen || '',
        artikel: (data.artikel && data.artikel.length ? data.artikel : [emptyArtikel()])
      });
      skipRef.current = true;
    }
  }, [data?.id]);

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    if (!form) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      await updateOrderAppointment(tid, form);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    }, 800);
    return () => clearTimeout(saveTimerRef.current);
  }, [form, tid]);

  if (data === undefined || !form) {
    return <div className="p-8 text-muted">Lade …</div>;
  }
  if (data === null) {
    return (
      <div className="p-8 text-muted">
        Termin nicht gefunden.{' '}
        <button
          onClick={() => navigate('/einkauf/termine')}
          className="text-brand underline"
        >
          Zurück
        </button>
      </div>
    );
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateArtikel = (idx, patch) =>
    setForm((f) => ({
      ...f,
      artikel: f.artikel.map((a, i) => (i === idx ? { ...a, ...patch } : a))
    }));
  const removeArtikel = (idx) =>
    setForm((f) => ({
      ...f,
      artikel: f.artikel.length > 1 ? f.artikel.filter((_, i) => i !== idx) : f.artikel
    }));
  const addArtikel = () =>
    setForm((f) => ({ ...f, artikel: [...f.artikel, emptyArtikel()] }));

  const handleDelete = async () => {
    if (confirm('Order-Termin löschen?')) {
      await deleteOrderAppointment(tid);
      navigate('/einkauf/termine');
    }
  };

  const handleCalendarExport = async () => {
    if (!form.termin_am) {
      alert('Bitte zuerst einen Termin eintragen.');
      return;
    }
    const supplierName = data.supplier?.lieferanten_name || 'Lieferant';
    const saisonLabel = SAISON_OPTIONS.find((s) => s.value === form.saison)?.label || '';
    const summary = `Order ${supplierName}${saisonLabel ? ` – ${saisonLabel} ${form.saison_jahr || ''}` : ''}`.trim();
    const lines = [];
    if (form.budget_wert) lines.push(`Budget: ${form.budget_wert} €`);
    if (form.budget_stueckzahl) lines.push(`Stückzahl: ${form.budget_stueckzahl}`);
    if (form.liefertermin_von || form.liefertermin_bis) {
      lines.push(
        `Liefertermin: ${form.liefertermin_von || '–'} bis ${form.liefertermin_bis || '–'}`
      );
    }
    if (form.konditionen) lines.push(`Konditionen: ${form.konditionen}`);
    const ics = buildOrderAppointmentICS({
      uid: `kundenbuch-termin-${tid}@mode-hintermair`,
      summary,
      description: lines.join('\n'),
      location:
        [data.supplier?.strasse, data.supplier?.plz, data.supplier?.ort]
          .filter(Boolean)
          .join(', ') || undefined,
      startDate: form.termin_am
    });
    if (!ics) return;
    const supplierSlug = (data.supplier?.lieferanten_name || 'termin')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    await shareICS(`order-${supplierSlug}.ics`, ics);
  };

  const displaySupplierName =
    data.supplier?.lieferanten_name || 'Unbekannter Lieferant';

  return (
    <div className="safe-top">
      <header className="sticky top-0 bg-bg/95 backdrop-blur z-30 border-b border-black/5">
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            onClick={() => navigate('/einkauf/termine')}
            className="p-2 active:opacity-60"
            aria-label="Zurück"
          >
            <ArrowLeft size={22} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-muted active:opacity-60"
            aria-label="Termin löschen"
          >
            <Trash2 size={20} />
          </button>
        </div>
        <div className="px-4 pb-3">
          <h2 className="text-xl font-semibold leading-tight truncate">
            {data.supplier ? (
              <Link
                to={`/einkauf/lieferanten/${data.supplier.id}`}
                className="text-ink"
              >
                {displaySupplierName}
              </Link>
            ) : (
              displaySupplierName
            )}
          </h2>
          <p className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
            {savedFlash ? (
              <>
                <Check size={12} className="text-brand" /> Auto-gespeichert
              </>
            ) : (
              'Order-Termin · Auto-Speichern aktiv'
            )}
          </p>
        </div>
      </header>

      <div className="px-4 py-4 space-y-5">
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
                    onClick={() =>
                      set('saison', active ? '' : s.value)
                    }
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
              <span className="text-xs text-muted mb-1 block">Liefertermin von</span>
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
              rows={3}
              placeholder="Discount, Retouren-Vereinbarung, Beteiligung …"
              className="w-full bg-surface2 rounded-lg p-3 outline-none resize-y ring-1 ring-brand/40 focus:ring-2 focus:ring-brand text-base"
            />
          </label>
        </section>

        <button
          onClick={handleCalendarExport}
          disabled={!form.termin_am}
          className="w-full inline-flex items-center justify-center gap-2 bg-ink text-white font-medium py-3 rounded-lg disabled:opacity-40 active:opacity-80 transition-opacity"
        >
          <Calendar size={16} /> In Kalender speichern (.ics)
        </button>

        <section className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-brand font-medium px-1">
            Artikel-Erfassung
          </h3>
          <ul className="space-y-3">
            {form.artikel.map((a, idx) => (
              <li
                key={idx}
                className="bg-surface rounded-2xl ring-1 ring-black/5 shadow-sm shadow-black/[0.02] p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted uppercase tracking-wider font-medium">
                    Artikel {idx + 1}
                  </span>
                  {form.artikel.length > 1 && (
                    <button
                      onClick={() => removeArtikel(idx)}
                      className="p-1 text-muted active:text-red-600"
                      aria-label="Artikel entfernen"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <ArtikelEditor
                  artikel={a}
                  onChange={(patch) => updateArtikel(idx, patch)}
                />
              </li>
            ))}
          </ul>
          <button
            onClick={addArtikel}
            className="w-full inline-flex items-center justify-center gap-2 bg-surface ring-1 ring-brand/40 text-ink font-medium py-2.5 rounded-lg active:opacity-80 transition-opacity"
          >
            <Plus size={16} /> Weiteren Artikel hinzufügen
          </button>
        </section>
      </div>
    </div>
  );
}

function ArtikelEditor({ artikel, onChange }) {
  const fileRef = useRef(null);
  const handleFiles = async (e) => {
    const list = Array.from(e.target.files || []);
    e.target.value = '';
    if (!list.length) return;
    const remaining = 5 - artikel.fotos.length;
    const data = await resizeMany(list.slice(0, remaining), 1400);
    onChange({ fotos: [...artikel.fotos, ...data].slice(0, 5) });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto scroll-touch -mx-1 px-1">
        {artikel.fotos.map((p, i) => (
          <div key={i} className="relative shrink-0">
            <img src={p} alt="" className="w-24 h-24 rounded-lg object-cover" />
            <button
              onClick={() =>
                onChange({ fotos: artikel.fotos.filter((_, j) => j !== i) })
              }
              className="absolute -top-1.5 -right-1.5 bg-ink rounded-full p-1 text-white"
              aria-label="Foto entfernen"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {artikel.fotos.length < 5 && (
          <button
            onClick={() => fileRef.current?.click()}
            className="shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-black/15 flex flex-col items-center justify-center text-muted active:bg-surface2"
          >
            <Plus size={20} />
            <span className="text-xs mt-1">{artikel.fotos.length}/5</span>
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      <textarea
        value={artikel.notiz}
        onChange={(e) => onChange({ notiz: e.target.value })}
        placeholder="Artikelnummer, Farbe, freier Text …"
        rows={2}
        className="w-full bg-surface2 rounded-lg p-3 text-sm outline-none resize-none ring-1 ring-brand/40 focus:ring-2 focus:ring-brand"
      />
    </div>
  );
}
