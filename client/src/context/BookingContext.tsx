import React, { createContext, useContext, useState, useEffect } from 'react';

interface AddressDetails {
  pincode: string;
  address: string;
  name: string;
  phone: string;
}

interface PackageDetails {
  weight: string;
  length: string;
  width: string;
  height: string;
}

interface BookingState {
  selectedCourier: any | null;
  pickup: AddressDetails;
  delivery: AddressDetails;
  packageDetails: PackageDetails;
  lastAwb: string | null;
}

interface BookingContextType extends BookingState {
  setCourier: (courier: any | null) => void;
  updatePickup: (details: Partial<AddressDetails>) => void;
  updateDelivery: (details: Partial<AddressDetails>) => void;
  updatePackage: (details: Partial<PackageDetails>) => void;
  setLastAwb: (awb: string | null) => void;
  resetBooking: () => void;
}

const defaultAddress: AddressDetails = {
  pincode: "",
  address: "",
  name: "",
  phone: "",
};

const defaultPackage: PackageDetails = {
  weight: "1.5",
  length: "",
  width: "",
  height: "",
};

const BookingContext = createContext<BookingContextType>({} as BookingContextType);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>(() => {
    const saved = localStorage.getItem('booking_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse booking state", e);
      }
    }
    return {
      selectedCourier: null,
      pickup: { ...defaultAddress },
      delivery: { ...defaultAddress },
      packageDetails: defaultPackage,
      lastAwb: null,
    };
  });

  useEffect(() => {
    localStorage.setItem('booking_state', JSON.stringify(state));
  }, [state]);

  const setCourier = (selectedCourier: any | null) => {
    setState(prev => ({ ...prev, selectedCourier }));
  };

  const updatePickup = (details: Partial<AddressDetails>) => {
    setState(prev => ({ ...prev, pickup: { ...prev.pickup, ...details } }));
  };

  const updateDelivery = (details: Partial<AddressDetails>) => {
    setState(prev => ({ ...prev, delivery: { ...prev.delivery, ...details } }));
  };

  const updatePackage = (details: Partial<PackageDetails>) => {
    setState(prev => ({ ...prev, packageDetails: { ...prev.packageDetails, ...details } }));
  };

  const setLastAwb = (lastAwb: string | null) => {
    setState(prev => ({ ...prev, lastAwb }));
  };

  const resetBooking = () => {
    setState({
      selectedCourier: null,
      pickup: { ...defaultAddress },
      delivery: { ...defaultAddress },
      packageDetails: defaultPackage,
      lastAwb: state.lastAwb, // Keep last AWB even on reset
    });
    localStorage.removeItem('booking_state');
  };

  return (
    <BookingContext.Provider value={{ 
      ...state, 
      setCourier, 
      updatePickup, 
      updateDelivery, 
      updatePackage,
      setLastAwb,
      resetBooking 
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
