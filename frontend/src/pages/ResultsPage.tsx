import { useLocation, useNavigate } from 'react-router-dom'
import { PriceComparison } from '../features/calculator/PriceComparison'
import { useAuth } from '../context/AuthContext'

export function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Provide default values in case user navigates here directly
  const state = location.state || {
    pickup_pincode: '400001',
    delivery_pincode: '110001',
    weight_grams: '500',
    length: '10',
    width: '10',
    height: '10'
  }

  const navigateToBooking = () => {
    if (!user) {
      navigate('/login')
    } else {
      navigate('/book/address')
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-12">
      <PriceComparison 
        onBack={() => navigate('/calculator', { state })} 
        onBook={navigateToBooking}
        pickup_pincode={state.pickup_pincode}
        delivery_pincode={state.delivery_pincode}
        weight_grams={state.weight_grams}
        length={state.length}
        width={state.width}
        height={state.height}
      />
    </div>
  )
}
