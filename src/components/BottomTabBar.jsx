import { NavLink, useLocation } from 'react-router-dom';
import { Users, ShoppingBag } from 'lucide-react';

const tabs = [
  { to: '/kunden', label: 'Kunden', icon: Users, match: '/kunden' },
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
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                active ? 'text-ink' : 'text-muted'
              }`}
            >
              <Icon size={24} strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[11px] tracking-wide">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
