import { useParams, useNavigate, NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Phone, Navigation } from 'lucide-react';
import { db, updateCustomer } from '../db/database';
import { phoneToWa } from '../utils/share';
import PhotoButton from '../components/PhotoButton';
import TimelineTab from './tabs/TimelineTab';
import AlterationsTab from './tabs/AlterationsTab';
import ProfileTab from './tabs/ProfileTab';
import NotesTab from './tabs/NotesTab';
import OrderTab from './tabs/OrderTab';

const tabs = [
  { to: 'timeline', label: 'Einkäufe' },
  { to: 'aenderungen', label: 'Änderungen' },
  { to: 'profil', label: 'Profil' },
  { to: 'notizen', label: 'Notizen' },
  { to: 'order', label: 'Order' }
];

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cid = Number(id);
  const customer = useLiveQuery(
    async () => (await db.customers.get(cid)) ?? null,
    [cid]
  );

  if (customer === undefined) {
    return <div className="p-8 text-muted">Lade …</div>;
  }
  if (customer === null) {
    return (
      <div className="p-8 text-muted">
        Kunde nicht gefunden.{' '}
        <button onClick={() => navigate('/kunden')} className="text-brand underline">
          Zurück
        </button>
      </div>
    );
  }

  const waNumber = phoneToWa(customer.telefon);
  const phoneHref = customer.telefon ? `tel:${customer.telefon.replace(/\s/g, '')}` : null;
  const waHref = waNumber ? `https://wa.me/${waNumber}` : null;

  const addressParts = [customer.strasse, customer.plz, customer.ort]
    .map((p) => (p || '').trim())
    .filter(Boolean);
  const mapsHref = addressParts.length
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressParts.join(', '))}&travelmode=driving`
    : null;

  const handleFoto = async (foto) => {
    await updateCustomer(cid, { foto });
  };

  const displayName =
    `${customer.vorname || ''} ${customer.nachname || ''}`.trim() || 'Unbenannter Kunde';

  return (
    <div className="safe-top">
      <header className="sticky top-0 bg-bg/95 backdrop-blur z-30 border-b border-black/5">
        <div className="flex items-center px-2 pt-1">
          <button
            onClick={() => navigate('/kunden')}
            className="p-2 active:opacity-60"
            aria-label="Zurück"
          >
            <ArrowLeft size={22} />
          </button>
        </div>

        <div className="px-4 pb-3 flex items-center gap-4">
          <PhotoButton value={customer.foto} onChange={handleFoto} size={76} />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold leading-tight truncate">{displayName}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {phoneHref && (
                <a
                  href={phoneHref}
                  className="inline-flex items-center gap-1.5 bg-brand text-white text-sm rounded-full px-3 py-1.5 active:opacity-80 transition-opacity"
                >
                  <Phone size={14} /> Anrufen
                </a>
              )}
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-whatsapp text-white font-medium text-sm rounded-full px-3 py-1.5 active:opacity-80 transition-opacity"
                  aria-label="WhatsApp öffnen"
                >
                  <WhatsAppIcon /> WhatsApp
                </a>
              )}
              {mapsHref && (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-ink text-white text-sm rounded-full px-3 py-1.5 active:opacity-80 transition-opacity"
                  aria-label="Route in Google Maps"
                >
                  <Navigation size={14} /> Route
                </a>
              )}
            </div>
          </div>
        </div>

        <nav className="flex border-t border-black/5 px-2 overflow-x-auto">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={`/kunden/${id}/${t.to}`}
              className={({ isActive }) =>
                `flex-1 text-center py-3 text-sm border-b-2 transition-colors duration-200 ${
                  isActive ? 'border-brand text-brand font-medium' : 'border-transparent text-muted'
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="px-4 py-4">
        <Routes>
          <Route index element={<Navigate to="timeline" replace />} />
          <Route path="timeline" element={<TimelineTab customerId={cid} />} />
          <Route path="aenderungen" element={<AlterationsTab customerId={cid} />} />
          <Route path="profil" element={<ProfileTab customer={customer} />} />
          <Route path="notizen" element={<NotesTab customer={customer} />} />
          <Route path="order" element={<OrderTab customerId={cid} />} />
          <Route path="*" element={<Navigate to="timeline" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2.5c-5.27 0-9.54 4.27-9.54 9.54 0 1.68.44 3.32 1.27 4.77L2.5 21.5l4.83-1.26a9.5 9.5 0 0 0 4.71 1.2h.01c5.26 0 9.54-4.28 9.54-9.55 0-2.55-.99-4.95-2.79-6.75a9.49 9.49 0 0 0-6.76-2.74Zm0 17.4c-1.43 0-2.83-.38-4.06-1.11l-.29-.17-2.86.75.76-2.79-.19-.3a7.91 7.91 0 0 1-1.21-4.23c0-4.38 3.57-7.95 7.96-7.95 2.13 0 4.13.83 5.63 2.34a7.9 7.9 0 0 1 2.33 5.62c0 4.38-3.57 7.95-7.96 7.95Zm4.36-5.94c-.24-.12-1.41-.7-1.63-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.19-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.6 4.12 3.65.58.25 1.03.4 1.38.51.58.18 1.11.16 1.52.1.46-.07 1.41-.58 1.61-1.13.2-.55.2-1.03.14-1.13-.06-.1-.22-.16-.46-.28Z"/>
    </svg>
  );
}
