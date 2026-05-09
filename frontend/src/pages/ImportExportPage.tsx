import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  ArrowRight, 
  ArrowLeftRight, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  Zap, 
  TrendingUp,
  Search,
  CheckCircle2,
  ChevronRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function ImportExportPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'export' | 'import'>('export')
  const [searching, setSearching] = useState(false)
  const [showRates, setShowRates] = useState(false)

  const [formData, setFormData] = useState({
    origin_city: mode === 'export' ? 'Current Location' : '',
    destination_city: mode === 'import' ? 'Current Location' : '',
    weight: '',
    category: 'General'
  })

  const handleSearch = () => {
    setSearching(true)
    setTimeout(() => {
      setSearching(false)
      setShowRates(true)
      toast.success('Found 3 available routes!')
    }, 1500)
  }

  const mockRates = [
    { id: 1, name: 'Rocket Express', price: '450', etd: '1-2 Days', type: 'Priority', tag: 'Fastest' },
    { id: 2, name: 'India Connect', price: '280', etd: '3-4 Days', type: 'Standard', tag: 'Best Value' },
    { id: 3, name: 'Secure Move', price: '620', etd: '2-3 Days', type: 'Insured', tag: 'Most Secure' },
  ]

  return (
    <div className="min-h-screen text-white pt-10 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-widest mb-4">
              <ArrowLeftRight className="w-3 h-3" /> Domestic Logistics
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
              Import & Export <span className="text-brand-primary">India</span>
            </h1>
            <p className="text-white/50 font-medium">Manage commercial and personal movements across 29,000+ pin codes.</p>
          </div>

          <div className="flex bg-[#121212] p-1.5 rounded-2xl border border-white/10 relative">
            <motion.div
              className="absolute inset-y-1.5 bg-brand-primary rounded-xl z-0"
              initial={false}
              animate={{
                x: mode === 'export' ? 0 : '100%',
                width: 'calc(50% - 6px)'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => setMode('export')}
              className={`relative z-10 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors ${mode === 'export' ? 'text-white' : 'text-white/40'}`}
            >
              Export (Send)
            </button>
            <button
              onClick={() => setMode('import')}
              className={`relative z-10 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors ${mode === 'import' ? 'text-white' : 'text-white/40'}`}
            >
              Import (Receive)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-8">
            
            <section className="glass-panel p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <Package className="w-40 h-40" />
              </div>

              <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-brand-primary" />
                  </div>
                  Route Selection
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Origin City / Pincode</label>
                    <div className="relative group/input">
                      <input
                        type="text"
                        value={mode === 'export' ? 'Your Location' : ''}
                        disabled={mode === 'export'}
                        placeholder="Enter City or Pincode"
                        className="w-full h-14 pl-6 pr-6 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-primary outline-none font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Destination City / Pincode</label>
                    <div className="relative group/input">
                      <input
                        type="text"
                        value={mode === 'import' ? 'Your Location' : ''}
                        disabled={mode === 'import'}
                        placeholder="Enter City or Pincode"
                        className="w-full h-14 pl-6 pr-6 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-primary outline-none font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Package Weight (KG)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5.5"
                      className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-primary outline-none font-bold transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Goods Category</label>
                    <select className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-primary outline-none font-bold transition-all appearance-none cursor-pointer">
                      <option className="bg-[#121212]">General Goods</option>
                      <option className="bg-[#121212]">Electronics</option>
                      <option className="bg-[#121212]">Apparel</option>
                      <option className="bg-[#121212]">Fragile Items</option>
                      <option className="bg-[#121212]">Business Documents</option>
                    </select>
                  </div>
              </div>

              <button
                onClick={handleSearch}
                className="w-full mt-10 h-16 rounded-2xl bg-white text-black font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5 group"
              >
                {searching ? (
                  <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Calculate Domestic Rates <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: ShieldCheck, title: 'Insured', desc: 'Up to ₹50k coverage' },
                { icon: Zap, title: 'Express', desc: 'Next-day delivery' },
                { icon: TrendingUp, title: 'Live', desc: 'Real-time tracking' }
              ].map((item, i) => (
                <div key={i} className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-all cursor-default group">
                  <item.icon className="w-6 h-6 text-brand-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                  <p className="text-[10px] text-white/40 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Rates/Info */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {showRates ? (
                <motion.div
                  key="rates"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Available Couriers</h3>
                    <button className="text-[10px] font-bold text-brand-primary hover:underline">Sort by Lowest Price</button>
                  </div>

                  {mockRates.map((rate) => (
                    <div key={rate.id} className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-brand-primary/50 transition-all cursor-pointer group relative overflow-hidden">
                      {rate.tag === 'Fastest' && <div className="absolute top-0 right-0 bg-brand-primary text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter">Fastest</div>}

                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold group-hover:text-brand-primary transition-colors">{rate.name}</h4>
                          <p className="text-xs text-white/40 font-medium">ETA: {rate.etd}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black tracking-tighter">₹{rate.price}</div>
                            <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Incl. GST</div>
                          </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex gap-2">
                            <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/60">{rate.type}</div>
                            <div className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-[9px] font-bold uppercase tracking-widest text-green-500">COD Available</div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}

                  <button className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all">
                    View More Partners
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel p-10 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-brand-primary/5 to-transparent flex flex-col items-center text-center justify-center min-h-[400px]"
                >
                  <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                    <Search className="w-10 h-10 text-white/20" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Search for Rates</h3>
                  <p className="text-white/40 font-medium max-w-[250px] leading-relaxed">
                    Enter your shipment details on the left to see real-time {mode} rates within India.
                  </p>
                  
                  <div className="mt-12 space-y-4 w-full text-left">
                    <div className="flex items-center gap-3 text-xs font-bold text-white/60">
                        <CheckCircle2 className="w-4 h-4 text-brand-primary" /> Simplified Pincode Verification
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-white/60">
                        <CheckCircle2 className="w-4 h-4 text-brand-primary" /> Automated Documentation
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-white/60">
                        <CheckCircle2 className="w-4 h-4 text-brand-primary" /> Priority Business Support
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
