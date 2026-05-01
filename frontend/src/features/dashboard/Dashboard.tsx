import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Package, User, LogOut, Search, Bell, Menu, X, ArrowUpRight, TrendingUp, Clock, MapPin, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import { API_BASE_URL } from '../../config/api'

export function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'shipments' | 'profile'>('overview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [shipments, setShipments] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shipmentsRes, statsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/shipments/users`),
          axios.get(`${API_BASE_URL}/admin/stats`)
        ])
        setShipments(shipmentsRes.data.data.shipments)
        setStats(statsRes.data.data.stats)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const renderContent = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
        <p className="text-sm font-bold text-text-muted">Syncing with MongoDB...</p>
      </div>
    )

    switch (activeTab) {
      case 'shipments':
        return <ShipmentsView shipments={shipments} />
      case 'profile':
        return <ProfileView />
      default:
        return <OverviewView user={user} shipments={shipments} stats={stats} />
    }
  }

  return (
    <div className="flex min-h-[80vh] bg-bg-soft rounded-[3rem] border border-border-main overflow-hidden glass shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} border-r border-border-main p-6 flex flex-col transition-all duration-300 bg-bg-main/50`}>
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && <span className="font-black tracking-tighter text-xl">Parcel</span>}
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'shipments', icon: Package, label: 'Shipments' },
            { id: 'profile', icon: User, label: 'Profile' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'text-text-muted hover:bg-bg-soft hover:text-text-main'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <button 
          onClick={() => {
            logout()
            navigate('/')
          }}
          className="flex items-center gap-4 p-3 rounded-xl text-text-muted hover:bg-red-50 hover:text-red-500 transition-all mt-auto"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isSidebarOpen && <span className="font-bold text-sm">Sign Out</span>}
        </button>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border-main flex items-center justify-between px-8 bg-bg-main/30">
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search tracking ID..." 
              className="w-full h-10 pl-11 pr-4 bg-bg-soft border border-border-main rounded-xl text-sm focus:border-brand-primary outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-3 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black">{user?.name || 'User'}</p>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{user?.role || 'Basic'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-black text-brand-primary">
                {user?.name?.[0] || 'U'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

function OverviewView({ user, shipments, stats }: { user: any, shipments: any[], stats: any }) {
  const navigate = useNavigate()
  const recentShipments = shipments.slice(0, 3)

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
      <div>
        <h2 className="text-3xl font-black mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Human'}! 👋</h2>
        <p className="text-text-muted font-medium">Here's your live shipping overview from MongoDB.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Shipments', value: shipments.filter(s => s.status !== 'DELIVERED').length, icon: Package, color: 'blue', trend: 'Live Data' },
          { label: 'Total Spending', value: stats?.total_revenue || '₹0.00', icon: TrendingUp, color: 'green', trend: 'Total Platform' },
          { label: 'Saved Addresses', value: user?.saved_addresses?.length || '0', icon: MapPin, color: 'orange', trend: 'Your Profile' }
        ].map((stat, i) => (
          <div key={i} className="bg-bg-main p-6 rounded-3xl border border-border-main shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg bg-bg-soft text-text-muted`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h4 className="text-3xl font-black">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-bg-main p-8 rounded-3xl border border-border-main shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xl">Recent Shipments</h3>
          </div>
          <div className="space-y-6">
            {recentShipments.length > 0 ? recentShipments.map((shipment, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-bg-soft border border-border-main flex items-center justify-center font-black text-brand-primary text-[10px]">
                    {shipment.awb?.substring(0, 6) || 'PENDING'}
                  </div>
                  <div>
                    <p className="font-black text-sm">{shipment.pickup_address.city} → {shipment.delivery_address.city}</p>
                    <p className="text-xs text-text-muted font-medium">{shipment.status} • {shipment.courier_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm">₹{(shipment.price_paise / 100).toFixed(2)}</p>
                  <p className="text-[10px] text-text-muted font-bold">{new Date(shipment.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-text-muted font-bold">No shipments yet.</div>
            )}
          </div>
        </div>

        <div className="bg-bg-main p-8 rounded-3xl border border-border-main shadow-sm flex flex-col justify-center text-center space-y-6">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-brand-primary" />
          </div>
          <div>
            <h3 className="font-black text-xl mb-2">Ready to ship more?</h3>
            <p className="text-text-muted text-sm font-medium">Manage all your orders from one clean, MongoDB-powered dashboard.</p>
          </div>
          <button 
            onClick={() => navigate('/calculator')}
            className="h-14 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/20"
          >
            Start New Booking
          </button>

        </div>
      </div>
    </div>
  )
}

function ShipmentsView({ shipments }: { shipments: any[] }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-left">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black mb-1">My Shipments</h2>
          <p className="text-text-muted font-medium">Tracking and history powered by MongoDB.</p>
        </div>
      </div>

      <div className="bg-bg-main rounded-[2rem] border border-border-main overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-soft border-b border-border-main">
              <th className="px-8 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Tracking ID</th>
              <th className="px-8 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Route</th>
              <th className="px-8 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Price</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s, i) => (
              <tr key={s._id} className="border-b border-border-main/50 hover:bg-bg-soft/50 transition-colors cursor-pointer group">
                <td className="px-8 py-6">
                  <span className="font-black text-sm group-hover:text-brand-primary transition-colors">#{s.awb || 'DRAFT'}</span>
                  <p className="text-[10px] text-text-muted mt-1">{new Date(s.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{s.pickup_address.city}</span>
                    <ArrowRight className="w-3 h-3 text-text-muted" />
                    <span className="font-bold text-sm">{s.delivery_address.city}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="font-black">₹{(s.price_paise / 100).toFixed(2)}</span>
                </td>
              </tr>
            ))}
            {shipments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center font-bold text-text-muted">No shipments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProfileView() {
  const { user } = useAuth()
  
  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500 text-left">
      <h2 className="text-3xl font-black mb-10">Profile Settings</h2>
      
      <div className="space-y-8">
        <div className="flex items-center gap-8 pb-10 border-b border-border-main">
          <div className="w-24 h-24 rounded-3xl bg-brand-primary/10 border-2 border-dashed border-brand-primary/30 flex items-center justify-center font-black text-3xl text-brand-primary uppercase">
            {user?.name?.[0]}
          </div>
          <div className="space-y-2">
            <button className="px-6 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-secondary transition-all">
              Change Photo
            </button>
            <p className="text-xs text-text-muted font-medium">Powered by MongoDB Profile Sync.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Name</label>
            <input type="text" defaultValue={user?.name} className="w-full h-14 px-6 bg-bg-soft border border-border-main rounded-2xl focus:border-brand-primary outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Email Address</label>
            <input type="email" defaultValue={user?.email} disabled className="w-full h-14 px-6 bg-bg-soft/50 border border-border-main rounded-2xl outline-none font-bold text-text-muted" />
          </div>
        </div>

        <div className="pt-6">
          <button className="h-14 px-10 bg-text-main text-bg-main rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-text-main/10">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
