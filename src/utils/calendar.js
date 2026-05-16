export function getCalendarWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

const ZODIAC = [
  { name: 'Steinbock', symbol: '♑', from: [12, 22], to: [1, 19] },
  { name: 'Wassermann', symbol: '♒', from: [1, 20], to: [2, 18] },
  { name: 'Fische', symbol: '♓', from: [2, 19], to: [3, 20] },
  { name: 'Widder', symbol: '♈', from: [3, 21], to: [4, 19] },
  { name: 'Stier', symbol: '♉', from: [4, 20], to: [5, 20] },
  { name: 'Zwilling', symbol: '♊', from: [5, 21], to: [6, 20] },
  { name: 'Krebs', symbol: '♋', from: [6, 21], to: [7, 22] },
  { name: 'Löwe', symbol: '♌', from: [7, 23], to: [8, 22] },
  { name: 'Jungfrau', symbol: '♍', from: [8, 23], to: [9, 22] },
  { name: 'Waage', symbol: '♎', from: [9, 23], to: [10, 22] },
  { name: 'Skorpion', symbol: '♏', from: [10, 23], to: [11, 21] },
  { name: 'Schütze', symbol: '♐', from: [11, 22], to: [12, 21] }
];

const MONTH_LABEL = [
  '', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

export function zodiacForDate(date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  for (const z of ZODIAC) {
    const [fm, fd] = z.from;
    const [tm, td] = z.to;
    if (fm <= tm) {
      if ((m === fm && d >= fd) || (m === tm && d <= td) || (m > fm && m < tm)) {
        return { ...z, period: `${fd}. ${MONTH_LABEL[fm]} – ${td}. ${MONTH_LABEL[tm]}` };
      }
    } else {
      if ((m === fm && d >= fd) || (m === tm && d <= td) || m > fm || m < tm) {
        return { ...z, period: `${fd}. ${MONTH_LABEL[fm]} – ${td}. ${MONTH_LABEL[tm]}` };
      }
    }
  }
  return null;
}

const SPECIAL_DAYS = {
  '01-01': 'Neujahr',
  '01-06': 'Heilige Drei Könige',
  '01-19': 'Tag des Popcorns',
  '01-21': 'Tag der Umarmung',
  '01-24': 'Internationaler Tag der Bildung',
  '01-28': 'Tag des Datenschutzes',
  '01-31': 'Tag der Inspiration',

  '02-02': 'Welt-Feuchtgebiete-Tag',
  '02-04': 'Welt-Krebs-Tag',
  '02-09': 'Tag der Pizza',
  '02-11': 'Tag der Frauen in der Wissenschaft',
  '02-14': 'Valentinstag',
  '02-17': 'Tag des Regenbogens',
  '02-22': 'Tag der Schwester',
  '02-27': 'Tag des Eisbären',

  '03-01': 'Tag des Komplimentes',
  '03-03': 'Welttag des Hörens',
  '03-08': 'Internationaler Frauentag',
  '03-14': 'Pi-Tag',
  '03-20': 'Internationaler Tag des Glücks',
  '03-21': 'Welt-Down-Syndrom-Tag',
  '03-22': 'Welt-Wasser-Tag',
  '03-25': 'Tag der Waffel',

  '04-01': 'April, April',
  '04-02': 'Tag des Kinderbuchs',
  '04-07': 'Welt-Gesundheits-Tag',
  '04-11': 'Tag der Geschwister',
  '04-22': 'Tag der Erde',
  '04-23': 'Welttag des Buches',
  '04-25': 'Tag des Pinguins',
  '04-28': 'Welttag für Sicherheit am Arbeitsplatz',

  '05-01': 'Tag der Arbeit',
  '05-04': 'Star-Wars-Tag',
  '05-05': 'Welt-Lach-Tag',
  '05-08': 'Welt-Rotkreuz-Tag',
  '05-12': 'Tag der Krankenpflege',
  '05-15': 'Tag der Familie',
  '05-16': 'Tag des friedlichen Zusammenlebens',
  '05-17': 'Welttag gegen Homophobie',
  '05-20': 'Welt-Bienen-Tag',
  '05-21': 'Tag der kulturellen Vielfalt',
  '05-25': 'Towel Day',
  '05-31': 'Welt-Nichtraucher-Tag',

  '06-01': 'Tag des Kindes',
  '06-05': 'Welt-Umwelt-Tag',
  '06-08': 'Welt-Ozean-Tag',
  '06-12': 'Tag des Picknicks',
  '06-21': 'Sommeranfang · Welt-Yoga-Tag',
  '06-26': 'Welt-Fluss-Tag',

  '07-04': 'Tag der Schokoladenkekse',
  '07-07': 'Welt-Schokoladen-Tag',
  '07-11': 'Welt-Bevölkerungs-Tag',
  '07-17': 'Tag des Smileys',
  '07-20': 'Mondlandungs-Tag',
  '07-21': 'Tag des Eises',
  '07-30': 'Tag der Freundschaft',

  '08-01': 'Tag des Apfels',
  '08-08': 'Welt-Katzen-Tag',
  '08-12': 'Tag der Jugend',
  '08-13': 'Tag der Linkshänder',
  '08-19': 'Welt-Foto-Tag',
  '08-26': 'Tag des Hundes',
  '08-29': 'Tag des Pferdes',

  '09-01': 'Welt-Friedens-Tag',
  '09-08': 'Welt-Alphabetisierungs-Tag',
  '09-19': 'Talk-Like-A-Pirate-Tag',
  '09-21': 'Welt-Alzheimer-Tag',
  '09-22': 'Welt-Nashörner-Tag',
  '09-27': 'Welt-Tourismus-Tag',
  '09-29': 'Welt-Herz-Tag',

  '10-01': 'Tag der älteren Menschen',
  '10-04': 'Welttierschutztag',
  '10-05': 'Welt-Lehrer-Tag',
  '10-10': 'Welt-Mentalgesundheits-Tag',
  '10-11': 'Welt-Mädchen-Tag',
  '10-16': 'Welt-Ernährungs-Tag',
  '10-31': 'Halloween · Reformationstag',

  '11-01': 'Allerheiligen',
  '11-11': 'St. Martin',
  '11-13': 'Welt-Freundlichkeits-Tag',
  '11-19': 'Tag der Männer',
  '11-20': 'Welt-Kindertag',
  '11-25': 'Tag gegen Gewalt an Frauen',
  '11-26': 'Tag der Dankbarkeit',

  '12-01': 'Welt-AIDS-Tag',
  '12-05': 'Tag des Ehrenamts',
  '12-06': 'Nikolaus',
  '12-10': 'Tag der Menschenrechte',
  '12-13': 'Tag der Lichter',
  '12-21': 'Winteranfang',
  '12-24': 'Heiligabend',
  '12-25': 'Weihnachten',
  '12-26': '2. Weihnachtsfeiertag',
  '12-31': 'Silvester'
};

export function specialDayForDate(date) {
  const md = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return SPECIAL_DAYS[md] || null;
}
