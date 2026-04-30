import { useState } from 'react'
import { MapPin, Package, ArrowRight, ChevronDown, Sparkles, Search, Shield, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useBooking } from '../context/BookingContext'
import { countries } from '../constants/countries'

export function LandingPage() {
  const navigate = useNavigate()
  const { serviceType, setServiceType } = useBooking()
  const [showDimensions, setShowDimensions] = useState(false)
  
  const [formData, setFormData] = useState({
    pickup_pincode: '',
    delivery_pincode: '',
    pickup_country: 'India',
    delivery_country: '',
    weight_grams: '',
    length: '',
    width: '',
    height: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleShowPrices = () => {
    if (serviceType === 'domestic') {
      if (!formData.pickup_pincode || !formData.delivery_pincode || !formData.weight_grams) {
        alert('Please fill in all details')
        return
      }
    } else {
      if (!formData.pickup_country || !formData.delivery_country || !formData.weight_grams) {
        alert('Please fill in all details')
        return
      }
    }
    navigate('/results', { state: { ...formData, serviceType } })
  }


  return (
    <>
      <div className="max-w-4xl mx-auto mb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <Sparkles className="w-4 h-4" /> {serviceType === 'domestic' ? 'Fastest Domestic Network' : 'Global Premium Shipping'}
        </div>
        <h1 className="text-5xl sm:text-7xl font-black text-text-main mb-8 leading-[1.05] tracking-tight animate-in fade-in zoom-in duration-700">
          {serviceType === 'domestic' ? 'Shipping built for' : 'Connect to the'} <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent animate-gradient">
            {serviceType === 'domestic' ? 'the modern world.' : 'Entire Planet.'}
          </span>
        </h1>
        
        {/* Quick Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-bg-soft p-1.5 rounded-2xl border border-border-main flex gap-2">
            <button 
              onClick={() => setServiceType('domestic')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${serviceType === 'domestic' ? 'bg-brand-primary text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
            >
              Domestic
            </button>
            <button 
              onClick={() => setServiceType('international')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${serviceType === 'international' ? 'bg-brand-accent text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
            >
              International
            </button>
          </div>
        </div>
      </div>

      {/* Calculator Card */}
      <div className="bg-bg-main p-8 sm:p-12 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-border-main text-left animate-in slide-in-from-bottom-12 duration-1000 relative overflow-hidden group glass max-w-5xl mx-auto animate-float">
        <div className={`absolute -top-24 -right-24 w-96 h-96 ${serviceType === 'domestic' ? 'bg-brand-primary/10' : 'bg-brand-accent/10'} rounded-full blur-[100px] group-hover:scale-110 transition-all duration-1000`}></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          {/* Origin */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1">Origin</label>
            <div className="space-y-4 relative overflow-hidden min-h-[80px]">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={serviceType + 'origin'}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="space-y-4"
                >
                  {serviceType === 'international' && (
                    <div className="relative group/input">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <select 
                        name="pickup_country"
                        value={formData.pickup_country}
                        onChange={handleInputChange}
                        className="w-full h-16 pl-14 pr-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-lg appearance-none transition-all cursor-pointer"
                      >
                        <option>India</option>
                        {countries.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="relative group/input">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within/input:text-brand-primary transition-colors" />
                    <input 
                      type="text" 
                      name="pickup_pincode"
                      value={formData.pickup_pincode}
                      onChange={handleInputChange}
                      placeholder={serviceType === 'domestic' ? "Pickup Pincode" : "Origin Zip/Postal"} 
                      className="w-full h-16 pl-14 pr-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-lg transition-all"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1">Destination</label>
            <div className="space-y-4 relative overflow-hidden min-h-[80px]">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={serviceType + 'destination'}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="space-y-4"
                >
                  {serviceType === 'international' && (
                    <div className="relative group/input">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-accent" />
                      <select 
                        name="delivery_country"
                        value={formData.delivery_country}
                        onChange={handleInputChange}
                        className="w-full h-16 pl-14 pr-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-accent outline-none font-bold text-lg appearance-none transition-all cursor-pointer"
                      >
                        <option value="">Select Destination Country</option>
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="relative group/input">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary" />
                    <input 
                      type="text" 
                      name="delivery_pincode"
                      value={formData.delivery_pincode}
                      onChange={handleInputChange}
                      placeholder={serviceType === 'domestic' ? "Delivery Pincode" : "Destination Zip/Postal"} 
                      className="w-full h-16 pl-14 pr-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-lg transition-all"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-4 relative z-10">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1">Weight & Dimensions</label>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 relative group/input">
              <div className="absolute inset-0 bg-brand-accent/5 rounded-2xl scale-95 opacity-0 group-focus-within/input:scale-100 group-focus-within/input:opacity-100 transition-all duration-500"></div>
              <Package className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within/input:text-brand-accent transition-colors" />
              <input 
                type="number" 
                name="weight_grams"
                value={formData.weight_grams}
                onChange={handleInputChange}
                placeholder="Weight in Grams" 
                className="w-full h-16 pl-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-lg transition-all relative z-10"
              />
            </div>
            <button 
              onClick={handleShowPrices}
              className={`px-12 h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all hover:translate-y-[-4px] active:translate-y-0 shadow-2xl relative z-10 group ${serviceType === 'domestic' ? 'bg-brand-primary text-white shadow-brand-primary/30 hover:bg-brand-secondary' : 'bg-brand-accent text-white shadow-brand-accent/30 hover:bg-purple-700'}`}
            >
              Calculate Prices <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Advanced Dimensions Toggle */}
        <div className="mt-10 border-t border-border-main/50 pt-8 relative z-10">
          <button 
            onClick={() => setShowDimensions(!showDimensions)}
            className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${serviceType === 'domestic' ? 'text-brand-primary hover:text-brand-secondary' : 'text-brand-accent hover:text-purple-700'}`}
          >
            <div className={`p-1.5 rounded-lg transition-transform duration-300 ${showDimensions ? 'rotate-180' : ''} ${serviceType === 'domestic' ? 'bg-brand-primary/10' : 'bg-brand-accent/10'}`}>
              <ChevronDown className="w-3 h-3" />
            </div>
            {showDimensions ? 'Hide' : 'Add'} Box Dimensions
          </button>

          {showDimensions && (
            <div className="grid grid-cols-3 gap-6 mt-8 animate-in slide-in-from-top-6 duration-500">
              {['length', 'width', 'height'].map((dim) => (
                <div key={dim} className="space-y-2">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest pl-1">{dim} (cm)</label>
                  <input 
                    type="number" 
                    name={dim} 
                    value={formData[dim as keyof typeof formData]} 
                    onChange={handleInputChange} 
                    className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold transition-all" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-16 mt-40 text-left animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 px-4 max-w-6xl mx-auto mb-20">
        {[
          { icon: Search, color: 'blue', title: 'Compare Instantly', desc: 'Scan 20+ partners like Delhivery & BlueDart to find the best rate.' },
          { icon: Shield, color: 'green', title: 'Secure Shipping', desc: 'Every package is insured and tracked with our premium protection.' },
          { icon: Globe, color: 'orange', title: 'Go Global', desc: 'Ship to 220+ countries with simplified international customs.' }
        ].map((feature, i) => (
          <div key={i} className="group cursor-default">
            <div className={`w-16 h-16 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
              <feature.icon className={`w-8 h-8 text-${feature.color}-600 dark:text-${feature.color}-400`} />
            </div>
            <h3 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h3>
            <p className="text-text-muted leading-relaxed font-medium text-lg">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
