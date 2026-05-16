import { Routes, Route, Navigate } from 'react-router-dom';
import BottomTabBar from './components/BottomTabBar';
import Home from './pages/Home';
import CustomerList from './pages/CustomerList';
import CustomerProfile from './pages/CustomerProfile';
import OrderOverview from './pages/OrderOverview';
import AlterationsOverview from './pages/AlterationsOverview';
import ReservationsOverview from './pages/ReservationsOverview';

export default function App() {
  return (
    <div className="min-h-full flex flex-col bg-bg">
      <main className="flex-1 pb-tabbar">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kunden" element={<CustomerList />} />
          <Route path="/kunden/:id/*" element={<CustomerProfile />} />
          <Route path="/aenderungen" element={<AlterationsOverview />} />
          <Route path="/reservierungen" element={<ReservationsOverview />} />
          <Route path="/order" element={<OrderOverview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomTabBar />
    </div>
  );
}
