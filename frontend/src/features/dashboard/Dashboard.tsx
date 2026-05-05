import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Package, User, LogOut, Search, Menu, X, TrendingUp, MapPin, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config/api'

const NAV_ITEMS = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { id: 'shipments', icon: Package, label: 'Shipments' },
  { id: 'profile', icon: User, label: 'Profile' },
]

export function Dashboard() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'shipments' | 'profile'>('overview')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [shipments, setShipments] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [shipmentsRes, statsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/users/shipments`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])
        setShipments(shipmentsRes.data.data?.shipments || [])
        setStats(statsRes.data.data?.stats || null)
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [token])

  const renderContent = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
        <p className="text-sm font-bold text-white/50">Loading your dashboard...</p>
      </div>
    )
    switch (activeTab) {
      case 'shipments': return <ShipmentsView shipments={shipments} />
      case 'profile': return <ProfileView />
      default: return <OverviewView user={user} shipments={shipments} stats={stats} />
    }
  }

  return (
    <div className="flex h-[80vh] min-h-[600px] bg-[#050505] rounded-2xl md:rounded-[3rem] border border-white/10 overflow-hidden glass shadow-2xl animate-in fade-in duration-700 relative">

      {/* ── Mobile Sidebar Drawer Overlay ─────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Sidebar (drawer on mobile, fixed on desktop) ──── */}
      <aside className={`
        fixed inset-y-0 left-0 z-[100] w-64 flex flex-col
        border-r border-white/10 bg-[#050505] p-8
        transition-transform duration-300
        ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:bg-transparent
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black tracking-tighter text-xl uppercase italic">Parcel</span>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-white/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setDrawerOpen(false) }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === item.id
                  ? 'bg-white text-black shadow-lg shadow-white/5'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sign Out */}
        <button
          onClick={() => { logout(); navigate('/') }}
          className="flex items-center gap-4 p-4 rounded-2xl text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm">Sign Out</span>
        </button>
      </aside>

      {/* ── Main Area ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="h-16 md:h-20 border-b border-white/10 flex items-center gap-3 px-6 md:px-8 bg-transparent shrink-0">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-white/50"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search (desktop only) */}
          <div className="relative hidden md:flex flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Track your order..."
              className="w-full h-11 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm focus:border-white/30 outline-none transition-all font-medium"
            />
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{user?.role || 'Basic'}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-brand-primary text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {renderContent()}
        </div>

        {/* ── Bottom Tab Bar (mobile only) ───────────────────── */}
        <nav className="lg:hidden border-t border-white/10 bg-[#050505]/80 backdrop-blur-2xl flex items-center shrink-0">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex-1 flex flex-col items-center py-4 gap-1 transition-all ${activeTab === item.id ? 'text-white' : 'text-white/40'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex-1 flex flex-col items-center py-4 gap-1 text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Exit</span>
          </button>
        </nav>
      </main>
    </div>
  )
}

