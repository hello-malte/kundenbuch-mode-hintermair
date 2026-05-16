import { Routes, Route, Navigate } from 'react-router-dom';
import BottomTabBar from './components/BottomTabBar';
import CustomerList from './pages/CustomerList';
import CustomerProfile from './pages/CustomerProfile';
import OrderOverview from './pages/OrderOverview';

export default function App() {
  return (
    <div className="min-h-full flex flex-col bg-bg">
      <main className="flex-1 pb-tabbar">
        <Routes>
          <Route path="/" element={<Navigate to="/kunden" replace />} />
          <Route path="/kunden" element={<CustomerList />} />
          <Route path="/kunden/:id/*" element={<CustomerProfile />} />
          <Route path="/order" element={<OrderOverview />} />
          <Route path="*" element={<Navigate to="/kunden" replace />} />
        </Routes>
      </main>
      <BottomTabBar />
    </div>
  );
}
