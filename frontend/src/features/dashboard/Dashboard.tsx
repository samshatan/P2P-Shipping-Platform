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
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'shipments' | 'profile'>('overview')
  const [drawerOpen, setDrawerOpen] = useState(false)
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
        setShipments(shipmentsRes.data.data?.shipments || [])
        setStats(statsRes.data.data?.stats || null)
      } catch (error) {

      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const renderContent = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
        <p className="text-sm font-bold text-text-muted">Loading your dashboard...</p>
      </div>
    )
    switch (activeTab) {
      case 'shipments': return <ShipmentsView shipments={shipments} />
      case 'profile': return <ProfileView />
      default: return <OverviewView user={user} shipments={shipments} stats={stats} />
    }
  }

  return (
    <div className="flex h-[80vh] min-h-[600px] bg-bg-soft rounded-2xl md:rounded-[3rem] border border-border-main overflow-hidden glass shadow-2xl animate-in fade-in duration-700 relative">

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
        border-r border-border-main bg-bg-main p-6
        transition-transform duration-300
        ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:bg-bg-main/50
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-black tracking-tighter text-xl">Parcel</span>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-bg-soft text-text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setDrawerOpen(false) }}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                  : 'text-text-muted hover:bg-bg-soft hover:text-text-main'
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
          className="flex items-center gap-4 p-3 rounded-xl text-text-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm">Sign Out</span>
        </button>
      </aside>

      {/* ── Main Area ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="h-14 md:h-16 border-b border-border-main flex items-center gap-3 px-4 md:px-6 bg-bg-main/30 shrink-0">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-bg-soft text-text-muted"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search (desktop only) */}
          <div className="relative hidden md:flex flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search tracking ID..."
              className="w-full h-9 pl-10 pr-4 bg-bg-soft border border-border-main rounded-xl text-sm focus:border-brand-primary outline-none transition-all"
            />
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{user?.role || 'Basic'}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-black text-brand-primary text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </div>

        {/* ── Bottom Tab Bar (mobile only) ───────────────────── */}
        <nav className="lg:hidden border-t border-border-main bg-bg-main/80 backdrop-blur-xl flex items-center shrink-0">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all ${
                activeTab === item.id ? 'text-brand-primary' : 'text-text-muted'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex-1 flex flex-col items-center py-3 gap-1 text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Sign Out</span>
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
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-black mb-1">Welcome back, {user?.name?.split(' ')[0] || 'Human'}! 👋</h2>
        <p className="text-text-muted font-medium text-sm">Here's your live shipping overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Shipments', value: shipments.filter(s => s.status !== 'DELIVERED').length, icon: Package, trend: 'Live Data' },
          { label: 'Total Spending', value: stats?.total_revenue || '₹0.00', icon: TrendingUp, trend: 'Platform' },
          { label: 'Saved Addresses', value: user?.saved_addresses?.length || '0', icon: MapPin, trend: 'Profile' }
        ].map((stat, i) => (
          <div key={i} className="bg-bg-main p-5 rounded-2xl border border-border-main shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-bg-soft text-text-muted uppercase tracking-widest">{stat.trend}</span>
            </div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h4 className="text-2xl md:text-3xl font-black">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-main p-6 rounded-2xl border border-border-main shadow-sm">
          <h3 className="font-black text-lg mb-6">Recent Shipments</h3>
          <div className="space-y-4">
            {recentShipments.length > 0 ? recentShipments.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bg-soft border border-border-main flex items-center justify-center font-black text-brand-primary text-[9px]">
                    {s.awb?.substring(0, 4) || 'PNDG'}
                  </div>
                  <div>
                    <p className="font-black text-sm">{s.pickup_address?.city} → {s.delivery_address?.city}</p>
                    <p className="text-xs text-text-muted font-medium">{s.status} • {s.courier_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm">₹{(s.price_paise / 100).toFixed(2)}</p>
                  <p className="text-[10px] text-text-muted">{new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-text-muted font-bold text-sm">No shipments yet.</div>
            )}
          </div>
        </div>

        <div className="bg-bg-main p-6 rounded-2xl border border-border-main flex flex-col justify-center text-center space-y-5">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-brand-primary" />
          </div>
          <div>
            <h3 className="font-black text-lg mb-2">Ready to ship more?</h3>
            <p className="text-text-muted text-sm font-medium">Manage all your orders from one clean dashboard.</p>
          </div>
          <button
            onClick={() => navigate('/calculator')}
            className="h-12 bg-brand-primary text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20"
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
    <div className="text-left">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-black mb-1">My Shipments</h2>
        <p className="text-text-muted font-medium text-sm">Your complete tracking and history.</p>
      </div>

      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {shipments.length > 0 ? shipments.map((s, i) => (
          <div key={s._id || i} className="bg-bg-main p-5 rounded-2xl border border-border-main">
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-sm text-brand-primary">#{s.awb || 'DRAFT'}</span>
              <span className="px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary">{s.status}</span>
            </div>
            <p className="font-bold text-sm flex items-center gap-1 mb-1">
              {s.pickup_address?.city} <ArrowRight className="w-3 h-3 text-text-muted" /> {s.delivery_address?.city}
            </p>
            <div className="flex items-center justify-between text-xs text-text-muted font-medium">
              <span>{new Date(s.createdAt).toLocaleDateString()}</span>
              <span className="font-black text-text-main">₹{(s.price_paise / 100).toFixed(2)}</span>
            </div>
          </div>
        )) : (
          <div className="py-16 text-center font-bold text-text-muted">No shipments found.</div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-bg-main rounded-2xl border border-border-main overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-soft border-b border-border-main">
              <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Tracking ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Route</th>
              <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Price</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s, i) => (
              <tr key={s._id || i} className="border-b border-border-main/50 hover:bg-bg-soft/50 transition-colors cursor-pointer">
                <td className="px-6 py-5">
                  <span className="font-black text-sm">#{s.awb || 'DRAFT'}</span>
                  <p className="text-[10px] text-text-muted mt-0.5">{new Date(s.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span>{s.pickup_address?.city}</span>
                    <ArrowRight className="w-3 h-3 text-text-muted" />
                    <span>{s.delivery_address?.city}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary">{s.status}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="font-black">₹{(s.price_paise / 100).toFixed(2)}</span>
                </td>
              </tr>
            ))}
            {shipments.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-16 text-center font-bold text-text-muted">No shipments found.</td></tr>
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
    <div className="max-w-2xl text-left">
      <h2 className="text-2xl md:text-3xl font-black mb-8">Profile Settings</h2>
      <div className="space-y-6">
        <div className="flex items-center gap-6 pb-8 border-b border-border-main">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand-primary/10 border-2 border-dashed border-brand-primary/30 flex items-center justify-center font-black text-2xl md:text-3xl text-brand-primary uppercase shrink-0">
            {user?.name?.[0]}
          </div>
          <div className="space-y-2">
            <p className="font-black text-base">{user?.name}</p>
            <p className="text-sm text-text-muted font-medium">{user?.email}</p>
            <button className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-secondary transition-all">
              Change Photo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Name</label>
            <input type="text" defaultValue={user?.name} className="w-full h-12 px-5 bg-bg-soft border border-border-main rounded-xl focus:border-brand-primary outline-none font-bold transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Email Address</label>
            <input type="email" defaultValue={user?.email} disabled className="w-full h-12 px-5 bg-bg-soft/50 border border-border-main rounded-xl outline-none font-bold text-text-muted" />
          </div>
        </div>

        <div className="pt-2">
          <button className="h-12 px-8 bg-text-main text-bg-main rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
