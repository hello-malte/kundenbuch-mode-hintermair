import { useRef, useState } from 'react';
import {
  useParams,
  useNavigate,
  useLocation,
  NavLink,
  Routes,
  Route,
  Navigate,
  Link
} from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Trash2 } from 'lucide-react';
import {
  db,
  deleteOrderAppointment,
  SAISON_LABELS_ALL,
  shortYear
} from '../db/database';
import OrderPlanungTab from './tabs/OrderPlanungTab';
import OrderKonditionenTab from './tabs/OrderKonditionenTab';
import OrderArtikelTab from './tabs/OrderArtikelTab';

const tabs = [
  { to: 'planung', label: 'Planung' },
  { to: 'konditionen', label: 'Konditionen' },
  { to: 'artikel', label: 'Artikel' }
];

export default function OrderAppointmentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const tid = Number(id);

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
      navigate(`/einkauf/termine/${id}/${tabs[currentIndex + 1].to}`);
    } else if (dx > threshold && currentIndex > 0) {
      navigate(`/einkauf/termine/${id}/${tabs[currentIndex - 1].to}`);
    }
  };

  const data = useLiveQuery(async () => {
    const a = await db.order_appointments.get(tid);
    if (!a) return null;
    const supplier = a.lieferant_id
      ? await db.suppliers.get(a.lieferant_id)
      : null;
    return { ...a, supplier };
  }, [tid]);

  if (data === undefined) {
    return <div className="p-8 text-muted">Lade …</div>;
  }
  if (data === null) {
    return (
      <div className="p-8 text-muted">
        Order nicht gefunden.{' '}
        <button
          onClick={() => navigate('/einkauf/termine')}
          className="text-brand underline"
        >
          Zurück
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirm('Order löschen?')) {
      await deleteOrderAppointment(tid);
      navigate('/einkauf/termine');
    }
  };

  const supplierName = data.supplier?.lieferanten_name || 'Unbekannter Lieferant';
  const saisonLabel = SAISON_LABELS_ALL[data.saison];
  const dateLine = data.termin_am
    ? new Date(data.termin_am).toLocaleDateString('de-DE', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) +
      ' · ' +
      new Date(data.termin_am).toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Termin festlegen';

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
            aria-label="Order löschen"
          >
            <Trash2 size={20} />
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="text-brand font-bold text-base">{dateLine}</div>
          <h2 className="text-xl font-semibold leading-tight truncate mt-0.5">
            {data.supplier ? (
              <Link
                to={`/einkauf/lieferanten/${data.supplier.id}`}
                className="text-ink"
              >
                {supplierName}
              </Link>
            ) : (
              supplierName
            )}
          </h2>
          {saisonLabel && (
            <div className="text-xs text-muted mt-0.5">
              {saisonLabel}
              {data.saison_jahr ? shortYear(data.saison_jahr) : ''}
            </div>
          )}
        </div>

        <nav className="flex border-t border-black/5 px-2 overflow-x-auto scroll-touch">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={`/einkauf/termine/${id}/${t.to}`}
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
          <Route index element={<Navigate to="planung" replace />} />
          <Route
            path="planung"
            element={
              <OrderPlanungTab appointment={data} supplier={data.supplier} />
            }
          />
          <Route
            path="konditionen"
            element={<OrderKonditionenTab appointment={data} />}
          />
          <Route
            path="artikel"
            element={<OrderArtikelTab appointment={data} />}
          />
          <Route path="*" element={<Navigate to="planung" replace />} />
        </Routes>
      </div>
    </div>
  );
}
