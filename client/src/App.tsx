import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Import all pages
import LandingPage from './app/page';
import PricingPage from './app/pricing/page';
import LoginPage from './app/(auth)/login/page';
import SignupPage from './app/(auth)/signup/page';
import VerifyOtpPage from './app/(auth)/verify-otp/page';

import CourierSelection from './app/(dashboard)/book/courier/page';
import AddressInput from './app/(dashboard)/book/address/page';
import EvidenceVault from './app/(dashboard)/book/evidence/page';
import ReviewAndPay from './app/(dashboard)/book/review/page';
// The Confirmed route technically had [awb] we'll route it as /book/confirmed or /book/confirmed/:awb
import ConfirmedPage from './app/(dashboard)/book/confirmed/[awb]/page';

import UserDashboard from './app/(dashboard)/dashboard/page';
import ShipmentsPage from './app/(dashboard)/shipments/page';
import ShipmentDetailPage from './app/(dashboard)/shipments/[id]/page';
import TrackingPage from './app/track/[awb]/page';
import ProfilePage from './app/(dashboard)/profile/page';
import CashOnDeliveryPortal from './app/(dashboard)/finances/page';
import InternationalBooking from './app/(dashboard)/book/international/page';
import AnalyticsDashboard from './app/(dashboard)/analytics/page';
import AdminDashboard from './app/(dashboard)/admin/page';
import PartnerDashboard from './app/(dashboard)/partner/page';
import NotificationsPage from './app/(dashboard)/notifications/page';
import PaymentFailedPage from './app/(dashboard)/book/payment-failed/page';
import KYCPage from './app/(dashboard)/profile/kyc/page';
import DelhiveryFailedPage from './app/track/[awb]/failed/page';
import AddressBookPage from './app/(dashboard)/profile/addresses/page';
import AddressFormPage from './app/(dashboard)/profile/addresses/add-edit/page';

function AppLayout({ children }: { children: React.ReactNode }) {
  // A simple layout wrapper
  return (
    <>
      {children}
    </>
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
            <Route path="/book/evidence" element={<ProtectedRoute><EvidenceVault /></ProtectedRoute>} />
            <Route path="/book/review" element={<ProtectedRoute><ReviewAndPay /></ProtectedRoute>} />
            <Route path="/book/confirmed" element={<ProtectedRoute><ConfirmedPage /></ProtectedRoute>} />
            <Route path="/book/confirmed/:awb" element={<ProtectedRoute><ConfirmedPage /></ProtectedRoute>} />
            
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
            
            <Route path="/cod-returns" element={<CashOnDeliveryPortal />} />
            <Route path="/international" element={<InternationalBooking />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/partner" element={<PartnerDashboard />} />
            
            {/* Catch-all to dashboard or landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </>
  )
}

export default App;
