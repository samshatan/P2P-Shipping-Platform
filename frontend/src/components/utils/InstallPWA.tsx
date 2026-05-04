import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Sparkles } from 'lucide-react'

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Wait for 3 seconds before showing the prompt
      const timer = setTimeout(() => {
        // Only show if the user hasn't dismissed it in this session
        if (!sessionStorage.getItem('pwaPromptDismissed')) {
          setShowPrompt(true)
        }
      }, 3000)

      return () => clearTimeout(timer)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    sessionStorage.setItem('pwaPromptDismissed', 'true')
  }

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[100]"
        >
          <div className="bg-bg-main border border-brand-primary/20 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(37,99,235,0.2)] glass relative overflow-hidden group">
            {/* Animated Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-primary/20 transition-all duration-700"></div>
            
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main rounded-full hover:bg-bg-soft transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-5 items-start relative z-10">
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 via-cyan-500 to-blue-900 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <Download className="w-7 h-7 text-white" />
              </div>
              
              <div className="space-y-1 pr-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">Recommended</span>
                  <Sparkles className="w-3 h-3 text-brand-primary" />
                </div>
                <h4 className="font-black text-lg tracking-tight">Download Parcel</h4>
                <p className="text-sm text-text-muted font-medium leading-relaxed">
                  Install our app for a faster, premium shipping experience.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3 relative z-10">
              <button
                onClick={handleInstall}
                className="flex-1 h-12 bg-brand-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
              >
                Install Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-6 h-12 bg-bg-soft text-text-muted rounded-xl font-black text-xs uppercase tracking-widest hover:bg-border-main transition-all active:scale-95"
              >
                Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
