import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Globe, 
  Zap, 
  ShieldCheck, 
  Calculator, 
  ArrowRight,
  MapPin,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { Footer } from '../components/layout/Footer'

export function WelcomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setServiceType } = useBooking();
  const [shippingMode, setShippingMode] = useState<'domestic' | 'international'>('domestic');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic theme colors based on mode
  const isDomestic = shippingMode === 'domestic';
  const themeGradient = isDomestic 
    ? 'from-blue-600 via-cyan-500 to-blue-900' 
    : 'from-purple-600 via-fuchsia-500 to-purple-900';
  
  const handleStart = () => {
    setServiceType(shippingMode);
    navigate('/calculator');
  };

  return (
    <div className="min-h-screen text-white overflow-hidden font-sans selection:bg-white/20 relative">
      
      {/* Background Animated Blobs */}

      {/* Main Content */}
      <main className="relative z-10 pt-12 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mt-8 md:mt-24 mb-20 md:mb-32">
          
          {/* Mode Switcher */}
          <div className="glass-panel p-1.5 rounded-full flex items-center mb-10 w-max mx-auto shadow-2xl relative">
            <div 
              className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-white/10 rounded-full transition-all duration-300 ease-out z-0 ${isDomestic ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`}
            />
            <button 
              onClick={() => setShippingMode('domestic')}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${isDomestic ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              <Package className="w-4 h-4" /> Domestic
            </button>
            <button 
              onClick={() => setShippingMode('international')}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${!isDomestic ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              <Globe className="w-4 h-4" /> International
            </button>
          </div>

          <div className="relative overflow-hidden min-h-[200px] w-full flex flex-col items-center">
            <AnimatePresence mode="popLayout">
              <motion.h1 
                key={shippingMode}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1] mb-8"
              >
                Global Shipping, <br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeGradient}`}>
                  {isDomestic ? 'Locally Simplified.' : 'Entire Planet.'}
                </span>
              </motion.h1>
            </AnimatePresence>
          </div>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Aggregate {isDomestic ? 'high-speed delivery across 29,000+ pin codes in India.' : 'seamless connections to 220+ countries worldwide.'} Compare rates across 20+ top-tier partners instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
            >
              Compare Rates Now <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigate('/tracking')}
              className="w-full sm:w-auto px-8 py-4 rounded-full glass-panel font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Calculator className="w-4 h-4" /> Track Package
            </button>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 text-left">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Powerful Aggregation.</h2>
            <p className="text-white/50 text-lg max-w-xl">Everything you need to manage personal parcels and massive e-commerce volumes seamlessly.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-panel p-8 rounded-3xl md:col-span-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-32 h-32" />
              </div>
              <div className="relative z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Real-Time Price Comparison</h3>
              <p className="text-white/60 max-w-md">Dynamic computation across our 20+ partner APIs. Find the fastest ETD or the lowest price in milliseconds. Dimensional weight considered automatically.</p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
              <div className="relative z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Cross-Border Easy</h3>
              <p className="text-white/60">Fully automated customs orientation and localized country-selector systems.</p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
              <div className="relative z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Secure & Protected</h3>
              <p className="text-white/60">Robust Google OAuth and JWT-backed profiles to keep your shipping data entirely safe.</p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel p-8 rounded-3xl md:col-span-2 relative overflow-hidden group flex flex-col justify-end min-h-[300px]">
              <div className="absolute inset-x-8 top-8 bottom-32 bg-gradient-to-t from-white/5 to-transparent rounded-t-xl border-x border-t border-white/10 p-6 flex flex-col justify-end">
                 <div className="w-full h-4 bg-white/20 rounded-full mb-3 w-1/3"></div>
                 <div className="w-full h-12 bg-white/10 rounded-lg flex items-center px-4">
                   <div className="w-3 h-3 rounded-full bg-green-400 mr-3"></div>
                   <div className="text-xs text-white/50 font-mono uppercase tracking-widest">AWB-DEL-9842X</div>
                 </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-semibold mb-2 mt-4">Unified Dashboard</h3>
                <p className="text-white/60 max-w-md">Centralized hub. Track active shipments, manage addresses, and view comprehensive history in one place.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee / Partners Section */}
        <section id="partners" className="py-24 border-y border-white/5 relative overflow-hidden">
             <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10" />
             <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10" />
             
             <p className="text-center text-sm font-semibold tracking-widest uppercase text-white/40 mb-10">
               Trusted 20+ Tier-1 Logistics Partners
             </p>
             <div className="flex gap-12 sm:gap-24 items-center justify-between w-max animate-[marquee_20s_linear_infinite] opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {['Delhivery', 'BlueDart', 'FedEx', 'DHL', 'XpressBees', 'EcomExpress', 'Delhivery', 'BlueDart'].map((p, i) => (
                  <span key={i} className="text-2xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
                    {p}
                  </span>
                ))}
             </div>
        </section>

        {/* Footer CTA */}
        <section className="py-32 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">Ready to Parcel?</h2>
            <p className="text-white/40 md:text-xl max-w-md mb-12">
              Join thousands of businesses and individuals optimizing their logistics.
            </p>
            <button 
              onClick={() => navigate('/signup')}
              className={`px-12 py-5 rounded-full bg-gradient-to-r ${themeGradient} text-white font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-primary-blue/20`}
            >
              Create Free Account <ArrowRight className="w-5 h-5" />
            </button>
        </section>
      </main>

      {/* CSS for Marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <Footer/>
    </div>
  );
}
