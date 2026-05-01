import React, { useState } from 'react'
import { Search, MapPin, Truck, CheckCircle2, Box, ArrowLeft, Loader2, AlertCircle, Calendar, Clock, Ship, ShieldCheck, Map } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { toast } from 'sonner'

interface TrackingEvent {
  status: string
  location: string
  description: string
  timestamp: string
}

interface TrackingData {
  awb: string
  courier: string
  current_status: string
  current_location: string
  events: TrackingEvent[]
}

const getStatusIcon = (status: string, isLatest: boolean) => {
  const s = status.toLowerCase()
  if (s.includes('delivered')) return <CheckCircle2 className={isLatest ? "w-7 h-7" : "w-5 h-5"} />
  if (s.includes('out for delivery')) return <Truck className={isLatest ? "w-7 h-7" : "w-5 h-5"} />
  if (s.includes('transit') || s.includes('shipped')) return <Ship className={isLatest ? "w-7 h-7" : "w-5 h-5"} />
  if (s.includes('pickup') || s.includes('collected')) return <Box className={isLatest ? "w-7 h-7" : "w-5 h-5"} />
  if (s.includes('booked') || s.includes('initiated')) return <Clock className={isLatest ? "w-7 h-7" : "w-5 h-5"} />
  return <MapPin className={isLatest ? "w-7 h-7" : "w-5 h-5"} />
}

import { API_BASE_URL } from '../../config/api'

export function TrackingPage() {
  const [awb, setAwb] = useState('')
  const [data, setData] = useState<TrackingData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!awb || awb.trim().length < 5) {
      toast.error('Please enter a valid tracking ID')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await axios.get(`${API_BASE_URL}/tracking/${awb}`)
      if (response.data.success) {
        setData(response.data.data)
      } else {
        setError(response.data.error.message)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Could not find tracking details for this ID.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-left">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="w-20 h-20 bg-brand-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-brand-primary/20 rounded-[2.5rem] animate-ping opacity-20"></div>
          <Truck className="w-10 h-10 text-brand-primary relative z-10" />
        </div>
        <h2 className="text-5xl font-black mb-6 tracking-tight">Track Your Journey</h2>
        <p className="text-xl text-text-muted max-w-xl mx-auto leading-relaxed font-medium">
          Enter your Tracking ID to follow your package across the world in real-time.
        </p>
      </motion.div>

      <div className="bg-bg-main p-4 sm:p-6 rounded-[2.5rem] shadow-2xl shadow-brand-primary/5 border border-border-main glass mb-16">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-primary transition-colors z-20" />
            <input 
              type="text" 
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              placeholder="Enter AWB or Tracking ID" 
              className="w-full h-16 pl-14 pr-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-lg transition-all relative z-10"
            />
          </div>
          <button 
            disabled={isLoading}
            className="h-16 px-12 bg-brand-primary text-white rounded-2xl font-black text-lg hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/20 active:scale-95 disabled:opacity-50 shrink-0"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Track Package'}
          </button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2rem] flex flex-col items-center text-center space-y-4"
          >
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div>
               <h3 className="text-xl font-black text-red-500 mb-1">Tracking Failed</h3>
               <p className="font-bold text-text-muted">{error}</p>
            </div>
          </motion.div>
        )}

        {data && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 pb-20"
          >
            {/* Status Overview Card */}
            <div className="bg-bg-main p-8 sm:p-10 rounded-[3rem] border border-border-main shadow-xl glass overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Tracking ID</p>
                  <div className="space-y-1">
                    <h4 className="text-3xl font-black tracking-tight">{data.awb}</h4>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase rounded-full border border-brand-primary/20">
                      <ShieldCheck className="w-3 h-3" /> {data.courier}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Live Status</p>
                  <div className="space-y-1">
                    <h4 className="text-3xl font-black text-brand-primary uppercase tracking-tighter italic">
                      {data.current_status.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                       <Clock className="w-3.5 h-3.5" /> Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Destination</p>
                  <div className="space-y-1">
                    <h4 className="text-3xl font-black flex items-center gap-2 tracking-tight">
                      <Map className="w-6 h-6 text-orange-500" /> {data.current_location}
                    </h4>
                    <p className="text-xs font-bold text-text-muted">Estimated Delivery: Today</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Interactive Timeline */}
            <div className="bg-bg-main p-8 sm:p-16 rounded-[3.5rem] border border-border-main shadow-sm glass relative overflow-hidden">
              <h3 className="text-3xl font-black mb-16 tracking-tight">Package Journey</h3>
              
              <div className="relative">
                {/* Vertical Progress Line */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'calc(100% - 48px)' }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute left-6 top-6 w-[3px] bg-gradient-to-b from-brand-primary via-brand-primary/40 to-border-main"
                ></motion.div>

                <div className="space-y-16">
                  {data.events.length > 0 ? data.events.map((event, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="relative flex gap-12 group"
                    >
                      {/* Timeline Node */}
                      <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 z-10 transition-all duration-500 group-hover:rotate-12 ${
                        i === 0 
                        ? 'bg-brand-primary text-white shadow-[0_10px_30px_rgba(37,99,235,0.4)] scale-125' 
                        : 'bg-bg-soft border border-border-main text-text-muted group-hover:border-brand-primary/50'
                      }`}>
                        {getStatusIcon(event.status, i === 0)}
                      </div>

                      <div className="space-y-2 flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-4">
                          <h4 className={`text-2xl font-black tracking-tight ${i === 0 ? 'text-text-main' : 'text-text-muted/80'}`}>
                            {event.status.replace(/_/g, ' ')}
                          </h4>
                          <div className="flex items-center gap-3 bg-bg-soft/50 border border-border-main px-3 py-1.5 rounded-xl">
                            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-main">
                              {new Date(event.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        
                        <p className={`text-lg font-medium leading-relaxed max-w-2xl ${i === 0 ? 'text-text-muted' : 'text-text-muted/60'}`}>
                          {event.description}
                        </p>
                        
                        <div className="flex items-center gap-2.5 pt-3">
                          <div className="w-8 h-[1px] bg-brand-primary/30"></div>
                          <p className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" /> {event.location}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="flex flex-col items-center py-20 space-y-6">
                      <div className="w-24 h-24 bg-bg-soft rounded-full flex items-center justify-center animate-pulse">
                        <Loader2 className="w-12 h-12 text-text-muted" />
                      </div>
                      <p className="text-text-muted font-black text-xl uppercase tracking-widest">Waiting for carrier update...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
