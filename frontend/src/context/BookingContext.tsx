import React, { createContext, useContext, useState } from 'react'

interface Address {
  name: string
  phone: string
  address: string
  landmark?: string
  pincode: string
  city: string
  state: string
  country?: string
}

interface SelectedCourier {
  courier_id: string
  name: string
  price_paise: number
  etd: string
}

interface BookingContextType {
  serviceType: 'domestic' | 'international'
  setServiceType: (type: 'domestic' | 'international') => void
  selectedCourier: SelectedCourier | null
  pickupAddress: Address | null
  deliveryAddress: Address | null
  packageDetails: {
    weight_grams: string
    length: string
    width: string
    height: string
  } | null
  setCourier: (courier: SelectedCourier) => void
  setPickup: (address: Address) => void
  setDelivery: (address: Address) => void
  setPackage: (details: any) => void
  clearBooking: () => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [serviceType, setServiceType] = useState<'domestic' | 'international'>('domestic')
  const [selectedCourier, setSelectedCourier] = useState<SelectedCourier | null>(null)
  const [pickupAddress, setPickupAddress] = useState<Address | null>(null)
  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(null)
  const [packageDetails, setPackageDetails] = useState(null)

  const clearBooking = () => {
    setSelectedCourier(null)
    setPickupAddress(null)
    setDeliveryAddress(null)
    setPackageDetails(null)
  }

  return (
    <BookingContext.Provider value={{ 
      serviceType,
      setServiceType,
      selectedCourier, 
      pickupAddress, 
      deliveryAddress, 
      packageDetails,
      setCourier: setSelectedCourier,
      setPickup: setPickupAddress,
      setDelivery: setDeliveryAddress,
      setPackage: setPackageDetails,
      clearBooking
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}
