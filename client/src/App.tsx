import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Import all pages
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';

import CourierSelection from './pages/booking/CourierSelectionPage';
import AddressInput from './pages/booking/AddressInputPage';
import ReviewAndPay from './pages/booking/ReviewAndPayPage';
import ConfirmedPage from './pages/booking/ConfirmedPage';
import BulkShipmentPage from './pages/booking/BulkShipmentPage';

import UserDashboard from './pages/dashboard/DashboardPage';
import ShipmentsPage from './pages/shipments/ShipmentsListPage';
import ShipmentDetailPage from './pages/shipments/ShipmentDetailPage';
import TrackingPage from './pages/tracking/TrackingPage';
import ProfilePage from './pages/profile/ProfilePage';
import InternationalBooking from './pages/booking/InternationalBookingPage';
import AnalyticsDashboard from './pages/dashboard/AnalyticsDashboardPage';
import AdminDashboard from './pages/admin/AdminDashboardPage';
import PartnerDashboard from './pages/dashboard/PartnerDashboardPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import PaymentFailedPage from './pages/booking/PaymentFailedPage';
import KYCPage from './pages/profile/KYCPage';
import DelhiveryFailedPage from './pages/tracking/TrackingFailedPage';
import AddressBookPage from './pages/profile/AddressBookPage';
import AddressFormPage from './pages/profile/AddressFormPage';

import { useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

/**
 * BE3 — Day 11: Updated App Routes
 * Removed Evidence Vault and COD Returns routes.
 * Streamlined booking flow.
 */
function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const authPaths = ['/login', '/signup', '/verify-otp'];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Navbar />}
      <main className={!isAuthPage ? "flex-1 pt-24" : "flex-1"}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            
            <Route path="/compare" element={<CourierSelection />} />
            
            <Route path="/book/address" element={<ProtectedRoute><AddressInput /></ProtectedRoute>} />
            <Route path="/book/courier" element={<ProtectedRoute><CourierSelection /></ProtectedRoute>} />
            <Route path="/book/review" element={<ProtectedRoute><ReviewAndPay /></ProtectedRoute>} />
            <Route path="/book/confirmed" element={<ProtectedRoute><ConfirmedPage /></ProtectedRoute>} />
            <Route path="/book/confirmed/:awb" element={<ProtectedRoute><ConfirmedPage /></ProtectedRoute>} />
            <Route path="/book/bulk" element={<ProtectedRoute><BulkShipmentPage /></ProtectedRoute>} />
            
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/shipments" element={<ProtectedRoute><ShipmentsPage /></ProtectedRoute>} />
            <Route path="/shipments/:id" element={<ProtectedRoute><ShipmentDetailPage /></ProtectedRoute>} />
            <Route path="/track/:awb" element={<TrackingPage />} />
            <Route path="/track/:awb/failed" element={<DelhiveryFailedPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/kyc" element={<ProtectedRoute><KYCPage /></ProtectedRoute>} />
            <Route path="/profile/addresses" element={<ProtectedRoute><AddressBookPage /></ProtectedRoute>} />
            <Route path="/profile/addresses/add" element={<ProtectedRoute><AddressFormPage /></ProtectedRoute>} />
            <Route path="/profile/addresses/edit/:id" element={<ProtectedRoute><AddressFormPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/book/payment-failed" element={<ProtectedRoute><PaymentFailedPage /></ProtectedRoute>} />
            
            <Route path="/international" element={<InternationalBooking />} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/partner" element={<PartnerDashboard />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </>
  )
}

export default App;
