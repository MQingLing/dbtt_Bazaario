import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import LoginPage from './components/LoginPage';
import CustomerSignUp from './components/customer/CustomerSignUp';
import CustomerHome from './components/customer/CustomerHome';
import EventList from './components/customer/EventList';
import EventDetails from './components/customer/EventDetails';
import PasarMalamMap from './components/customer/PasarMalamMap';
import VendorStorePage from './components/customer/VendorStorePage';
import MenuProductPage from './components/customer/MenuProductPage';
import CustomerWallet from './components/customer/CustomerWallet';
import QRCodePayment from './components/customer/QRCodePayment';
import LoyaltyRewards from './components/customer/LoyaltyRewards';
import PreOrderCheckout from './components/customer/PreOrderCheckout';
import VendorDashboard from './components/vendor/VendorDashboard';
import VendorSalesAnalytics from './components/vendor/VendorSalesAnalytics';
import VendorOrderManagement from './components/vendor/VendorOrderManagement';
import VendorProductManagement from './components/vendor/VendorProductManagement';
import VendorApplyEvents from './components/vendor/VendorApplyEvents';
import VendorEventApplication from './components/vendor/VendorEventApplication';
import VendorMyApplications from './components/vendor/VendorMyApplications';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminEventManagement from './components/admin/AdminEventManagement';
import AdminVendorManagement from './components/admin/AdminVendorManagement';
import AdminApplicationManagement from './components/admin/AdminApplicationManagement';
import AdminEventStallConfig from './components/admin/AdminEventStallConfig';

export type UserRole = 'customer' | 'vendor' | 'admin' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletBalance?: number;
  loyaltyStamps?: number;
  qrCode?: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!currentUser ? <LoginPage onLogin={handleLogin} /> : <Navigate to={getHomeRoute(currentUser.role)} />} />
        <Route path="/signup" element={<CustomerSignUp onSignUp={handleLogin} />} />
        
        {/* Customer Routes */}
        <Route path="/customer/home" element={currentUser?.role === 'customer' ? <CustomerHome user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/customer/events" element={currentUser?.role === 'customer' ? <EventList user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/customer/events/:id" element={currentUser?.role === 'customer' ? <EventDetails user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/customer/events/:eventId/map" element={currentUser?.role === 'customer' ? <PasarMalamMap user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/customer/vendor/:id" element={currentUser?.role === 'customer' ? <VendorStorePage user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/customer/vendor/:vendorId/menu" element={currentUser?.role === 'customer' ? <MenuProductPage user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/customer/wallet" element={currentUser?.role === 'customer' ? <CustomerWallet user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/customer/qr-payment" element={currentUser?.role === 'customer' ? <QRCodePayment user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/customer/loyalty" element={currentUser?.role === 'customer' ? <LoyaltyRewards user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/customer/checkout" element={currentUser?.role === 'customer' ? <PreOrderCheckout user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Vendor Routes */}
        <Route path="/vendor/dashboard" element={currentUser?.role === 'vendor' ? <VendorDashboard user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/vendor/analytics" element={currentUser?.role === 'vendor' ? <VendorSalesAnalytics user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/vendor/orders" element={currentUser?.role === 'vendor' ? <VendorOrderManagement user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/vendor/products" element={currentUser?.role === 'vendor' ? <VendorProductManagement user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/vendor/apply-events" element={currentUser?.role === 'vendor' ? <VendorApplyEvents user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/vendor/apply-events/:eventId" element={currentUser?.role === 'vendor' ? <VendorEventApplication user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/vendor/my-applications" element={currentUser?.role === 'vendor' ? <VendorMyApplications user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/vendor/my-applications/:applicationId" element={currentUser?.role === 'vendor' ? <VendorMyApplications user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={currentUser?.role === 'admin' ? <AdminDashboard user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/admin/events" element={currentUser?.role === 'admin' ? <AdminEventManagement user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/admin/events/:eventId/stalls" element={currentUser?.role === 'admin' ? <AdminEventStallConfig user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/admin/vendors" element={currentUser?.role === 'admin' ? <AdminVendorManagement user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/admin/applications" element={currentUser?.role === 'admin' ? <AdminApplicationManagement user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

function getHomeRoute(role: UserRole): string {
  switch (role) {
    case 'customer':
      return '/customer/home';
    case 'vendor':
      return '/vendor/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/';
  }
}
