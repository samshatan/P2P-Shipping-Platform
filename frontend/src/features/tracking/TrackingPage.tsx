import React, { useState } from 'react'
import { Search, MapPin, Truck, CheckCircle2, Box, ArrowLeft, Loader2, AlertCircle, Calendar } from 'lucide-react'
import axios from 'axios'

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

export function TrackingPage() {
  const [awb, setAwb] = useState('')
  const [data, setData] = useState<TrackingData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!awb || awb.trim().length < 5) {
      alert('Please enter a valid tracking ID')
      return
    }

    setIsLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await axios.get(`http://localhost:3001/tracking/${awb}`)
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
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 text-left">
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-float">
          <Truck className="w-10 h-10 text-brand-primary" />
        </div>
        <h2 className="text-5xl font-black mb-6 tracking-tight">Track Your Package</h2>
        <p className="text-xl text-text-muted max-w-xl mx-auto leading-relaxed">
          Enter your Tracking ID to see the real-time status of your shipment from any of our 20+ partners.
        </p>
      </div>

      <div className="bg-bg-main p-4 sm:p-6 rounded-[2.5rem] shadow-2xl shadow-brand-primary/5 border border-border-main glass mb-16">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-brand-primary/5 rounded-2xl scale-95 opacity-0 group-focus-within:scale-100 group-focus-within:opacity-100 transition-all duration-500"></div>
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              placeholder="Enter Tracking ID (e.g. SE8B29C)" 
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

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-8 rounded-3xl flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-300">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          <p className="font-bold text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {data && (
        <div className="space-y-10 animate-in fade-in zoom-in duration-500">
          {/* Status Overview */}
          <div className="bg-bg-main p-8 sm:p-10 rounded-[3rem] border border-border-main shadow-xl glass grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Tracking ID</p>
              <h4 className="text-2xl font-black">{data.awb}</h4>
              <p className="text-xs font-bold text-brand-primary px-3 py-1 bg-brand-primary/10 rounded-full inline-block">{data.courier}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Current Status</p>
              <h4 className="text-2xl font-black text-green-600 dark:text-green-400 uppercase tracking-tight">{data.current_status.replace(/_/g, ' ')}</h4>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Current Location</p>
              <h4 className="text-2xl font-black flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" /> {data.current_location}
              </h4>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-bg-main p-8 sm:p-12 rounded-[3rem] border border-border-main shadow-sm glass">
            <h3 className="text-2xl font-black mb-12">Shipment Journey</h3>
            <div className="relative space-y-12">
              {/* Timeline Line */}
              <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-border-main"></div>

              {data.events.length > 0 ? data.events.map((event, i) => (
                <div key={i} className="relative flex gap-12 group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110 ${
                    i === 0 ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-bg-soft border border-border-main text-text-muted'
                  }`}>
                    {i === 0 ? <CheckCircle2 className="w-6 h-6" /> : <Box className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1 pb-2">
                    <div className="flex items-center gap-3">
                      <h4 className={`text-lg font-black ${i === 0 ? 'text-text-main' : 'text-text-muted'}`}>
                        {event.status.replace(/_/g, ' ')}
                      </h4>
                      <span className="text-[10px] font-black text-text-muted bg-bg-soft px-2 py-1 rounded-lg flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(event.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-text-muted leading-relaxed">
                      {event.description}
                    </p>
                    <p className="text-xs font-bold text-brand-primary flex items-center gap-1.5 pt-2 uppercase tracking-widest">
                      <MapPin className="w-3.5 h-3.5" /> {event.location}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10">
                  <p className="text-text-muted font-medium">Shipment initiated. Please check back later for movement updates.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
