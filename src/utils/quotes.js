const QUOTES = [
  { text: 'Mode vergeht, Stil bleibt.', author: 'Yves Saint Laurent' },
  { text: 'Eleganz ist die einzige Schönheit, die nie verblasst.', author: 'Audrey Hepburn' },
  { text: 'Mode ist eine Sprache, die ohne Worte spricht.', author: 'Rachel Zoe' },
  { text: 'Kleider machen Leute.', author: 'Gottfried Keller' },
  { text: 'Die Mode liebt das Detail.', author: 'Karl Lagerfeld' },
  { text: 'Stil ist eine Art, ohne Worte zu sagen, wer man ist.', author: 'Rachel Zoe' },
  { text: 'Eine Frau ist am schönsten, wenn sie verliebt ist.', author: 'Sophia Loren' },
  { text: 'Das Schöne unterscheidet sich vom Reizenden dadurch, daß es ohne Begriff allgemein gefällt.', author: 'Immanuel Kant' },
  { text: 'Wer in den kleinsten Dingen treu ist, ist auch in den großen treu.', author: 'Lukas 16,10' },
  { text: 'Tracht ist Heimat, die man anziehen kann.', author: 'Volksweisheit' },
  { text: 'Mode ist Architektur: Es ist eine Frage der Proportion.', author: 'Coco Chanel' },
  { text: 'Luxus muss bequem sein, sonst ist es kein Luxus.', author: 'Coco Chanel' },
  { text: 'Ein Lächeln ist das schönste Make-up, das eine Frau tragen kann.', author: 'Marilyn Monroe' },
  { text: 'Der größte Künstler ist der, der mit der Mode lebt, ohne ihr zu folgen.', author: 'Karl Lagerfeld' },
  { text: 'Mode ist die kürzeste Brücke zwischen den Geschlechtern.', author: 'Wolfgang Joop' },
  { text: 'Glück ist das einzige, was sich verdoppelt, wenn man es teilt.', author: 'Albert Schweitzer' },
  { text: 'Schönheit beginnt in dem Moment, in dem du dich entscheidest, du selbst zu sein.', author: 'Coco Chanel' },
  { text: 'Die wahre Eleganz liegt in der Einfachheit.', author: 'Hubert de Givenchy' },
  { text: 'Jeder Tag ist eine neue Chance, die Welt zu verändern.', author: 'unbekannt' },
  { text: 'Heimat ist nicht da, wo man herkommt, sondern wo man verstanden wird.', author: 'Volksweisheit' },
  { text: 'Tracht ist gelebte Tradition.', author: 'Volksweisheit' },
  { text: 'Wer aufhört, besser zu werden, hört auf, gut zu sein.', author: 'Philip Rosenthal' },
  { text: 'Mode ist die schönste Form der Selbstdarstellung.', author: 'Tom Ford' },
  { text: 'Du brauchst kein perfektes Outfit, du brauchst das richtige Outfit.', author: 'unbekannt' },
  { text: 'In drei Worten kann ich alles über das Leben sagen: Es geht weiter.', author: 'Robert Frost' },
  { text: 'Wer Freude streut, erntet Freude.', author: 'Volksweisheit' },
  { text: 'Das beste Accessoire ist ein guter Freund.', author: 'unbekannt' },
  { text: 'Stil ist, was du daraus machst.', author: 'Iris Apfel' },
  { text: 'Eleganz ist eine Frage der inneren Haltung.', author: 'Karl Lagerfeld' },
  { text: 'Die Kleidung soll dem Menschen dienen, nicht der Mensch der Kleidung.', author: 'Volksweisheit' },
  { text: 'Mode ist vergänglich, Klasse ist beständig.', author: 'Giorgio Armani' },
  { text: 'Mit jedem Knopf den du schließt, eröffnest du eine Geschichte.', author: 'unbekannt' },
  { text: 'Freundlichkeit ist die Sprache, die Taube hören und Blinde lesen können.', author: 'Mark Twain' },
  { text: 'Die schönsten Geschichten beginnen mit einem Lächeln.', author: 'unbekannt' },
  { text: 'Tradition ist nicht die Anbetung der Asche, sondern die Weitergabe des Feuers.', author: 'Gustav Mahler' },
  { text: 'Wer Schönheit erschaffen will, muss Schönheit lieben.', author: 'Karl Lagerfeld' },
  { text: 'Das Geheimnis des Erfolges ist anzufangen.', author: 'Mark Twain' },
  { text: 'Schöne Tage – nicht weinen, dass sie vergangen, sondern lächeln, dass sie gewesen.', author: 'Rabindranath Tagore' },
  { text: 'Authentisch sein ist die schönste Form von Eleganz.', author: 'unbekannt' },
  { text: 'Glück ist nicht das Ziel, sondern der Weg.', author: 'Konfuzius' },
  { text: 'Ein guter Schnitt versteckt nichts — er feiert dich.', author: 'unbekannt' },
  { text: 'Der Stoff macht das Kleid, das Kleid macht den Auftritt.', author: 'unbekannt' },
  { text: 'Lass dein Lächeln die Welt verändern, aber lass nicht die Welt dein Lächeln verändern.', author: 'unbekannt' },
  { text: 'Wer das Schöne sucht, findet die Liebe zum Detail.', author: 'unbekannt' }
];

function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

export function quoteForDate(date = new Date()) {
  return QUOTES[dayOfYear(date) % QUOTES.length];
}
