import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Package, Search, ExternalLink, Calendar, MapPin, CheckCircle2, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageWrapper } from '../../components/layout/PageWrapper'

interface Shipment {
  _id: string
  tracking_id: string
  status: string
  service_type: string
  pickup_address: { city: string }
  delivery_address: { city: string }
  package_details: { weight_grams: number }
  createdAt: string
  courier_partner_id?: { name: string }
}

export function ShipmentHistory() {
  const { user } = useAuth()

  const { data, isLoading, error } = useQuery({
    queryKey: ['shipments', user?.id],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3001/users/shipments', {
        withCredentials: true
      })
      return response.data.data.shipments as Shipment[]
    },
    enabled: !!user,
  })

  return (
    <PageWrapper className="max-w-5xl mx-auto py-12 px-4 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-black uppercase tracking-widest mb-4">
            <Package className="w-4 h-4" /> My Shipments
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-text-main">
            Shipment History
          </h2>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by Tracking ID..." 
            className="w-full md:w-80 h-14 pl-12 pr-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold text-sm transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4"></div>
          <p className="text-text-muted font-bold animate-pulse">Loading shipments...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center bg-red-500/5 rounded-3xl border border-red-500/10">
          <p className="text-red-500 font-bold mb-4">Failed to load shipments. Please try again.</p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="py-24 text-center bg-bg-soft rounded-3xl border border-border-main glass">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-brand-primary" />
          </div>
          <h3 className="text-2xl font-black mb-2">No Shipments Yet</h3>
          <p className="text-text-muted mb-8 max-w-md mx-auto">You haven't booked any shipments through ShipEasy yet. Let's get your first package moving!</p>
          <Link to="/" className="inline-block bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/20">
            Book a Shipment
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((shipment) => (
            <div key={shipment._id} className="bg-bg-main border border-border-main rounded-3xl p-6 hover:shadow-xl hover:shadow-brand-primary/5 hover:border-brand-primary/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 group glass relative overflow-hidden">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-bg-soft rounded-2xl flex items-center justify-center border border-border-main shadow-inner">
                  <Package className="w-8 h-8 text-brand-primary" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-black text-xl tracking-tight uppercase">{shipment.tracking_id}</h4>
                    <span className={`text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      shipment.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {shipment.status === 'DELIVERED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {shipment.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-text-muted">
                    <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(shipment.createdAt).toLocaleDateString()}</div>
                    <div className="w-1 h-1 bg-border-main rounded-full"></div>
                    <div className="flex items-center gap-1.5 text-text-main"><MapPin className="w-4 h-4 text-brand-primary" /> {shipment.pickup_address?.city} → {shipment.delivery_address?.city}</div>
                    <div className="w-1 h-1 bg-border-main rounded-full"></div>
                    <div>{shipment.package_details?.weight_grams / 1000}kg via {shipment.courier_partner_id?.name || 'Standard'}</div>
                  </div>
                </div>
              </div>

              <div className="border-t lg:border-t-0 lg:border-l border-border-main pt-6 lg:pt-0 lg:pl-6">
                <Link to={`/tracking?id=${shipment.tracking_id}`} className="w-full lg:w-auto px-6 py-4 bg-bg-soft border border-border-main rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all flex items-center justify-center gap-2">
                  Track Package <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
