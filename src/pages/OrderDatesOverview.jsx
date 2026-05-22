import { Calendar } from 'lucide-react';
import Logo from '../components/Logo';

export default function OrderDatesOverview() {
  return (
    <div className="safe-top">
      <header className="px-4 pt-3 pb-3 sticky top-0 bg-bg/95 backdrop-blur z-30">
        <div className="flex items-center justify-between mb-3 min-h-[40px]">
          <Logo />
          <Calendar size={22} className="text-brand" />
        </div>
      </header>

      <div className="py-24 text-center text-muted px-6">
        <Calendar size={48} className="text-brand/40 mx-auto mb-4" />
        <h2 className="text-lg text-ink font-medium mb-2">
          Order-Termine
        </h2>
        <p className="text-sm leading-relaxed max-w-xs mx-auto">
          Kalender für Order-Termine mit Lieferanten kommt im nächsten Update —
          inklusive Saison, Budget, Liefertermin, Konditionen und Foto-Artikel-Erfassung.
        </p>
      </div>
    </div>
  );
}
