import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, useScroll, useSpring, motion } from 'framer-motion'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { WelcomePage } from './pages/WelcomePage'
import { LandingPage as CalculatorPage } from './pages/LandingPage'
import { ResultsPage } from './pages/ResultsPage'
import { PartnerPage } from './pages/PartnerPage'
import { ScrollToTop } from './components/utils/ScrollToTop'
import { PageWrapper } from './components/layout/PageWrapper'

import { AuthPage } from './pages/AuthPage'
import { AddressForm } from './features/booking/AddressForm'
import { ReviewOrder } from './features/booking/ReviewOrder'
import { SuccessPage } from './features/booking/SuccessPage'
import { Dashboard } from './features/dashboard/Dashboard'
import { TrackingPage } from './features/tracking/TrackingPage'
import { BulkShipping } from './features/bulk/BulkShipping'
import { AdminPortal } from './features/admin/AdminPortal'

import { ShipmentHistory } from './features/shipments/ShipmentHistory'
import { SettingsPage } from './pages/SettingsPage'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { PricingPage } from './pages/PricingPage'
import { ContactPage } from './pages/ContactPage'
import { HelpPage } from './pages/HelpPage'
import { AboutPage } from './pages/AboutPage'
import { SustainabilityPage } from './pages/SustainabilityPage'
import { ComingSoonPage } from './pages/ComingSoonPage'


import { useAuth } from './context/AuthContext'
import { useBooking } from './context/BookingContext'
import { Toaster } from 'sonner'
import { useState, useEffect } from 'react'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoading: authLoading } = useAuth()
  const { clearBooking, serviceType } = useBooking()
  const isDomestic = serviceType === 'domestic'

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main text-text-main font-sans">
        <div className="font-bold text-xl animate-pulse">Loading Parcel...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col font-sans bg-bg-main text-text-main transition-all duration-500 relative min-h-screen">
      <ScrollToTop />
      <Toaster position="top-right" richColors />

      
      {/* Universal Background Animated Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ background: isDomestic ? 'rgba(59, 130, 246, 0.15)' : 'rgba(168, 85, 247, 0.15)' }}
          transition={{ duration: 1 }}
          className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div 
          animate={{ background: isDomestic ? 'rgba(6, 182, 212, 0.1)' : 'rgba(217, 70, 239, 0.1)' }}
          transition={{ duration: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] mix-blend-screen"
        />
      </div>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-primary z-[100] origin-left"
        style={{ scaleX }}
      />

      <Navbar />
      
      <main className={`flex-1 ${location.pathname === '/' ? '' : 'max-w-7xl mx-auto w-full px-6 py-12 sm:py-24 text-center relative z-10'}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/calculator" element={<PageWrapper><CalculatorPage /></PageWrapper>} />
            <Route path="/results" element={<PageWrapper><ResultsPage /></PageWrapper>} />
            <Route path="/partner" element={<PageWrapper><PartnerPage /></PageWrapper>} />
            <Route path="/history" element={<PageWrapper><ShipmentHistory /></PageWrapper>} />
            
            <Route 
              path="/login" 
              element={<PageWrapper><AuthPage /></PageWrapper>} 
            />
            <Route 
              path="/signup" 
              element={<PageWrapper><AuthPage /></PageWrapper>} 
            />
            
            <Route 
              path="/book/address" 
              element={<PageWrapper><AddressForm onNext={() => navigate('/book/review')} onBack={() => navigate(-1)} /></PageWrapper>} 
            />
            <Route 
              path="/book/review" 
              element={<PageWrapper><ReviewOrder onNext={() => navigate('/book/success')} onBack={() => navigate(-1)} /></PageWrapper>} 
            />
            <Route 
              path="/book/success" 
              element={
                <PageWrapper>
                  <SuccessPage 
                    onDashboard={() => navigate('/dashboard')} 
                    onHome={() => { navigate('/'); clearBooking(); }} 
                  />
                </PageWrapper>
              } 
            />
            
            <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
            <Route path="/tracking" element={<PageWrapper><TrackingPage /></PageWrapper>} />
            <Route path="/bulk" element={<PageWrapper><BulkShipping /></PageWrapper>} />
            <Route path="/admin" element={<PageWrapper><AdminPortal /></PageWrapper>} />
            <Route path="/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
            <Route path="/terms" element={<PageWrapper><TermsPage /></PageWrapper>} />
            <Route path="/privacy" element={<PageWrapper><PrivacyPage /></PageWrapper>} />
            <Route path="/pricing" element={<PageWrapper><PricingPage /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
            <Route path="/sustainability" element={<PageWrapper><SustainabilityPage /></PageWrapper>} />
            <Route path="/help" element={<PageWrapper><HelpPage /></PageWrapper>} />
            <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
            <Route path="/status" element={<PageWrapper><ComingSoonPage title="System Status" /></PageWrapper>} />
            <Route path="/api-docs" element={<PageWrapper><ComingSoonPage title="API Documentation" /></PageWrapper>} />
          </Routes>

        </AnimatePresence>
      </main>

      {location.pathname !== '/' && <Footer />}
    </div>
  )
}

export default App
