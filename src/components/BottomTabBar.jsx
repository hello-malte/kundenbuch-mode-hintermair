import { NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  Scissors,
  Bookmark,
  ShoppingBag,
  Truck,
  Calendar,
  Tag
} from 'lucide-react';

const HOME_TABS = [
  { to: '/verkauf/kunden', label: 'Verkauf', icon: Users, match: '/verkauf' },
  { to: '/einkauf/lieferanten', label: 'Einkauf', icon: Truck, match: '/einkauf' }
];

const VERKAUF_TABS = [
  { to: '/verkauf/kunden', label: 'Kunden', icon: Users, match: '/verkauf/kunden' },
  { to: '/verkauf/aenderungen', label: 'Änderungen', icon: Scissors, match: '/verkauf/aenderungen' },
  { to: '/verkauf/reservierungen', label: 'Reservierungen', icon: Bookmark, match: '/verkauf/reservierungen' }
];

const EINKAUF_TABS = [
  { to: '/einkauf/lieferanten', label: 'Lieferanten', icon: Truck, match: '/einkauf/lieferanten' },
  { to: '/einkauf/termine', label: 'Termine', icon: Calendar, match: '/einkauf/termine' },
  { to: '/einkauf/brands', label: 'Brands', icon: Tag, match: '/einkauf/brands' }
];

export default function BottomTabBar() {
  const { pathname } = useLocation();

  let tabs;
  if (pathname.startsWith('/verkauf')) tabs = VERKAUF_TABS;
  else if (pathname.startsWith('/einkauf')) tabs = EINKAUF_TABS;
  else tabs = HOME_TABS;

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur border-t border-black/5 safe-bottom z-40">
      <div className="flex h-16">
        {tabs.map(({ to, label, icon: Icon, match }) => {
          const active = pathname.startsWith(match);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1 px-1 transition-colors duration-200 ${
                active ? 'text-brand' : 'text-muted'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[10px] tracking-tight truncate max-w-full">
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
