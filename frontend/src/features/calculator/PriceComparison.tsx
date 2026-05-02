import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { API_BASE_URL } from '../../config/api'
import { Check, ExternalLink, Shield, Loader2, AlertCircle } from 'lucide-react'
import { useBooking } from '../../context/BookingContext'

interface Courier {
  courier_id: string
  courier_name: string
  price_paise: number
  official_eta_days: number
  cod_available: boolean
  rating: number
  is_sponsored: boolean
  tags: string[]
}

interface RatesResponse {
  success: boolean
  data: {
    couriers: Courier[]
    pickup_pincode: string
    delivery_pincode: string
  }
}

export function PriceComparison({ 
  onBack, 
  onBook,
  pickup_pincode, 
  delivery_pincode, 
  weight_grams,
  length,
  width,
  height
}: { 
  onBack: () => void,
  onBook: () => void,
  pickup_pincode: string,
  delivery_pincode: string,
  weight_grams: string,
  length: string,
  width: string,
  height: string
}) {
  const { setCourier, setPackage } = useBooking()

  const { data, isLoading, error } = useQuery<RatesResponse>({
    queryKey: ['rates', pickup_pincode, delivery_pincode, weight_grams, length, width, height],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/couriers/rates`, {
        params: {
          pickup_pincode,
          delivery_pincode,
          weight_grams,
          length,
          width,
          height
        }
      })
      return response.data
    }
  })

  const handleBook = (courier: Courier) => {
    setCourier({
      courier_id: courier.courier_id,
      name: courier.courier_name,
      price_paise: courier.price_paise,
      etd: courier.official_eta_days ? Math.ceil(courier.official_eta_days).toString() : 'N/A'
    })
    setPackage({
      weight_grams,
      length,
      width,
      height
    })
    onBook()
  }

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 tracking-tight">Scanning for best prices...</h2>
          <p className="text-text-muted">Checking with Delhivery, BlueDart, and 10+ partners.</p>
        </div>
      </div>
    )
  }

  if (error || !data?.success) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-text-muted mb-8">We couldn't fetch the rates right now. This usually happens if the pincodes are invalid or our partners are unreachable.</p>
          <button onClick={onBack} className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-all">
            Try again with different details
          </button>
        </div>
      </div>
    )
  }

  const couriers = data?.data?.couriers || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
        <div className="text-left">
          <h2 className="text-2xl md:text-3xl font-black mb-1 tracking-tight">Results for your route</h2>
          <p className="text-text-muted font-medium uppercase text-xs tracking-widest">
            {pickup_pincode} → {delivery_pincode} • {Number(weight_grams)/1000}kg • {length}x{width}x{height}cm
          </p>
        </div>
        <button 
          onClick={onBack}
          className="text-sm font-bold text-brand-primary hover:bg-brand-primary/10 px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          Change details
        </button>
      </div>

      <div className="grid gap-6">
        {couriers.length > 0 ? couriers.map((courier, index) => (
          <div key={courier.courier_id || index} className="bg-bg-main border border-border-main rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 hover:border-brand-primary/30 transition-all flex flex-col gap-5 group relative overflow-hidden">
            {/* Background highlight for best option */}
            {index === 0 && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            )}

            <div className="flex items-center gap-6 flex-1 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-bg-soft rounded-2xl flex items-center justify-center font-black text-2xl text-brand-primary border border-border-main group-hover:scale-105 transition-transform shadow-inner">
                {courier.courier_name ? courier.courier_name[0] : '?'}
              </div>
              <div className="text-left">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-black text-lg sm:text-2xl">{courier.courier_name || 'Unknown'}</h3>
                  {courier.tags?.map(tag => (
                    <span key={tag} className={`text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full ${
                      tag === 'Cheapest' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      tag === 'Express' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-text-muted">
                   <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                     <Check className="w-4 h-4" /> 
                     <span>Delivers in {courier.official_eta_days ? Math.ceil(courier.official_eta_days) : 'N/A'} days</span>
                   </div>
                   <div className="w-1 h-1 bg-border-main rounded-full"></div>
                   <div className="flex items-center gap-1">
                     <span className="text-orange-500">★</span>
                     <span>{courier.rating || 4.2}</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border-main pt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-text-muted">₹</span>
                <span className="text-3xl sm:text-4xl font-black text-text-main">{(Number(courier.price_paise || 0) / 100).toFixed(2)}</span>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest ml-1">incl. taxes</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    const name = courier.courier_name.toLowerCase()
                    let url = 'https://www.google.com/search?q=' + encodeURIComponent(courier.courier_name)
                    if (name.includes('delhivery')) url = 'https://www.delhivery.com'
                    else if (name.includes('blue dart') || name.includes('bluedart')) url = 'https://www.bluedart.com'
                    else if (name.includes('xpressbees')) url = 'https://www.xpressbees.com'
                    else if (name.includes('ecom express')) url = 'https://ecomexpress.in'
                    else if (name.includes('dtdc')) url = 'https://www.dtdc.in'
                    else if (name.includes('shadowfax')) url = 'https://www.shadowfax.in'
                    else if (name.includes('ekart')) url = 'https://www.ekartlogistics.com'
                    else if (name.includes('amazon')) url = 'https://track.amazon.in'
                    window.open(url, '_blank')
                  }}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-bg-soft border border-border-main rounded-xl font-black text-xs uppercase tracking-widest hover:bg-bg-main hover:border-brand-primary transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  Visit <ExternalLink className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleBook(courier)}
                  className="flex-1 sm:flex-none px-5 sm:px-8 py-3 bg-brand-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 active:scale-95 whitespace-nowrap"
                >
                  Book with us
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-bg-soft rounded-3xl border border-dashed border-border-main">
            <p className="text-text-muted font-bold">No couriers available for this route.</p>
          </div>
        )}
      </div>

      <div className="bg-brand-primary/5 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-brand-primary/10 flex items-start sm:items-center gap-4 sm:gap-6 text-left">
        <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center shrink-0">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xl font-black">The Parcel Promise</h4>
          <p className="text-text-muted font-medium leading-relaxed">
            When you book through our platform, we handle the pickup scheduling, label generation, and provide direct customer support.
          </p>
        </div>
      </div>
    </div>
  )
}
