import React, { useState, useEffect } from 'react'
import { MapPin, Phone, User as UserIcon, ArrowRight, ArrowLeft, Building, Navigation, Hash, Bookmark, Plus, X, Check } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { useAuth } from '../../context/AuthContext'
import { countries } from '../../constants/countries'
import { toast } from 'sonner'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { API_BASE_URL } from '../../config/api'

export function AddressForm({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { setPickup, setDelivery, pickupAddress, deliveryAddress, serviceType } = useBooking()
  const { user } = useAuth()
  
  const [pickup, setPickupState] = useState(pickupAddress || {
    name: '',
    phone: '',
    address: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India'
  })

  const [delivery, setDeliveryState] = useState(deliveryAddress || {
    name: '',
    phone: '',
    address: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    country: ''
  })

  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [showAddressBook, setShowAddressBook] = useState<'pickup' | 'delivery' | null>(null)
  const [savePickup, setSavePickup] = useState(false)
  const [saveDelivery, setSaveDelivery] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user])

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/addresses`)
      if (res.data.success) {
        setSavedAddresses(res.data.data.addresses)
      }
    } catch (err) {

    }
  }

  const handleSelectAddress = (addr: any) => {
    const formatted = {
      name: addr.name,
      phone: addr.phone,
      address: addr.area || addr.address,
      landmark: addr.flat || '',
      pincode: addr.pincode,
      city: addr.city,
      state: addr.state,
      country: addr.country || 'India'
    }

    if (showAddressBook === 'pickup') {
      setPickupState(formatted)
    } else {
      setDeliveryState(formatted)
    }
    setShowAddressBook(null)
    toast.success('Address applied!')
  }

  const handleNext = async () => {
    // Comprehensive validation
    if (!pickup.name || !pickup.phone || !pickup.address || !pickup.pincode || !pickup.city || !pickup.state) {
      toast.error('Please fill in all required pickup fields')
      return
    }
    if (!delivery.name || !delivery.phone || !delivery.address || !delivery.pincode || !delivery.city || !delivery.state) {
      toast.error('Please fill in all required delivery fields')
      return
    }

    // Save addresses if requested
    if (user) {
      if (savePickup) {
        await axios.post(`${API_BASE_URL}/users/addresses`, { ...pickup, label: 'Saved Pickup' })
      }
      if (saveDelivery) {
        await axios.post(`${API_BASE_URL}/users/addresses`, { ...delivery, label: 'Saved Delivery' })
      }
    }

    setPickup(pickup)
    setDelivery(delivery)
    onNext()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 text-left relative">
      
      {/* Address Book Modal Overlay */}
      <AnimatePresence>
        {showAddressBook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressBook(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-bg-main w-full max-w-lg rounded-[2.5rem] border border-border-main shadow-2xl overflow-hidden relative z-10 glass"
            >
              <div className="p-8 border-b border-border-main flex items-center justify-between bg-bg-soft/50">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                     <Bookmark className="w-6 h-6 text-brand-primary" />
                   </div>
                   <div>
                     <h3 className="text-xl font-black">Address Book</h3>
                     <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Select for {showAddressBook}</p>
                   </div>
                </div>
                <button onClick={() => setShowAddressBook(null)} className="w-10 h-10 rounded-full hover:bg-bg-soft flex items-center justify-center transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar">
                {savedAddresses.length > 0 ? savedAddresses.map((addr, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSelectAddress(addr)}
                    className="w-full text-left p-6 rounded-[1.5rem] bg-bg-soft border border-border-main hover:border-brand-primary hover:bg-brand-primary/5 transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">{addr.label || 'Home'}</span>
                       <ArrowRight className="w-4 h-4 text-brand-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                    </div>
                    <h5 className="font-black text-lg mb-1">{addr.name}</h5>
                    <p className="text-sm text-text-muted font-medium line-clamp-2">{addr.area || addr.address}, {addr.city}</p>
                  </button>
                )) : (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-bg-soft rounded-full flex items-center justify-center mx-auto opacity-20">
                       <Bookmark className="w-8 h-8" />
                    </div>
                    <p className="text-text-muted font-bold">No saved addresses yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-text-muted hover:text-brand-primary font-bold uppercase text-[10px] tracking-widest transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to rates
        </button>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-brand-primary/20">1</div>
            <span className="text-xs font-black uppercase tracking-widest hidden sm:block">Addresses</span>
          </div>
          <div className="w-8 sm:w-12 h-[1px] bg-border-main"></div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-bg-soft border border-border-main text-text-muted flex items-center justify-center font-bold text-xs">2</div>
            <span className="text-xs font-black uppercase tracking-widest text-text-muted hidden sm:block">Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
        {/* Pickup Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-brand-primary/10 rounded-xl md:rounded-[1.25rem] flex items-center justify-center border border-brand-primary/20 shrink-0">
                <MapPin className="w-5 h-5 md:w-7 md:h-7 text-brand-primary" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-black tracking-tight">Pickup Details</h2>
                <p className="text-sm text-text-muted font-medium">Where should we collect from?</p>
              </div>
            </div>
            {user && (
              <button 
                onClick={() => setShowAddressBook('pickup')}
                className="flex items-center gap-2 px-4 py-2 bg-bg-soft border border-border-main rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-brand-primary transition-all text-text-muted hover:text-brand-primary"
              >
                <Bookmark className="w-3 h-3" /> Saved
              </button>
            )}
          </div>

          <div className="bg-bg-main p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-border-main shadow-2xl shadow-brand-primary/5 space-y-4 md:space-y-6 glass">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="text" 
                    value={pickup.name} 
                    onChange={(e) => setPickupState({...pickup, name: e.target.value})}
                    className="w-full h-11 md:h-14 pl-12 pr-4 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-sm md:text-base transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="tel" 
                    value={pickup.phone} 
                    onChange={(e) => setPickupState({...pickup, phone: e.target.value})}
                    className="w-full h-11 md:h-14 pl-12 pr-4 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-sm md:text-base transition-all"
                    placeholder="+91 98765..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Address</label>
              <div className="relative">
                <Building className="absolute left-4 top-4 w-4 h-4 text-text-muted" />
                <textarea 
                  value={pickup.address} 
                  onChange={(e) => setPickupState({...pickup, address: e.target.value})}
                  className="w-full h-28 pl-12 pr-4 py-4 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold resize-none transition-all"
                  placeholder="Street, Apartment, Area..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Pincode</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="text" 
                    value={pickup.pincode} 
                    onChange={(e) => setPickupState({...pickup, pincode: e.target.value})}
                    className="w-full h-11 md:h-14 pl-12 pr-4 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-sm md:text-base transition-all"
                    placeholder="110001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">City</label>
                <input 
                  type="text" 
                  value={pickup.city} 
                  onChange={(e) => setPickupState({...pickup, city: e.target.value})}
                  className="w-full h-11 md:h-14 px-5 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-sm md:text-base transition-all"
                  placeholder="New Delhi"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">State</label>
              <input 
                type="text" 
                value={pickup.state} 
                onChange={(e) => setPickupState({...pickup, state: e.target.value})}
                className="w-full h-11 md:h-14 px-5 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-sm md:text-base transition-all"
                placeholder="Delhi"
              />
            </div>
            
            {user && (
              <label className="flex items-center gap-3 cursor-pointer group pt-2">
                <div 
                  onClick={() => setSavePickup(!savePickup)}
                  className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${savePickup ? 'bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/20' : 'border-border-main'}`}
                >
                  {savePickup && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-text-muted group-hover:text-text-main transition-colors">Save to address book</span>
              </label>
            )}
          </div>
        </div>

        {/* Delivery Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-orange-500/10 rounded-xl md:rounded-[1.25rem] flex items-center justify-center border border-orange-500/20 shrink-0">
                <Navigation className="w-5 h-5 md:w-7 md:h-7 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-black tracking-tight">Delivery Details</h2>
                <p className="text-sm text-text-muted font-medium">Where is it going?</p>
              </div>
            </div>
            {user && (
              <button 
                onClick={() => setShowAddressBook('delivery')}
                className="flex items-center gap-2 px-4 py-2 bg-bg-soft border border-border-main rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-brand-primary transition-all text-text-muted hover:text-brand-primary"
              >
                <Bookmark className="w-3 h-3" /> Saved
              </button>
            )}
          </div>

          <div className="bg-bg-main p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-border-main shadow-2xl shadow-brand-primary/5 space-y-4 md:space-y-6 glass">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="text" 
                    value={delivery.name} 
                    onChange={(e) => setDeliveryState({...delivery, name: e.target.value})}
                    className="w-full h-11 md:h-14 pl-12 pr-4 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-sm md:text-base transition-all"
                    placeholder="Jane Smith"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="tel" 
                    value={delivery.phone} 
                    onChange={(e) => setDeliveryState({...delivery, phone: e.target.value})}
                    className="w-full h-11 md:h-14 pl-12 pr-4 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-sm md:text-base transition-all"
                    placeholder="+91 98765..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Address</label>
              <div className="relative">
                <Building className="absolute left-4 top-4 w-4 h-4 text-text-muted" />
                <textarea 
                  value={delivery.address} 
                  onChange={(e) => setDeliveryState({...delivery, address: e.target.value})}
                  className="w-full h-28 pl-12 pr-4 py-4 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold resize-none transition-all"
                  placeholder="Street, Apartment, Area..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Pincode</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="text" 
                    value={delivery.pincode} 
                    onChange={(e) => setDeliveryState({...delivery, pincode: e.target.value})}
                    className="w-full h-11 md:h-14 pl-12 pr-4 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-sm md:text-base transition-all"
                    placeholder="400001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">City</label>
                <input 
                  type="text" 
                  value={delivery.city} 
                  onChange={(e) => setDeliveryState({...delivery, city: e.target.value})}
                  className="w-full h-11 md:h-14 px-5 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-sm md:text-base transition-all"
                  placeholder="Mumbai"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">State</label>
              <input 
                type="text" 
                value={delivery.state} 
                onChange={(e) => setDeliveryState({...delivery, state: e.target.value})}
                className="w-full h-11 md:h-14 px-5 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-sm md:text-base transition-all"
                placeholder="Maharashtra"
              />
            </div>
            
            {user && (
              <label className="flex items-center gap-3 cursor-pointer group pt-2">
                <div 
                  onClick={() => setSaveDelivery(!saveDelivery)}
                  className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${saveDelivery ? 'bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/20' : 'border-border-main'}`}
                >
                  {saveDelivery && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-text-muted group-hover:text-text-main transition-colors">Save to address book</span>
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8 pb-8">
        <button 
          onClick={handleNext}
          className="w-full sm:w-auto bg-brand-primary text-white px-10 sm:px-20 h-16 sm:h-20 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-4 hover:bg-brand-secondary transition-all hover:-translate-y-1 active:translate-y-0 shadow-[0_20px_50px_rgba(37,99,235,0.3)] group"
        >
          Proceed to Review <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
