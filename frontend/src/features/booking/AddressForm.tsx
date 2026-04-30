import React, { useState } from 'react'
import { MapPin, Phone, User, ArrowRight, ArrowLeft, Building, Navigation } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { countries } from '../../constants/countries'

export function AddressForm({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { setPickup, setDelivery, pickupAddress, deliveryAddress, serviceType } = useBooking()
  
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

  const handleNext = () => {
    if (!pickup.name || !pickup.phone || !pickup.address || !delivery.name || !delivery.phone || !delivery.address) {
      alert('Please fill in all required fields')
      return
    }
    if (serviceType === 'international' && (!pickup.country || !delivery.country)) {
      alert('Please select both origin and destination countries')
      return
    }
    setPickup(pickup)
    setDelivery(delivery)
    onNext()
  }


  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 text-left">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-text-muted hover:text-brand-primary font-bold uppercase text-[10px] tracking-widest transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to rates
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">1</div>
            <span className="text-xs font-bold">Addresses</span>
          </div>
          <div className="w-12 h-[1px] bg-border-main"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-bg-soft border border-border-main text-text-muted flex items-center justify-center font-bold text-xs">2</div>
            <span className="text-xs font-bold text-text-muted">Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Pickup Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Pickup Details</h2>
              <p className="text-sm text-text-muted font-medium">Where should the courier collect the package?</p>
            </div>
          </div>

          <div className="bg-bg-main p-8 rounded-[2.5rem] border border-border-main shadow-2xl shadow-brand-primary/5 space-y-6 glass">
            {serviceType === 'international' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Country</label>
                <select 
                  value={pickup.country} 
                  onChange={(e) => setPickupState({...pickup, country: e.target.value})}
                  className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold"
                >
                  {countries.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text" 
                  value={pickup.name} 
                  onChange={(e) => setPickupState({...pickup, name: e.target.value})}
                  className="w-full h-14 pl-12 pr-4 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text" 
                  value={pickup.phone} 
                  onChange={(e) => setPickupState({...pickup, phone: e.target.value})}
                  className="w-full h-14 pl-12 pr-4 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold"
                  placeholder="e.g. +91 9876543210"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Address</label>
              <div className="relative">
                <Building className="absolute left-4 top-4 w-4 h-4 text-text-muted" />
                <textarea 
                  value={pickup.address} 
                  onChange={(e) => setPickupState({...pickup, address: e.target.value})}
                  className="w-full h-32 pl-12 pr-4 py-4 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold resize-none"
                  placeholder="Apartment, Street, Area..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">City</label>
                <input type="text" value={pickup.city} onChange={(e) => setPickupState({...pickup, city: e.target.value})} className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">{serviceType === 'domestic' ? 'State' : 'State/Province'}</label>
                <input type="text" value={pickup.state} onChange={(e) => setPickupState({...pickup, state: e.target.value})} className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold" />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
              <Navigation className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Delivery Details</h2>
              <p className="text-sm text-text-muted font-medium">Where is the package going?</p>
            </div>
          </div>

          <div className="bg-bg-main p-8 rounded-[2.5rem] border border-border-main shadow-2xl shadow-brand-primary/5 space-y-6 glass">
            {serviceType === 'international' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Country</label>
                <select 
                  value={delivery.country} 
                  onChange={(e) => setDeliveryState({...delivery, country: e.target.value})}
                  className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-accent outline-none font-bold"
                >
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text" 
                  value={delivery.name} 
                  onChange={(e) => setDeliveryState({...delivery, name: e.target.value})}
                  className="w-full h-14 pl-12 pr-4 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold"
                  placeholder="e.g. Jane Smith"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text" 
                  value={delivery.phone} 
                  onChange={(e) => setDeliveryState({...delivery, phone: e.target.value})}
                  className="w-full h-14 pl-12 pr-4 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold"
                  placeholder="e.g. +91 9876543210"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Address</label>
              <div className="relative">
                <Building className="absolute left-4 top-4 w-4 h-4 text-text-muted" />
                <textarea 
                  value={delivery.address} 
                  onChange={(e) => setDeliveryState({...delivery, address: e.target.value})}
                  className="w-full h-32 pl-12 pr-4 py-4 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold resize-none"
                  placeholder="Apartment, Street, Area..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">City</label>
                <input type="text" value={delivery.city} onChange={(e) => setDeliveryState({...delivery, city: e.target.value})} className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">{serviceType === 'domestic' ? 'State' : 'State/Province'}</label>
                <input type="text" value={delivery.state} onChange={(e) => setDeliveryState({...delivery, state: e.target.value})} className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={handleNext}
          className="bg-brand-primary text-white px-16 h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-brand-secondary transition-all hover:translate-y-[-4px] active:translate-y-0 shadow-2xl shadow-brand-primary/30"
        >
          Review Order <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
