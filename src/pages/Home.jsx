import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import QRCode from 'react-qr-code';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Calendar,
  Cake,
  Scissors,
  Sparkles,
  Camera,
  Edit3,
  X,
  Share2
} from 'lucide-react';
import { getCalendarWeek, greetingForHour } from '../utils/calendar';
import { getCurrentWeather, weatherCodeInfo } from '../utils/weather';
import { sharePhoto } from '../utils/share';
import { resizeImage } from '../utils/photo';
import { db } from '../db/database';

const WEATHER_ICON_MAP = {
  sun: Sun,
  'cloud-sun': CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  lightning: CloudLightning
};

const USER_NAME = 'Regina';
const NOTEPAD_KEY = 'kundenbuch-notepad';

const VCARD = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'N:Hintermair;Regina;;;',
  'FN:Regina Hintermair',
  'ORG:Mode Hintermair',
  'ADR;TYPE=WORK:;;Hörmannsberger Str. 14;Ried;;86510;Germany',
  'TEL;TYPE=CELL,VOICE:+4915254044219',
  'TEL;TYPE=WORK,VOICE:+4982335485',
  'EMAIL;TYPE=WORK:regina@mode-hintermair.de',
  'URL:https://www.instagram.com/mode_hintermair',
  'END:VCARD'
].join('\n');

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function Home() {
  const now = new Date();
  const greeting = greetingForHour(now.getHours());
  const weekday = now.toLocaleDateString('de-DE', { weekday: 'long' });
  const day = now.getDate();
  const month = now.toLocaleDateString('de-DE', { month: 'short' });
  const kw = getCalendarWeek(now);

  const [weather, setWeather] = useState(null);
  useEffect(() => {
    let alive = true;
    getCurrentWeather().then((w) => {
      if (alive) setWeather(w);
    });
    return () => {
      alive = false;
    };
  }, []);

  const events = useLiveQuery(async () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const todayMD = `${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const [customers, alterations, appointments, suppliers] = await Promise.all([
      db.customers.toArray(),
      db.alterations.toArray(),
      db.order_appointments.toArray(),
      db.suppliers.toArray()
    ]);
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
    const items = [];
    customers
      .filter((c) => c.geburtstag && c.geburtstag.slice(5) === todayMD)
      .forEach((c) => {
        items.push({
          type: 'birthday',
          id: `b-${c.id}`,
          to: `/verkauf/kunden/${c.id}`,
          label: `${c.vorname || ''} ${c.nachname || ''}`.trim() || 'Geburtstag',
          time: null
        });
      });
    alterations
      .filter((a) => !a.erledigt && a.fertig_bis === todayStr)
      .forEach((a) => {
        const c = customers.find((x) => x.id === a.kunden_id);
        items.push({
          type: 'alteration',
          id: `a-${a.id}`,
          to: c ? `/verkauf/kunden/${c.id}/aenderungen` : '/verkauf/aenderungen',
          label:
            (a.beschreibung || 'Änderung').slice(0, 28) +
            ((a.beschreibung || '').length > 28 ? '…' : ''),
          time: null
        });
      });
    appointments
      .filter((a) => a.termin_am && a.termin_am.slice(0, 10) === todayStr)
      .forEach((a) => {
        const s = supplierMap.get(a.lieferant_id);
        const time = a.termin_am
          ? new Date(a.termin_am).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit'
            })
          : '';
        items.push({
          type: 'appointment',
          id: `t-${a.id}`,
          to: `/einkauf/termine/${a.id}`,
          label: s?.lieferanten_name || 'Order-Termin',
          time
        });
      });
    items.sort((a, b) => {
      const priority = { appointment: 0, alteration: 1, birthday: 2 };
      const pa = priority[a.type] ?? 99;
      const pb = priority[b.type] ?? 99;
      if (pa !== pb) return pa - pb;
      return (a.time || '').localeCompare(b.time || '');
    });
    return items;
  }, []) || [];

  const [notepadPreview, setNotepadPreview] = useState('');
  const [notepadOpen, setNotepadOpen] = useState(false);
  useEffect(() => {
    const refresh = () =>
      setNotepadPreview(localStorage.getItem(NOTEPAD_KEY) || '');
    refresh();
    if (!notepadOpen) refresh();
  }, [notepadOpen]);

  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const cameraInputRef = useRef(null);
  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file, 1800, 0.9);
      setCapturedPhoto(dataUrl);
    } catch {}
  };

  return (
    <div className="safe-top min-h-full px-5 pb-12">
      <header className="flex items-center justify-end pt-4 pb-2">
        <img
          src="/logo-hintermair.jpg"
          alt="Mode Hintermair"
          className="h-9 w-auto select-none"
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </header>

      <div className="mt-6 mb-7">
        <div className="text-2xl text-muted">{greeting},</div>
        <div className="text-4xl font-bold text-ink tracking-tight">
          {USER_NAME}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DateCard
          weekday={weekday}
          day={day}
          month={month}
          year={now.getFullYear()}
          kw={kw}
        />
        <WeatherCard weather={weather} />
        <TodayCard events={events} />
        <NotepadCard
          preview={notepadPreview}
          onOpen={() => setNotepadOpen(true)}
        />
        <CameraCard onCapture={() => cameraInputRef.current?.click()} />
        <ContactQRCard />
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoCapture}
        className="hidden"
      />

      {notepadOpen && <NotepadSheet onClose={() => setNotepadOpen(false)} />}
      {capturedPhoto && (
        <PhotoPreviewSheet
          photo={capturedPhoto}
          onClose={() => setCapturedPhoto(null)}
        />
      )}
    </div>
  );
}

function CardShell({ children, tone = 'white', onClick, href }) {
  const toneClass =
    tone === 'magenta'
      ? 'bg-brand/10 ring-brand/20'
      : tone === 'blue'
      ? 'bg-blue-50 ring-blue-100'
      : 'bg-surface ring-black/5 shadow-sm shadow-black/[0.02]';
  const interactive = onClick || href;
  const interactiveClass = interactive
    ? 'active:scale-[0.98] transition-transform'
    : '';
  const baseClass = `rounded-3xl p-4 ring-1 aspect-square flex flex-col text-left no-underline text-inherit ${toneClass} ${interactiveClass}`;
  if (href) {
    return (
      <a href={href} className={baseClass}>
        {children}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={baseClass}>
        {children}
      </button>
    );
  }
  return <div className={baseClass}>{children}</div>;
}

function DateCard({ weekday, day, month, year, kw }) {
  return (
    <CardShell tone="magenta" href="calshow:">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-auto">
        <Calendar size={20} className="text-brand" />
      </div>
      <div className="mt-3">
        <div className="text-xs text-muted capitalize">{weekday}</div>
        <div className="text-2xl font-bold text-ink leading-tight mt-0.5">
          {day}. {month}
        </div>
        <div className="text-xs text-muted mt-0.5">
          {year} · KW {kw}
        </div>
      </div>
    </CardShell>
  );
}

function WeatherCard({ weather }) {
  if (!weather) {
    return (
      <CardShell tone="blue" href="weather://">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-auto">
          <Cloud size={20} className="text-blue-400" />
        </div>
        <div className="mt-3">
          <div className="text-xs text-muted">Wetter</div>
          <div className="text-sm text-muted mt-1">Lade …</div>
        </div>
      </CardShell>
    );
  }
  const info = weatherCodeInfo(weather.code);
  const Icon = WEATHER_ICON_MAP[info.iconKey] || Cloud;
  return (
    <CardShell tone="blue" href="weather://">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-auto">
        <Icon size={20} className="text-blue-500" />
      </div>
      <div className="mt-3">
        <div className="text-xs text-muted">{info.label}</div>
        <div className="text-2xl font-bold text-ink leading-tight mt-0.5">
          {weather.temperature}°
        </div>
        <div className="text-xs text-muted mt-0.5">in Ried</div>
      </div>
    </CardShell>
  );
}

function TodayCard({ events }) {
  const visible = events.slice(0, 3);
  const remaining = Math.max(0, events.length - visible.length);
  return (
    <CardShell>
      <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center mb-2">
        <Sparkles size={20} className="text-brand" />
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-brand font-medium mb-2">
        Heute
      </div>
      {events.length === 0 ? (
        <div className="text-xs text-muted leading-snug">
          Keine Termine
          <br />
          oder Erinnerungen.
        </div>
      ) : (
        <ul className="space-y-1.5 flex-1 min-h-0 overflow-hidden">
          {visible.map((e) => (
            <li key={e.id}>
              <Link
                to={e.to}
                className="flex items-center gap-1.5 text-xs text-ink leading-tight"
              >
                <EventIcon type={e.type} />
                <span className="truncate flex-1">
                  {e.time && (
                    <span className="text-muted mr-1">{e.time}</span>
                  )}
                  {e.label}
                </span>
              </Link>
            </li>
          ))}
          {remaining > 0 && (
            <li className="text-[10px] text-muted pl-5">
              + {remaining} weitere
            </li>
          )}
        </ul>
      )}
    </CardShell>
  );
}

function EventIcon({ type }) {
  if (type === 'birthday')
    return <Cake size={12} className="text-brand shrink-0" />;
  if (type === 'alteration')
    return <Scissors size={12} className="text-brand shrink-0" />;
  return <Calendar size={12} className="text-brand shrink-0" />;
}

function NotepadCard({ preview, onOpen }) {
  const trimmed = (preview || '').trim();
  return (
    <CardShell onClick={onOpen}>
      <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center mb-2">
        <Edit3 size={20} className="text-brand" />
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-brand font-medium mb-2">
        Notiz
      </div>
      {trimmed ? (
        <p className="text-xs text-ink leading-snug whitespace-pre-wrap line-clamp-4 break-words">
          {trimmed}
        </p>
      ) : (
        <p className="text-xs text-muted leading-snug">
          Antippen, um zu
          <br />
          schreiben.
        </p>
      )}
    </CardShell>
  );
}

function CameraCard({ onCapture }) {
  return (
    <CardShell onClick={onCapture}>
      <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center mb-2">
        <Camera size={20} className="text-brand" />
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-brand font-medium mb-2">
        Kamera
      </div>
      <div className="flex-1 flex items-end">
        <p className="text-xs text-muted leading-snug">
          Antippen für ein
          <br />
          schnelles Foto.
        </p>
      </div>
    </CardShell>
  );
}

function ContactQRCard() {
  return (
    <CardShell>
      <div className="flex-1 flex items-center justify-center">
        <QRCode
          value={VCARD}
          size={140}
          fgColor="#9C0E5D"
          bgColor="#FFFFFF"
          level="M"
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
        />
      </div>
    </CardShell>
  );
}

function NotepadSheet({ onClose }) {
  const [text, setText] = useState(
    () => localStorage.getItem(NOTEPAD_KEY) || ''
  );
  const timerRef = useRef(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(NOTEPAD_KEY, text);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1200);
      } catch {}
    }, 400);
    return () => clearTimeout(timerRef.current);
  }, [text]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-bg"
      role="dialog"
      aria-modal="true"
    >
      <div className="safe-top flex items-center justify-between px-4 pt-3 pb-2 border-b border-black/5">
        <div className="flex items-center gap-2">
          <Edit3 size={18} className="text-brand" />
          <h2 className="text-lg font-semibold">Notiz</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            {savedFlash ? 'Gespeichert' : 'Auto-Speichern'}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-muted active:opacity-60"
            aria-label="Schließen"
          >
            <X size={22} />
          </button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Hier kannst du immer wieder Notizen reinschreiben …"
        className="flex-1 w-full p-4 text-base leading-relaxed bg-bg outline-none resize-none"
        autoFocus
      />
    </div>
  );
}

function PhotoPreviewSheet({ photo, onClose }) {
  const [busy, setBusy] = useState(false);
  const handleShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await sharePhoto(photo, {
        title: 'Foto',
        filename: `hintermair-foto-${Date.now()}.jpg`
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
    >
      <div className="safe-top flex items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={onClose}
          className="p-2 text-white active:opacity-60"
          aria-label="Schließen"
        >
          <X size={24} />
        </button>
        <button
          onClick={handleShare}
          disabled={busy}
          className="inline-flex items-center gap-2 bg-brand text-white font-medium rounded-full px-4 py-2 disabled:opacity-50 active:opacity-80"
        >
          <Share2 size={18} /> Teilen
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <img
          src={photo}
          alt="Aufgenommenes Foto"
          className="max-w-full max-h-full object-contain rounded-lg"
          draggable={false}
        />
      </div>
      <div className="safe-bottom text-center text-xs text-white/60 pb-3 px-4">
        „Teilen" öffnet das iOS-Teilen-Menü — dort „In Fotos sichern" wählen.
      </div>
    </div>
  );
}
