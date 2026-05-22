import { useState, useEffect } from 'react';
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
  Quote
} from 'lucide-react';
import { getCalendarWeek, greetingForHour } from '../utils/calendar';
import { getCurrentWeather, weatherCodeInfo } from '../utils/weather';
import { quoteForDate } from '../utils/quotes';

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
  const greeting = greetingForHour(now.getHours());
  const weekday = now.toLocaleDateString('de-DE', { weekday: 'long' });
  const day = now.getDate();
  const month = now.toLocaleDateString('de-DE', { month: 'short' });
  const kw = getCalendarWeek(now);
  const quote = quoteForDate(now);

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

      <div className="grid grid-cols-2 gap-3 mb-3">
        <DateCard
          weekday={weekday}
          day={day}
          month={month}
          year={now.getFullYear()}
          kw={kw}
        />
        <WeatherCard weather={weather} />
      </div>

      <QuoteCard quote={quote} />

      <ContactQRCard />
    </div>
  );
}

function DateCard({ weekday, day, month, year, kw }) {
  return (
    <div className="bg-brand/10 rounded-3xl p-4 ring-1 ring-brand/20">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3">
        <Calendar size={20} className="text-brand" />
      </div>
      <div className="text-xs text-muted capitalize">{weekday}</div>
      <div className="text-2xl font-bold text-ink leading-tight mt-0.5">
        {day}. {month}
      </div>
      <div className="text-xs text-muted mt-0.5">
        {year} · KW {kw}
      </div>
    </div>
  );
}

function WeatherCard({ weather }) {
  if (!weather) {
    return (
      <div className="bg-blue-50 rounded-3xl p-4 ring-1 ring-blue-100 min-h-[150px] flex flex-col">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3">
          <Cloud size={20} className="text-blue-400" />
        </div>
        <div className="text-xs text-muted">Wetter</div>
        <div className="text-sm text-muted mt-2">Lade …</div>
      </div>
    );
  }

  const info = weatherCodeInfo(weather.code);
  const Icon = WEATHER_ICON_MAP[info.iconKey] || Cloud;

  return (
    <div className="bg-blue-50 rounded-3xl p-4 ring-1 ring-blue-100">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3">
        <Icon size={20} className="text-blue-500" />
      </div>
      <div className="text-xs text-muted">{info.label}</div>
      <div className="text-2xl font-bold text-ink leading-tight mt-0.5">
        {weather.temperature}°
      </div>
      <div className="text-xs text-muted mt-0.5">in Ried</div>
    </div>
  );
}

function QuoteCard({ quote }) {
  return (
    <div className="bg-surface rounded-3xl p-4 ring-1 ring-black/5 shadow-sm shadow-black/[0.02] mb-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
          <Quote size={20} className="text-brand" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.2em] text-brand font-medium mb-1.5">
            Spruch des Tages
          </div>
          <p className="text-sm text-ink leading-relaxed">
            «{quote.text}»
          </p>
          <div className="text-xs text-muted mt-2">— {quote.author}</div>
        </div>
      </div>
    </div>
  );
}

function ContactQRCard() {
  return (
    <div className="bg-surface rounded-3xl p-5 ring-1 ring-black/5 shadow-sm shadow-black/[0.02] flex flex-col items-center">
      <div className="text-[10px] uppercase tracking-[0.2em] text-brand font-medium mb-3">
        Kontakt scannen
      </div>
      <div className="bg-white rounded-2xl p-3 ring-1 ring-brand/20">
        <QRCode
          value={VCARD}
          size={180}
          fgColor="#9C0E5D"
          bgColor="#FFFFFF"
          level="M"
        />
      </div>
      <div className="text-xs text-muted mt-3 text-center max-w-[240px] leading-snug">
        Kamera-App scannen — Mode Hintermair direkt zu den Kontakten hinzufügen.
      </div>
    </div>
  );
}
