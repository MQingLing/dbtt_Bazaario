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
import CustomerProfile from './components/customer/CustomerProfile';
import QRCodePayment from './components/customer/QRCodePayment';
import LoyaltyRewards from './components/customer/LoyaltyRewards';
import PreOrderCheckout from './components/customer/PreOrderCheckout';
import VendorDashboard from './components/vendor/VendorDashboard';
import VendorSalesAnalytics from './components/vendor/VendorSalesAnalytics';
import VendorOrderManagement from './components/vendor/VendorOrderManagement';
import VendorProductManagement from './components/vendor/VendorProductManagement';
import VendorEventApplication from './components/vendor/VendorEventApplication';
import VendorSignUp from './components/vendor/VendorSignUp';
import VendorSubscription from './components/vendor/VendorSubscription';
import VendorEvents from './components/vendor/VendorEvents';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminEventManagement from './components/admin/AdminEventManagement';
import AdminVendorManagement from './components/admin/AdminVendorManagement';
import AdminApplicationManagement from './components/admin/AdminApplicationManagement';
import AdminEventStallConfig from './components/admin/AdminEventStallConfig';
import AdminManageAdmins from './components/admin/AdminManageAdmins';
import AdminVendorVerification from './components/admin/AdminVendorVerification';
import VendorDocumentSubmission from './components/vendor/VendorDocumentSubmission';
import ChangePasswordPage from './components/ChangePasswordPage';
import GuidedTour from './components/GuidedTour';
import { VendorTier, VendorVerificationStatus } from './services/authStore';

export type UserRole = 'customer' | 'vendor' | 'admin' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isDefaultPassword?: boolean;
  walletBalance?: number;
  loyaltyStamps?: number;
  qrCode?: string;
  vendorTier?: VendorTier;
  vendorCategory?: string;
  verificationStatus?: VendorVerificationStatus;
  verificationRejectionReason?: string;
  profilePic?: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showTour, setShowTour] = useState(false);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (!user.isDefaultPassword) {
      setShowTour(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowTour(false);
  };

  const handlePasswordChanged = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setShowTour(true);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  // Force password change — renders over everything else
  if (currentUser?.isDefaultPassword) {
    return <ChangePasswordPage user={currentUser} onPasswordChanged={handlePasswordChanged} />;
  }

  return (
    <>
      {currentUser && showTour && currentUser.role && (
        <GuidedTour role={currentUser.role as 'customer' | 'vendor' | 'admin'} onDismiss={() => setShowTour(false)} />
      )}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={!currentUser ? <LoginPage onLogin={handleLogin} /> : <Navigate to={getHomeRoute(currentUser.role)} />} />
          <Route path="/signup" element={<CustomerSignUp onSignUp={handleLogin} />} />
          <Route path="/vendor/signup" element={<VendorSignUp onSignUp={handleLogin} />} />

          {/* Customer Routes */}
          <Route path="/customer/home" element={currentUser?.role === 'customer' ? <CustomerHome user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/customer/events" element={currentUser?.role === 'customer' ? <EventList user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/customer/events/:id" element={currentUser?.role === 'customer' ? <EventDetails user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/customer/events/:eventId/map" element={currentUser?.role === 'customer' ? <PasarMalamMap user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/customer/vendor/:id" element={currentUser?.role === 'customer' ? <VendorStorePage user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/customer/vendor/:vendorId/menu" element={currentUser?.role === 'customer' ? <MenuProductPage user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/customer/wallet" element={currentUser?.role === 'customer' ? <CustomerWallet user={currentUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} /> : <Navigate to="/" />} />
          <Route path="/customer/qr-payment" element={currentUser?.role === 'customer' ? <QRCodePayment user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/customer/loyalty" element={currentUser?.role === 'customer' ? <LoyaltyRewards user={currentUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} /> : <Navigate to="/" />} />
          <Route path="/customer/checkout" element={currentUser?.role === 'customer' ? <PreOrderCheckout user={currentUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} /> : <Navigate to="/" />} />
          <Route path="/customer/profile" element={currentUser?.role === 'customer' ? <CustomerProfile user={currentUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} /> : <Navigate to="/" />} />

          {/* Vendor verification gate */}
          <Route path="/vendor/verification" element={currentUser?.role === 'vendor' ? <VendorDocumentSubmission user={currentUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} /> : <Navigate to="/" />} />

          {/* Vendor Routes — only accessible when approved */}
          <Route path="/vendor/dashboard" element={currentUser?.role === 'vendor' ? (currentUser.verificationStatus === 'approved' ? <VendorDashboard user={currentUser} onLogout={handleLogout} /> : <Navigate to="/vendor/verification" />) : <Navigate to="/" />} />
          <Route path="/vendor/analytics" element={currentUser?.role === 'vendor' ? (currentUser.verificationStatus === 'approved' ? <VendorSalesAnalytics user={currentUser} onLogout={handleLogout} /> : <Navigate to="/vendor/verification" />) : <Navigate to="/" />} />
          <Route path="/vendor/orders" element={currentUser?.role === 'vendor' ? (currentUser.verificationStatus === 'approved' ? <VendorOrderManagement user={currentUser} onLogout={handleLogout} /> : <Navigate to="/vendor/verification" />) : <Navigate to="/" />} />
          <Route path="/vendor/products" element={currentUser?.role === 'vendor' ? (currentUser.verificationStatus === 'approved' ? <VendorProductManagement user={currentUser} onLogout={handleLogout} /> : <Navigate to="/vendor/verification" />) : <Navigate to="/" />} />
          <Route path="/vendor/events" element={currentUser?.role === 'vendor' ? (currentUser.verificationStatus === 'approved' ? <VendorEvents user={currentUser} onLogout={handleLogout} /> : <Navigate to="/vendor/verification" />) : <Navigate to="/" />} />
          <Route path="/vendor/apply-events/:eventId" element={currentUser?.role === 'vendor' ? (currentUser.verificationStatus === 'approved' ? <VendorEventApplication user={currentUser} onLogout={handleLogout} /> : <Navigate to="/vendor/verification" />) : <Navigate to="/" />} />
          <Route path="/vendor/subscription" element={currentUser?.role === 'vendor' ? (currentUser.verificationStatus === 'approved' ? <VendorSubscription user={currentUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} /> : <Navigate to="/vendor/verification" />) : <Navigate to="/" />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={currentUser?.role === 'admin' ? <AdminDashboard user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/admin/events" element={currentUser?.role === 'admin' ? <AdminEventManagement user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/admin/events/:eventId/stalls" element={currentUser?.role === 'admin' ? <AdminEventStallConfig user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/admin/vendors" element={currentUser?.role === 'admin' ? <AdminVendorManagement user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/admin/applications" element={currentUser?.role === 'admin' ? <AdminApplicationManagement user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/admin/manage-admins" element={currentUser?.role === 'admin' ? <AdminManageAdmins user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/admin/vendor-verification" element={currentUser?.role === 'admin' ? <AdminVendorVerification user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

function getHomeRoute(role: UserRole): string {
  switch (role) {
    case 'customer': return '/customer/home';
    case 'vendor':   return '/vendor/dashboard';
    case 'admin':    return '/admin/dashboard';
    default:         return '/';
  }
}
