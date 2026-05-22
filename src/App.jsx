import { Routes, Route, Navigate } from 'react-router-dom';
import BottomTabBar from './components/BottomTabBar';
import Home from './pages/Home';
import CustomerList from './pages/CustomerList';
import CustomerProfile from './pages/CustomerProfile';
import OrderOverview from './pages/OrderOverview';
import AlterationsOverview from './pages/AlterationsOverview';
import ReservationsOverview from './pages/ReservationsOverview';
import SupplierList from './pages/SupplierList';
import SupplierProfile from './pages/SupplierProfile';
import OrderDatesOverview from './pages/OrderDatesOverview';

export default function App() {
  return (
    <div className="min-h-full flex flex-col bg-bg">
      <main className="flex-1 pb-tabbar">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Verkauf-Bereich */}
          <Route path="/verkauf/kunden" element={<CustomerList />} />
          <Route path="/verkauf/kunden/:id/*" element={<CustomerProfile />} />
          <Route path="/verkauf/aenderungen" element={<AlterationsOverview />} />
          <Route path="/verkauf/reservierungen" element={<ReservationsOverview />} />

          {/* Einkauf-Bereich */}
          <Route path="/einkauf/lieferanten" element={<SupplierList />} />
          <Route path="/einkauf/lieferanten/:id/*" element={<SupplierProfile />} />
          <Route path="/einkauf/termine" element={<OrderDatesOverview />} />
          <Route path="/einkauf/brands" element={<OrderOverview />} />

          {/* Legacy-URL-Weiterleitungen */}
          <Route path="/kunden" element={<Navigate to="/verkauf/kunden" replace />} />
          <Route path="/kunden/:id/*" element={<LegacyCustomerRedirect />} />
          <Route path="/aenderungen" element={<Navigate to="/verkauf/aenderungen" replace />} />
          <Route path="/reservierungen" element={<Navigate to="/verkauf/reservierungen" replace />} />
          <Route path="/order" element={<Navigate to="/einkauf/brands" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomTabBar />
    </div>
  );
}

function LegacyCustomerRedirect() {
  const path = window.location.pathname.replace('/kunden/', '/verkauf/kunden/');
  return <Navigate to={path} replace />;
}