function OverviewView({ user, shipments, stats }: { user: any; shipments: any[]; stats: any }) {
  const navigate = useNavigate()
  const recentShipments = shipments.slice(0, 3)

  return (
    <div className="space-y-10 text-left">
      <div>
        <h2 className="text-3xl md:text-5xl font-display font-black mb-2">Hey {user?.name?.split(' ')[0] || 'there'}, welcome back! 👋</h2>
        <p className="text-white/60 font-medium text-lg">Here's a quick look at what's happening with your deliveries.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Active Orders', value: shipments.filter(s => s.status !== 'DELIVERED').length, icon: Package, trend: 'Real-time' },
          { label: 'Total Value', value: stats?.total_revenue || '₹0.00', icon: TrendingUp, trend: 'Lifetime' },
          { label: 'Saved Contacts', value: user?.saved_addresses?.length || '0', icon: MapPin, trend: 'Profile' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-sm hover:shadow-xl hover:border-white/20 transition-all group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-4 rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform">
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/5 text-white/50 uppercase tracking-widest">{stat.trend}</span>
            </div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <h4 className="text-3xl md:text-4xl font-display font-black">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-black text-2xl">Latest Updates</h3>
            <button onClick={() => navigate('/history')} className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest">See All</button>
          </div>
          <div className="space-y-6">
            {recentShipments.length > 0 ? recentShipments.map((s, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-brand-primary text-sm group-hover:border-brand-primary/30 transition-colors">
                    {s.awb?.substring(0, 4) || 'DRAFT'}
                  </div>
                  <div>
                    <p className="font-bold text-base">{s.pickup_address?.city} → {s.delivery_address?.city}</p>
                    <p className="text-xs text-white/50 font-medium">
                      <span className="text-brand-warm">{s.status}</span> • {s.courier_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-base">₹{(s.price_paise / 100).toFixed(2)}</p>
                  <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">{new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-white/40 font-medium text-lg">
                You haven't shipped anything yet. <br /> Ready to start your first journey? 🚀
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 flex flex-col justify-center text-center space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent pointer-events-none"></div>
          <div className="w-24 h-24 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center mx-auto rotate-3 group-hover:rotate-6 transition-transform">
            <Sparkles className="w-12 h-12 text-brand-primary" />
          </div>
          <div className="relative z-10">
            <h3 className="font-display font-black text-2xl mb-3">Need to ship something?</h3>
            <p className="text-white/50 text-base font-medium max-w-[280px] mx-auto">Our smart calculator finds the best rates across 20+ partners in seconds.</p>
          </div>
          <button
            onClick={() => navigate('/calculator')}
            aria-label="Start a new shipment booking"
            className="relative z-10 h-16 bg-white text-black rounded-2xl font-bold text-base uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
          >
            Start New Booking
          </button>
        </div>
      </div>
    </div>
  )
}

function ShipmentsView({ shipments }: { shipments: any[] }) {
  const navigate = useNavigate()
  return (
    <div className="text-left">
      <div className="mb-10">
        <h2 className="text-3xl md:text-5xl font-display font-black mb-2">My Shipments</h2>
        <p className="text-white/60 font-medium text-lg">Detailed tracking for all your active and past orders.</p>
      </div>

      {/* Mobile card view */}
      <div className="space-y-4 md:hidden">
        {shipments.length > 0 ? shipments.map((s, i) => (
          <div key={s._id || i} className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-brand-primary">#{s.awb || 'DRAFT'}</span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-primary/10 text-brand-primary">{s.status}</span>
            </div>
            <p className="font-bold text-base flex items-center gap-2 mb-2">
              {s.pickup_address?.city} <ArrowRight className="w-4 h-4 text-white/30" /> {s.delivery_address?.city}
            </p>
            <div className="flex items-center justify-between text-xs text-white/40 font-medium">
              <span>{new Date(s.createdAt).toLocaleDateString()}</span>
              <span className="font-black text-white text-base">₹{(s.price_paise / 100).toFixed(2)}</span>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center font-medium text-white/40 text-lg">No orders found yet.</div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-8 py-5 text-[11px] font-bold text-white/40 uppercase tracking-widest">Tracking ID</th>
              <th className="px-8 py-5 text-[11px] font-bold text-white/40 uppercase tracking-widest">Route</th>
              <th className="px-8 py-5 text-[11px] font-bold text-white/40 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[11px] font-bold text-white/40 uppercase tracking-widest">Amount</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s, i) => (
              <tr key={s._id || i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                <td className="px-8 py-6">
                  <span className="font-bold text-base group-hover:text-brand-primary transition-colors">#{s.awb || 'DRAFT'}</span>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">{new Date(s.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3 font-bold text-base">
                    <span>{s.pickup_address?.city}</span>
                    <ArrowRight className="w-4 h-4 text-white/20" />
                    <span>{s.delivery_address?.city}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-brand-primary/10 text-brand-primary">{s.status}</span>
                </td>
                <td className="px-8 py-6">
                  <span className="font-black text-base text-white">₹{(s.price_paise / 100).toFixed(2)}</span>
                </td>
              </tr>
            ))}
            {shipments.length === 0 && (
              <tr><td colSpan={4} className="px-8 py-24 text-center font-medium text-white/40 text-xl">No shipments found. Start shipping!</td></tr>
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
    <div className="max-w-3xl text-left">
      <h2 className="text-3xl md:text-5xl font-display font-black mb-12">Profile Settings</h2>
      <div className="space-y-10">
        <div className="flex items-center gap-8 pb-10 border-b border-white/10">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-brand-primary/10 border-2 border-dashed border-brand-primary/30 flex items-center justify-center font-black text-3xl md:text-4xl text-brand-primary uppercase shrink-0">
            {user?.name?.[0]}
          </div>
          <div className="space-y-3">
            <p className="font-display font-black text-xl md:text-2xl">{user?.name}</p>
            <p className="text-base text-white/50 font-medium">{user?.email}</p>
            <button className="px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all">
              Change Avatar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
            <input type="text" defaultValue={user?.name} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl focus:border-white/30 outline-none font-bold text-lg transition-all" />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
            <input type="email" defaultValue={user?.email} disabled className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold text-lg text-white/30 cursor-not-allowed" />
          </div>
        </div>

        <div className="pt-4">
          <button className="h-16 px-12 bg-white text-black rounded-2xl font-bold text-base uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5">
            Save Profile
          </button>
        </div>
      </div>
    </div>
  )
}
