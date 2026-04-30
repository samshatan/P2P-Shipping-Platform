import React from 'react'
import { CheckCircle2, ArrowRight, LayoutDashboard, Printer, Share2, Package } from 'lucide-react'

export function SuccessPage({ onDashboard, onHome }: { onDashboard: () => void, onHome: () => void }) {
  // Generate a mock tracking ID for the demo
  const trackingId = 'SE' + Math.random().toString(36).substr(2, 9).toUpperCase()

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in zoom-in duration-700">
      <div className="bg-bg-main p-12 sm:p-16 rounded-[3rem] shadow-2xl shadow-brand-primary/5 border border-border-main text-center glass relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent"></div>
        
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-10 animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>

        <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight">Booking Confirmed!</h2>
        <p className="text-xl text-text-muted mb-10 leading-relaxed font-medium">
          Your shipment has been successfully booked. Our courier partner will arrive at your pickup location shortly.
        </p>

        <div className="bg-bg-soft p-8 rounded-3xl border border-border-main mb-12 group">
          <p className="text-xs font-black text-text-muted uppercase tracking-[0.3em] mb-3">Your Tracking ID</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-3xl sm:text-4xl font-black tracking-widest text-brand-primary select-all">
              {trackingId}
            </span>
            <button className="p-2 hover:bg-white dark:hover:bg-bg-main rounded-lg transition-colors text-text-muted hover:text-brand-primary">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <button className="h-14 bg-bg-soft border border-border-main rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-bg-main transition-all">
            <Printer className="w-5 h-5" /> Print Label
          </button>
          <button 
            onClick={onDashboard}
            className="h-14 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/20"
          >
            <LayoutDashboard className="w-5 h-5" /> Go to Dashboard
          </button>
        </div>

        <button 
          onClick={onHome}
          className="text-sm font-black text-text-muted uppercase tracking-widest hover:text-brand-primary transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          Book another package <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
        <div className="flex gap-4 p-6 bg-bg-main rounded-3xl border border-border-main shadow-sm">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h4 className="font-black mb-1">What's next?</h4>
            <p className="text-sm text-text-muted font-medium">Pack your item securely and stick the label on top before the courier arrives.</p>
          </div>
        </div>
        <div className="flex gap-4 p-6 bg-bg-main rounded-3xl border border-border-main shadow-sm">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h4 className="font-black mb-1">Stay Notified</h4>
            <p className="text-sm text-text-muted font-medium">We'll send you real-time updates on WhatsApp and Email for every step of the journey.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
