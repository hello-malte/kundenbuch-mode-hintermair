import { NavLink, useLocation } from 'react-router-dom';
import { Users, Scissors, Bookmark, ShoppingBag } from 'lucide-react';

const tabs = [
  { to: '/kunden', label: 'Kunden', icon: Users, match: '/kunden' },
  { to: '/aenderungen', label: 'Änderungen', icon: Scissors, match: '/aenderungen' },
  { to: '/reservierungen', label: 'Reservierungen', icon: Bookmark, match: '/reservierungen' },
  { to: '/order', label: 'Order', icon: ShoppingBag, match: '/order' }
];

export default function BottomTabBar() {
  const { pathname } = useLocation();
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
