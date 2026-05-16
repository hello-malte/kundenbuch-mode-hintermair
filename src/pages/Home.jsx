import QRCode from 'react-qr-code';
import {
  getCalendarWeek,
  specialDayForDate,
  zodiacForDate
} from '../utils/calendar';

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

export default function Home() {
  const now = new Date();
  const weekday = now.toLocaleDateString('de-DE', { weekday: 'long' });
  const day = now.getDate();
  const month = now.toLocaleDateString('de-DE', { month: 'long' });
  const year = now.getFullYear();
  const kw = getCalendarWeek(now);
  const special = specialDayForDate(now);
  const zodiac = zodiacForDate(now);

  return (
    <div className="safe-top min-h-full flex flex-col items-center px-6 pb-12">
      <div className="mt-8 mb-12 flex justify-center">
        <img
          src="/logo-hintermair.jpg"
          alt="Mode Hintermair"
          className="h-16 w-auto select-none"
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      <div className="text-center">
        <div className="text-xl font-light tracking-wide text-muted capitalize">
          {weekday}
        </div>
        <div className="text-5xl font-bold tracking-tight text-ink mt-1">
          {day}. {month}
        </div>
        <div className="text-base text-muted mt-1">{year}</div>
        <div className="inline-block mt-4 text-xs uppercase tracking-[0.2em] text-brand font-medium border border-brand/40 rounded-full px-3 py-1">
          Kalenderwoche {kw}
        </div>
      </div>

      <div className="flex items-center justify-center my-10 select-none">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-brand/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-brand mx-2.5 shadow-[0_0_0_3px_rgba(156,14,93,0.12)]" />
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-brand/50" />
      </div>

      {special && (
        <div className="text-center max-w-xs">
          <div className="text-[10px] uppercase tracking-[0.2em] text-brand font-medium mb-2">
            Heute
          </div>
          <div className="text-lg font-medium text-ink leading-snug">
            {special}
          </div>
        </div>
      )}

      {zodiac && (
        <div className="mt-12 text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-brand font-medium mb-2">
            Sternzeichen
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl text-brand leading-none">
              {zodiac.symbol}
            </span>
            <div className="text-left">
              <div className="text-xl font-medium text-ink">{zodiac.name}</div>
              <div className="text-xs text-muted">{zodiac.period}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-14 text-center">
        <div className="text-[10px] uppercase tracking-[0.2em] text-brand font-medium mb-3">
          Kontakt scannen
        </div>
        <div className="bg-white rounded-2xl p-4 ring-1 ring-brand/30 inline-block">
          <QRCode
            value={VCARD}
            size={200}
            fgColor="#9C0E5D"
            bgColor="#FFFFFF"
            level="M"
          />
        </div>
        <div className="text-xs text-muted mt-3 max-w-[220px] mx-auto leading-snug">
          Mit Kamera scannen — fügt Mode Hintermair direkt zu den Kontakten hinzu.
        </div>
      </div>
    </div>
  );
}
