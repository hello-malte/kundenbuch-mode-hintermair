import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Scissors,
  Bookmark,
  Truck,
  ShoppingBag,
  Settings
} from 'lucide-react';

const HOME_TAB = {
  to: '/',
  label: 'Home',
  icon: Home,
  match: '/',
  exact: true
};

const HOME_TABS = [
  { to: '/verkauf/kunden', label: 'Verkauf', icon: Users, match: '/verkauf' },
  { to: '/einkauf/termine', label: 'Einkauf', icon: Truck, match: '/einkauf' }
];

const VERKAUF_TABS = [
  { to: '/verkauf/kunden', label: 'Kunden', icon: Users, match: '/verkauf/kunden' },
  { to: '/verkauf/aenderungen', label: 'Änderungen', icon: Scissors, match: '/verkauf/aenderungen' },
  { to: '/verkauf/reservierungen', label: 'Reservierungen', icon: Bookmark, match: '/verkauf/reservierungen' }
];

const EINKAUF_TABS = [
  { to: '/einkauf/lieferanten', label: 'Lieferanten', icon: Truck, match: '/einkauf/lieferanten' },
  { to: '/einkauf/termine', label: 'Order', icon: ShoppingBag, match: '/einkauf/termine' }
];

export default function BottomTabBar({ onSettingsClick }) {
  const { pathname } = useLocation();

  let middleTabs;
  if (pathname.startsWith('/verkauf')) middleTabs = VERKAUF_TABS;
  else if (pathname.startsWith('/einkauf')) middleTabs = EINKAUF_TABS;
  else middleTabs = HOME_TABS;

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur border-t border-black/5 safe-bottom z-40">
      <div className="flex h-16">
        <TabLink tab={HOME_TAB} pathname={pathname} />
        {middleTabs.map((t) => (
          <TabLink key={t.to} tab={t} pathname={pathname} />
        ))}
        <SettingsButton onClick={onSettingsClick} />
      </div>
    </nav>
  );
}

function TabLink({ tab, pathname }) {
  const { to, label, icon: Icon, match, exact } = tab;
  const active = exact ? pathname === match : pathname.startsWith(match);
  return (
    <NavLink
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
}

function SettingsButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 px-1 text-muted active:text-brand transition-colors duration-200"
      aria-label="Daten"
    >
      <Settings size={22} strokeWidth={1.7} />
      <span className="text-[10px] tracking-tight truncate max-w-full">
        Daten
      </span>
    </button>
  );
}
