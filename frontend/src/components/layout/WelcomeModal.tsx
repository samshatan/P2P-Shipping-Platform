import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Globe, Truck, ArrowRight, Search, ShieldCheck, Zap, X } from 'lucide-react'

interface WelcomeModalProps {
  onComplete: (selection: 'domestic' | 'international') => void
  onTrack: () => void
}

export function WelcomeModal({ onComplete, onTrack }: WelcomeModalProps) {
  const [step, setStep] = useState<'intro' | 'selection'>('intro')

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-bg-main/95 backdrop-blur-xl"
    >
      <div className="max-w-5xl w-full max-h-[90vh] overflow-y-auto bg-bg-main rounded-[3rem] border border-border-main shadow-2xl relative glass">
        <AnimatePresence mode="wait">
          {step === 'intro' ? (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 sm:p-16 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest mb-8">
                <Zap className="w-4 h-4" /> The Future of Logistics
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-black mb-8 leading-tight tracking-tight">
                Ship Anything, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent animate-gradient">
                  Anywhere in Seconds.
                </span>
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 text-left items-center">
                <div className="space-y-6">
                  <p className="text-lg text-text-muted font-medium leading-relaxed">
                    Parcel is India's premium P2P shipping aggregator. We connect you with 20+ top-tier courier partners like Delhivery, BlueDart, and FedEx to ensure your package reaches its destination safely and at the lowest possible cost.
                  </p>
                  <ul className="space-y-4">
                    {[
                      { icon: Search, text: 'Real-time price comparison' },
                      { icon: ShieldCheck, text: 'Secure AI-powered tracking' },
                      { icon: Truck, text: 'Doorstep pickup across 29,000+ pin codes' }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 font-bold text-sm">
                        <div className="p-2 rounded-lg bg-brand-primary/5 text-brand-primary">
                          <item.icon className="w-4 h-4" />
                        </div>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-brand-primary/20 rounded-3xl blur-3xl group-hover:bg-brand-primary/30 transition-all"></div>
                  <img 
                    src="/delivery_hero.png" 
                    alt="Delivery Illustration" 
                    className="relative z-10 rounded-[2rem] border border-border-main shadow-2xl group-hover:scale-[1.02] transition-transform duration-700"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button 
                  onClick={() => setStep('selection')}
                  className="w-full sm:w-auto px-12 h-16 bg-brand-primary text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-brand-secondary transition-all hover:translate-y-[-4px] active:translate-y-0 shadow-2xl shadow-brand-primary/30"
                >
                  Get Started <ArrowRight className="w-6 h-6" />
                </button>
                <button 
                  onClick={onTrack}
                  className="w-full sm:w-auto px-10 h-16 bg-bg-soft border-2 border-border-main text-text-main rounded-2xl font-black text-lg hover:bg-bg-main transition-all flex items-center justify-center gap-3"
                >
                  <Search className="w-5 h-5" /> Track Package
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="p-8 sm:p-16 text-center"
            >
              <h2 className="text-4xl font-black mb-4">Choose Service Type</h2>
              <p className="text-text-muted font-medium mb-12">Where are you shipping today?</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <button 
                  onClick={() => onComplete('domestic')}
                  className="group p-10 bg-bg-soft border-2 border-border-main rounded-[2.5rem] hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left space-y-6 relative overflow-hidden"
                >
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                    <Truck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black mb-2">Domestic</h3>
                    <p className="text-sm text-text-muted font-medium leading-relaxed">Ship across 29,000+ pin codes within India. Fast, secure, and reliable.</p>
                  </div>
                  <div className="absolute bottom-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                    <ArrowRight className="w-6 h-6 text-brand-primary" />
                  </div>
                </button>

                <button 
                  onClick={() => onComplete('international')}
                  className="group p-10 bg-bg-soft border-2 border-border-main rounded-[2.5rem] hover:border-brand-accent hover:bg-brand-accent/5 transition-all text-left space-y-6 relative overflow-hidden"
                >
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform">
                    <Globe className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black mb-2">International</h3>
                    <p className="text-sm text-text-muted font-medium leading-relaxed">Deliver to 220+ countries with simplified customs and global tracking.</p>
                  </div>
                  <div className="absolute bottom-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                    <ArrowRight className="w-6 h-6 text-brand-accent" />
                  </div>
                </button>
              </div>

              <button 
                onClick={() => setStep('intro')}
                className="mt-12 text-sm font-black text-text-muted uppercase tracking-widest hover:text-brand-primary transition-colors"
              >
                Go Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
