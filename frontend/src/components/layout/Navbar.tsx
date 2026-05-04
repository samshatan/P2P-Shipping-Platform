import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ShieldAlert, Settings as SettingsIcon, History, Menu, X, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useBooking } from '../../context/BookingContext'

export function Navbar() {
  const { user } = useAuth()
  const { serviceType } = useBooking()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const isDomestic = serviceType === 'domestic'
  const themeGradient = isDomestic
    ? 'from-blue-600 via-cyan-500 to-blue-900'
    : 'from-purple-600 via-fuchsia-500 to-purple-900'

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 border-b-white/10 h-16 lg:h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer group">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-tr ${themeGradient} shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-all duration-500`}>
              <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">Parcel</span>
        </Link>

        {/* Center Nav */}
        <div className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/calculator" className="text-white font-black hover:text-white/80 transition-colors">Ship Now</Link>
          <Link to="/tracking" className="hover:text-white transition-colors">Tracking</Link>
          <Link to="/bulk" className="hover:text-white transition-colors">Bulk</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-brand-primary flex items-center gap-1 hover:text-brand-secondary transition-colors">
              <ShieldAlert className="w-4 h-4" /> Admin
            </Link>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/history"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all"
                title="History"
              >
                <History className="w-4 h-4" /> History
              </Link>
              <Link
                to="/settings"
                className="p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </Link>
              <Link
                to="/dashboard"
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white text-black hover:bg-white/90 transition-all shadow-xl shadow-white/10 flex items-center justify-center overflow-hidden border-2 border-white/20"
                title="Go to Dashboard"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 lg:w-5 lg:h-5" />
                )}
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/login"
                className="text-xs font-black uppercase tracking-widest text-white/80 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/calculator"
                className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest bg-white text-black hover:bg-white/90 transition-all shadow-xl shadow-white/10"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden text-white/80" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 bg-[#1c1c1e]/99 backdrop-blur-2xl shadow-2xl border-b border-white/10 p-6 flex flex-col gap-4 lg:hidden"
          >
            <Link to="/calculator" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-white/90 hover:text-white py-2">Ship Now</Link>
            <Link to="/tracking" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-white/90 hover:text-white py-2">Tracking</Link>
            <Link to="/bulk" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-white/90 hover:text-white py-2">Bulk</Link>
            <hr className="border-white/10 my-3" />
            {user?.role === 'ADMIN' && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-brand-primary hover:text-white py-2 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Admin Portal
              </Link>
            )}
            <div className="relative mt-2">
              {/* Premium Glow Effect */}
              <div className="absolute inset-0 bg-white/5 blur-[40px] rounded-full pointer-events-none -m-4"></div>
              
              <div className="relative flex flex-col gap-3">
                {!user ? (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="py-3.5 rounded-xl font-medium bg-[#1A1A1A] border border-white/10 text-white text-center hover:bg-white/10 transition-colors">Sign In</Link>
                    <Link to="/calculator" onClick={() => setMobileMenuOpen(false)} className="py-3.5 rounded-xl font-medium bg-white text-black text-center hover:bg-white/90 transition-colors shadow-lg shadow-white/5">Get Started</Link>
                  </>
                ) : (
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-3.5 rounded-xl font-medium bg-white text-black text-center hover:bg-white/90 transition-colors shadow-lg shadow-white/5">Go to Dashboard</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

  )
}
