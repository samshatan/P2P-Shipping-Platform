import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { Shield, ArrowLeft, CheckCircle2, Truck, Calendar, Wallet, Loader2 } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { toast } from 'sonner'
import { API_BASE_URL } from '../../config/api'

export function ReviewOrder({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { selectedCourier, pickupAddress, deliveryAddress, packageDetails, clearBooking } = useBooking()
  const { user, token } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayAndBook = async () => {
    setIsProcessing(true)
    try {
      if (!token) throw new Error('Not authenticated')
      
      // 1. Create Shipment (Draft)
      const createRes = await axios.post(`${API_BASE_URL}/shipments`, {
        courier_id: selectedCourier?.courier_id,
        courier_name: selectedCourier?.name,
        pickup_address: pickupAddress,
        delivery_address: deliveryAddress,
        weight_grams: Number(packageDetails?.weight_grams || 0),
        price_paise: selectedCourier?.price_paise
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!createRes.data.success) throw new Error('Draft creation failed')
      const shipmentId = createRes.data.data.shipment_id

      // 2. Create Razorpay Order
      const orderRes = await axios.post(`${API_BASE_URL}/payments/create-order`, {
        shipment_id: shipmentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!orderRes.data.success) throw new Error('Payment order creation failed')
      const orderData = orderRes.data.data

      // 3. Open Razorpay Modal
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SwiftRoute P2P",
        description: `Shipment #${shipmentId}`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            setIsProcessing(true)
            // 4. Verify Payment
            const verifyRes = await axios.post(`${API_BASE_URL}/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shipment_id: shipmentId
            }, {
              headers: { Authorization: `Bearer ${token}` }
            })

            if (verifyRes.data.success) {
              // 5. Finalize Booking
              const bookRes = await axios.post(`${API_BASE_URL}/shipments/${shipmentId}/book`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              })

              if (bookRes.data.success) {
                toast.success('Payment successful and booking confirmed!')
                onNext()
              } else {
                toast.error('Payment verified but booking failed. Please check history.')
              }
            }
          } catch (err) {
            toast.error('Payment verification failed')
          } finally {
            setIsProcessing(false)
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: pickupAddress.phone
        },
        theme: {
          color: "#3b82f6"
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Booking failed')
      setIsProcessing(false)
    }
  }

  if (!selectedCourier || !pickupAddress || !deliveryAddress || !packageDetails) {
    return <div className="py-20 text-center font-bold">Missing booking details. Please go back.</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-text-muted hover:text-brand-primary font-bold uppercase text-[10px] tracking-widest transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to addresses
        </button>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-text-muted hidden sm:block">Addresses</span>
          </div>
          <div className="w-8 sm:w-12 h-[1px] bg-green-500"></div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">2</div>
            <span className="text-xs font-bold hidden sm:block">Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-8">
          {/* Summary Card */}
          <div className="bg-bg-main p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-border-main shadow-2xl shadow-brand-primary/5 glass">
            <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3">
              <Shield className="w-6 h-6 text-brand-primary" /> Order Summary
            </h3>

            <div className="space-y-8">
              <div className="flex items-start gap-6 pb-8 border-b border-border-main">
                <div className="w-16 h-16 bg-bg-soft rounded-2xl flex items-center justify-center font-black text-2xl text-brand-primary border border-border-main shrink-0">
                  {selectedCourier.name[0]}
                </div>
                <div>
                  <h4 className="text-lg font-black">{selectedCourier.name}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm font-bold text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4" /> <span>Surface Shipping</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> <span>Delivery in {selectedCourier.etd} days</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Pickup From</h5>
                  <div className="space-y-1">
                    <p className="font-bold text-sm">{pickupAddress.name}</p>
                    <p className="text-sm text-text-muted font-medium">{pickupAddress.address}</p>
                    <p className="text-sm text-text-muted font-medium">{pickupAddress.city}, {pickupAddress.state} - {pickupAddress.pincode}</p>
                    <p className="text-xs font-bold text-brand-primary mt-2">{pickupAddress.phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Deliver To</h5>
                  <div className="space-y-1">
                    <p className="font-bold text-sm">{deliveryAddress.name}</p>
                    <p className="text-sm text-text-muted font-medium">{deliveryAddress.address}</p>
                    <p className="text-sm text-text-muted font-medium">{deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}</p>
                    <p className="text-xs font-bold text-brand-primary mt-2">{deliveryAddress.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-primary/5 p-6 rounded-3xl border border-brand-primary/10 flex items-center gap-4">
            <Shield className="w-6 h-6 text-brand-primary" />
            <p className="text-sm font-medium text-text-muted">
              Your shipment is protected by <span className="font-black text-brand-primary">Parcel Guarantee</span>. Full refund if not delivered.
            </p>
          </div>
        </div>

        {/* Payment Panel - shows after summary on mobile, sticky sidebar on desktop */}
        <div className="space-y-8">
          <div className="bg-bg-main p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-border-main shadow-2xl shadow-brand-primary/5 glass md:sticky md:top-24">
            <h3 className="text-lg font-black mb-6">Payment Details</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm font-bold text-text-muted">
                <span>Shipping Fee</span>
                <span>₹{(selectedCourier.price_paise / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-text-muted">
                <span>GST (18%)</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-text-muted">
                <span>Insurance</span>
                <span className="text-green-600 dark:text-green-400">FREE</span>
              </div>
              <div className="h-[1px] bg-border-main my-2"></div>
              <div className="flex justify-between items-baseline">
                <span className="font-black">Total</span>
                <span className="text-2xl sm:text-3xl font-black text-brand-primary">₹{(selectedCourier.price_paise / 100).toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handlePayAndBook}
              disabled={isProcessing}
              className="w-full h-16 bg-brand-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/30 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Wallet className="w-6 h-6" /> Pay & Book Now
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-text-muted font-bold mt-4 uppercase tracking-widest">
              Secure 256-bit SSL encrypted payment
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
