import { useRef, useState } from 'react';
import {
  useParams,
  useNavigate,
  useLocation,
  NavLink,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Phone, Navigation, Mail, Truck } from 'lucide-react';
import { db, updateSupplier } from '../db/database';
import { phoneToWa } from '../utils/share';
import PhotoButton from '../components/PhotoButton';
import SupplierProfileTab from './tabs/SupplierProfileTab';
import SupplierNotesTab from './tabs/SupplierNotesTab';
import SupplierTermineTab from './tabs/SupplierTermineTab';

const tabs = [
  { to: 'termine', label: 'Termine' },
  { to: 'profil', label: 'Profil' },
  { to: 'notizen', label: 'Notizen' }
];

export default function SupplierProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const sid = Number(id);

  const currentSegment = location.pathname.split('/').pop();
  const currentIndex = Math.max(
    0,
    tabs.findIndex((t) => t.to === currentSegment)
  );

  const swipeStart = useRef(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const onTouchStart = (e) => {
    if (e.touches.length > 1) {
      swipeStart.current = null;
      return;
    }
    const t = e.touches[0];
    swipeStart.current = { x: t.clientX, y: t.clientY, locked: null };
  };
  const onTouchMove = (e) => {
    const start = swipeStart.current;
    if (!start) return;
    const t = e.touches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (!start.locked) {
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (ax > 6 || ay > 6) {
        if (ax > ay * 1.3) {
          start.locked = 'h';
          setIsDragging(true);
        } else {
          start.locked = 'v';
        }
      }
    }
    if (start.locked === 'h') {
      let offset = dx;
      if (
        (currentIndex === 0 && dx > 0) ||
        (currentIndex === tabs.length - 1 && dx < 0)
      ) {
        offset = dx * 0.35;
      }
      setDragX(offset);
    }
  };
  const onTouchEnd = (e) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || start.locked !== 'h') {
      setIsDragging(false);
      setDragX(0);
      return;
    }
    const t = e.changedTouches[0];
    const dx = t ? t.clientX - start.x : 0;
    const threshold = 70;
    setIsDragging(false);
    setDragX(0);
    if (dx < -threshold && currentIndex < tabs.length - 1) {
      navigate(`/einkauf/lieferanten/${id}/${tabs[currentIndex + 1].to}`);
    } else if (dx > threshold && currentIndex > 0) {
      navigate(`/einkauf/lieferanten/${id}/${tabs[currentIndex - 1].to}`);
    }
  };

  const supplier = useLiveQuery(
    async () => (await db.suppliers.get(sid)) ?? null,
    [sid]
  );

  if (supplier === undefined) {
    return <div className="p-8 text-muted">Lade …</div>;
  }
  if (supplier === null) {
    return (
      <div className="p-8 text-muted">
        Lieferant nicht gefunden.{' '}
        <button
          onClick={() => navigate('/einkauf/lieferanten')}
          className="text-brand underline"
        >
          Zurück
        </button>
      </div>
    );
  }

  const waNumber = phoneToWa(supplier.mobil);
  const phoneHref = supplier.mobil
    ? `tel:${supplier.mobil.replace(/\s/g, '')}`
    : supplier.arbeit
    ? `tel:${supplier.arbeit.replace(/\s/g, '')}`
    : null;
  const waHref = waNumber ? `https://wa.me/${waNumber}` : null;
  const mailHref = supplier.email ? `mailto:${supplier.email}` : null;

  const addressParts = [supplier.strasse, supplier.plz, supplier.ort]
    .map((p) => (p || '').trim())
    .filter(Boolean);
  const mapsHref = addressParts.length
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        addressParts.join(', ')
      )}&travelmode=driving`
    : null;

  const handleFoto = async (foto) => {
    await updateSupplier(sid, { foto });
  };

  const displayName =
    supplier.lieferanten_name ||
    `${supplier.vorname || ''} ${supplier.nachname || ''}`.trim() ||
    'Unbenannter Lieferant';

  return (
    <div className="safe-top">
      <header className="sticky top-0 bg-bg/95 backdrop-blur z-30 border-b border-black/5">
        <div className="flex items-center px-2 pt-1">
          <button
            onClick={() => navigate('/einkauf/lieferanten')}
            className="p-2 active:opacity-60"
            aria-label="Zurück"
          >
            <ArrowLeft size={22} />
          </button>
        </div>

        <div className="px-4 pb-3 flex items-center gap-4">
          <PhotoButton value={supplier.foto} onChange={handleFoto} size={76} />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold leading-tight truncate">
              {displayName}
            </h2>
            <div className="flex gap-2 mt-2">
              {phoneHref && (
                <a
                  href={phoneHref}
                  className="w-11 h-11 inline-flex items-center justify-center bg-brand text-white rounded-full active:opacity-80 transition-opacity"
                  aria-label="Anrufen"
                >
                  <Phone size={20} />
                </a>
              )}
              {mailHref && (
                <a
                  href={mailHref}
                  className="w-11 h-11 inline-flex items-center justify-center bg-brand text-white rounded-full active:opacity-80 transition-opacity"
                  aria-label="E-Mail"
                >
                  <Mail size={20} />
                </a>
              )}
              {mapsHref && (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 inline-flex items-center justify-center bg-brand text-white rounded-full active:opacity-80 transition-opacity"
                  aria-label="Route in Google Maps"
                >
                  <Navigation size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        <nav className="flex border-t border-black/5 px-2 overflow-x-auto scroll-touch">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={`/einkauf/lieferanten/${id}/${t.to}`}
              className={({ isActive }) =>
                `shrink-0 px-3 py-3 text-sm border-b-2 transition-colors duration-200 ${
                  isActive
                    ? 'border-brand text-brand font-medium'
                    : 'border-transparent text-muted'
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div
        className="px-4 py-4"
        style={{
          transform: `translate3d(${dragX}px, 0, 0)`,
          transition: isDragging
            ? 'none'
            : 'transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          willChange: 'transform',
          touchAction: 'pan-y'
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <Routes>
          <Route index element={<Navigate to="termine" replace />} />
          <Route
            path="termine"
            element={<SupplierTermineTab supplierId={sid} />}
          />
          <Route
            path="profil"
            element={<SupplierProfileTab supplier={supplier} />}
          />
          <Route
            path="notizen"
            element={<SupplierNotesTab supplier={supplier} />}
          />
          <Route path="*" element={<Navigate to="termine" replace />} />
        </Routes>
      </div>
    </div>
  );
}
