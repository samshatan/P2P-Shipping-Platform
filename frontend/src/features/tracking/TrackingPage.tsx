import React, { useState } from 'react'
import { Search, MapPin, Truck, CheckCircle2, Box, ArrowLeft, Loader2, AlertCircle, Calendar, Clock, Ship, ShieldCheck, Map, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { toast } from 'sonner'
import { API_BASE_URL } from '../../config/api'

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

  // Calculate progress percentage
  const getProgress = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes('delivered')) return 100
    if (s.includes('out for delivery')) return 85
    if (s.includes('transit')) return 60
    if (s.includes('shipped')) return 40
    if (s.includes('pickup')) return 20
    return 10
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 text-left min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-16"
      >
        <div className="w-24 h-24 bg-brand-primary/10 rounded-[2.5rem] flex items-center justify-center mb-8 relative group">
          <div className="absolute inset-0 bg-brand-primary/20 rounded-[2.5rem] animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <Truck className="w-12 h-12 text-brand-primary relative z-10 transition-transform group-hover:scale-110" />
        </div>
        <h2 className="text-4xl md:text-6xl font-display font-black mb-6 tracking-tight">Follow Your Parcel</h2>
        <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-medium">
          Real-time insights into your package's global journey. <br />
          <span className="text-brand-primary/80">Every mile, every scan, instantly.</span>
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto bg-bg-main p-3 sm:p-4 rounded-[2.5rem] shadow-2xl border border-border-main glass mb-20">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-primary transition-colors z-20" />
            <input 
              type="text" 
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              placeholder="Enter AWB or Tracking ID..." 
              className="w-full h-16 pl-14 pr-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-lg transition-all relative z-10"
            />
          </div>
          <button 
            disabled={isLoading}
            className="h-16 px-10 bg-brand-primary text-white rounded-2xl font-black text-lg hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/20 active:scale-95 disabled:opacity-50 shrink-0 w-full sm:w-auto uppercase tracking-widest"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Search'}
          </button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-red-500/5 border border-red-500/20 p-10 rounded-[3rem] flex flex-col items-center text-center space-y-6"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-red-500 mb-2">Tracking ID not found</h3>
               <p className="text-lg font-bold text-text-muted max-w-md">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-sm font-bold uppercase tracking-widest text-text-muted hover:text-text-main transition-colors">Dismiss</button>
          </motion.div>
        )}

        {data && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-32"
          >
            {/* Exploration Header: Visual Route */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-bg-main p-8 sm:p-12 rounded-[3.5rem] border border-border-main shadow-xl glass relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-primary/10 transition-colors"></div>
                
                <div className="relative z-10 space-y-10">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="space-y-1">
                      <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.4em]">Current Location</p>
                      <h4 className="text-2xl sm:text-4xl font-display font-black flex items-center gap-3">
                        <MapPin className="w-8 h-8 text-orange-500 animate-bounce" /> {data.current_location}
                      </h4>
                    </div>
                    <div className="px-5 py-2.5 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20">
                      {data.current_status.replace(/_/g, ' ')}
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end text-[10px] font-black text-text-muted uppercase tracking-widest">
                      <span>Pickup</span>
                      <span className="text-brand-primary text-sm">{getProgress(data.current_status)}% Completed</span>
                      <span>Delivery</span>
                    </div>
                    <div className="h-4 bg-bg-soft rounded-full border border-border-main p-1 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgress(data.current_status)}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-brand-primary to-cyan-400 rounded-full shadow-lg shadow-brand-primary/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
                    {[
                      { label: 'Courier', value: data.courier, icon: ShieldCheck },
                      { label: 'AWB', value: data.awb, icon: Box },
                      { label: 'Last Scan', value: '12:45 PM', icon: Clock },
                      { label: 'Service', value: 'Express', icon: Zap }
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                          <item.icon className="w-3 h-3" /> {item.label}
                        </p>
                        <p className="font-bold text-sm text-text-main">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delivery Estimation Card */}
              <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-1 rounded-[3.5rem] shadow-2xl">
                <div className="bg-bg-main h-full w-full rounded-[3.4rem] p-10 flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-brand-primary/5 pointer-events-none"></div>
                  <div className="w-24 h-24 bg-brand-primary/10 rounded-[2.5rem] flex items-center justify-center rotate-6">
                     <Calendar className="w-12 h-12 text-brand-primary" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mb-2">Estimated Delivery</h5>
                    <h4 className="text-3xl font-display font-black text-brand-primary">Thursday</h4>
                    <p className="text-sm font-bold text-text-muted mt-1">May 8th, 2026</p>
                  </div>
                  <div className="pt-4 border-t border-border-main w-full">
                    <p className="text-xs font-medium text-text-muted italic">"Your package is moving faster than expected!"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Exploring Timeline Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
               {/* Left Column: Tips & Info */}
               <div className="hidden lg:block space-y-8">
                  <div className="p-8 rounded-[2.5rem] border border-border-main glass space-y-6">
                    <h4 className="font-display font-black text-xl">Travel Guide</h4>
                    <div className="space-y-6">
                       {[
                         { title: 'In Transit', desc: 'Package is moving between hubs via air or surface.', icon: Ship },
                         { title: 'Out for Delivery', desc: 'The final mile! Your delivery agent is on their way.', icon: Truck },
                         { title: 'Delivered', desc: 'Successfully handed over or placed in a secure spot.', icon: CheckCircle2 }
                       ].map((step, i) => (
                         <div key={i} className="flex gap-4">
                           <div className="w-10 h-10 rounded-xl bg-bg-soft flex items-center justify-center shrink-0">
                             <step.icon className="w-5 h-5 text-brand-primary" />
                           </div>
                           <div>
                             <p className="font-bold text-sm">{step.title}</p>
                             <p className="text-xs text-text-muted leading-relaxed">{step.desc}</p>
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                  
                  <div className="p-8 rounded-[2.5rem] bg-brand-primary/5 border border-brand-primary/10 space-y-4">
                     <p className="text-xs font-bold text-brand-primary uppercase tracking-widest">Need help?</p>
                     <p className="text-sm font-medium text-text-muted">If your package hasn't moved for 48 hours, contact our priority support.</p>
                     <button className="text-[10px] font-black text-white bg-brand-primary px-4 py-2 rounded-lg uppercase tracking-widest hover:bg-brand-secondary transition-all">Support Center</button>
                  </div>
               </div>

               {/* Right Column: Detailed Timeline */}
               <div className="lg:col-span-2 space-y-8">
                  <h3 className="text-2xl sm:text-4xl font-display font-black tracking-tight flex items-center gap-4">
                    Step-by-Step History <span className="h-1 flex-1 bg-border-main rounded-full"></span>
                  </h3>
                  
                  <div className="relative pl-10 sm:pl-16 space-y-12">
                    {/* Vertical Line */}
                    <div className="absolute left-[23px] sm:left-[31px] top-4 bottom-4 w-1 bg-bg-soft rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: '100%' }}
                         transition={{ duration: 1.5 }}
                         className="w-full bg-gradient-to-b from-brand-primary via-cyan-400 to-transparent"
                       />
                    </div>

                    {data.events.map((event, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative group"
                      >
                        {/* Timeline Marker */}
                        <div className={`absolute -left-[35px] sm:-left-[43px] w-[50px] sm:w-[64px] h-[50px] sm:h-[64px] rounded-2xl sm:rounded-3xl border-4 border-bg-main flex items-center justify-center z-10 transition-all duration-500 group-hover:scale-110 ${
                          i === 0 
                          ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/30' 
                          : 'bg-bg-soft text-text-muted group-hover:border-brand-primary/30'
                        }`}>
                          {getStatusIcon(event.status, i === 0)}
                        </div>

                        <div className="bg-bg-main p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-border-main group-hover:border-brand-primary/20 transition-all shadow-sm group-hover:shadow-xl">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                               <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em] mb-1">
                                 {new Date(event.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                               </p>
                               <h4 className={`text-xl sm:text-2xl font-black tracking-tight ${i === 0 ? 'text-text-main' : 'text-text-muted'}`}>
                                 {event.status.replace(/_/g, ' ')}
                               </h4>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-bg-soft/50 rounded-xl border border-border-main w-fit">
                               <Clock className="w-3.5 h-3.5 text-text-muted" />
                               <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                 {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>
                          </div>
                          
                          <p className={`text-base sm:text-lg font-medium leading-relaxed mb-6 ${i === 0 ? 'text-text-muted' : 'text-text-muted/60'}`}>
                            {event.description}
                          </p>
                          
                          <div className="flex items-center gap-3">
                             <div className="p-2 rounded-lg bg-bg-soft border border-border-main">
                                <MapPin className="w-4 h-4 text-brand-primary" />
                             </div>
                             <span className="text-xs font-black uppercase tracking-widest text-text-main">{event.location}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
