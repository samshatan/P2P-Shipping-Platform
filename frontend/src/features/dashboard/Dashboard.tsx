import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Package, User, LogOut, Search, Menu, X, TrendingUp, MapPin, ArrowRight, Sparkles, Loader2, Bell, Shield, Globe, HelpCircle, Trash2, Mail, Phone, Lock, Calendar, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config/api'
import { toast } from 'sonner'

const NAV_ITEMS = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { id: 'shipments', icon: Package, label: 'History' },
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'settings', icon: Sparkles, label: 'Settings' },
]

export function Dashboard() {
  const { user, token, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'shipments' | 'profile' | 'settings'>('overview')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [shipments, setShipments] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    if (!token) return;
    try {
      const requests = [
        axios.get(`${API_BASE_URL}/users/shipments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]

      // Only fetch admin stats if user is admin
      if (user?.role === 'ADMIN') {
        requests.push(
          axios.get(`${API_BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      }

      const results = await Promise.all(requests)
      
      setShipments(results[0].data.data?.shipments || [])
      if (results[1].data.success) {
        updateUser(results[1].data.data)
      }
      if (user?.role === 'ADMIN' && results[2]) {
        setStats(results[2].data.data?.stats || null)
      }
    } catch (error: any) {
      console.error('Dashboard fetch error:', error)
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
        logout()
        navigate('/')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  const handleUpdateProfile = async (data: { name: string; phone: string }) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/users/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        updateUser(res.data.data)
        toast.success('Profile updated successfully')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleUpdateSettings = async (settings: any) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/users/settings`, { settings }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        updateUser({ settings: res.data.data.settings })
        toast.success('Preferences updated')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings')
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) return
    try {
      await axios.delete(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Account deactivated')
      logout()
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to deactivate account')
    }
  }

  const handleUpdatePassword = async (passwords: any) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/change-password`, passwords, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success('Password updated successfully')
        return true
      }
      return false
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password')
      return false
    }
  }

  const renderContent = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
        <p className="text-sm font-bold text-white/50">Loading your dashboard...</p>
      </div>
    )
    switch (activeTab) {
      case 'shipments': return <ShipmentsView shipments={shipments} />
      case 'profile': return <ProfileView user={user} shipmentsCount={shipments.length} onUpdate={handleUpdateProfile} onDelete={handleDeleteAccount} onUpdatePassword={handleUpdatePassword} />
      case 'settings': return <SettingsView settings={user?.settings} onUpdate={handleUpdateSettings} onUpdatePassword={handleUpdatePassword} />
      default: return <OverviewView user={user} shipments={shipments} stats={stats} onSeeAll={() => setActiveTab('shipments')} />
    }
  }

  return (
    <div className="flex min-h-screen bg-[#050505] overflow-hidden animate-in fade-in duration-700 relative">

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

function OverviewView({ user, shipments, stats, onSeeAll }: { user: any; shipments: any[]; stats: any; onSeeAll: () => void }) {
  const navigate = useNavigate()
  const recentShipments = shipments.slice(0, 3)

  return (
    <div className="space-y-10 text-left">
      <div>
        <h2 className="text-2xl md:text-4xl font-display font-black mb-2">Hey {user?.name?.split(' ')[0] || 'there'}, welcome back! 👋</h2>
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
            <h4 className="text-2xl md:text-3xl font-display font-black">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-black text-2xl">Latest Updates</h3>
            <button onClick={() => onSeeAll()} className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest">See All</button>
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
    <div className="max-w-5xl mx-auto text-left space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-display font-black mb-2">Shipping History</h2>
          <p className="text-white/60 font-medium text-lg">Detailed tracking for all your active and past orders.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="h-12 pl-12 pr-6 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-brand-primary outline-none transition-all w-full sm:w-64"
              />
           </div>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="space-y-6 md:hidden">
        {shipments.length > 0 ? shipments.map((s, i) => (
          <div key={s._id || i} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-colors"></div>
            <div className="flex items-center justify-between relative z-10">
              <span className="font-black text-lg text-brand-primary">#{s.awb || 'DRAFT'}</span>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                s.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' : 'bg-brand-primary/10 text-brand-primary'
              }`}>{s.status}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white/30" />
                 </div>
                 <p className="font-bold text-base flex items-center gap-2">
                   {s.pickup_address?.city} <ArrowRight className="w-4 h-4 text-white/20" /> {s.delivery_address?.city}
                 </p>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white/30" />
                 </div>
                 <p className="text-sm font-medium text-white/40">{new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="font-black text-2xl">₹{(s.price_paise / 100).toFixed(2)}</span>
              <button onClick={() => navigate(`/tracking?awb=${s.awb}`)} className="h-10 px-6 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Track</button>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center font-medium text-white/40 text-lg border-2 border-dashed border-white/5 rounded-[3rem]">No orders found yet.</div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
        <table className="w-full text-left border-collapse relative z-10">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Shipment Details</th>
              <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Route Information</th>
              <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Status</th>
              <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Price</th>
              <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {shipments.map((s, i) => (
              <tr key={s._id || i} className="hover:bg-white/[0.03] transition-colors group">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-brand-primary text-sm group-hover:scale-110 transition-transform">
                      {s.awb?.substring(0, 2) || 'DR'}
                    </div>
                    <div>
                      <span className="font-black text-base block group-hover:text-brand-primary transition-colors">#{s.awb || 'DRAFT'}</span>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Booked on {new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4 font-bold text-base">
                    <div className="text-white/80">{s.pickup_address?.city}</div>
                    <div className="flex flex-col items-center gap-0.5">
                       <ArrowRight className="w-4 h-4 text-white/20" />
                       <div className="w-4 h-[1px] bg-white/10"></div>
                    </div>
                    <div className="text-white/80">{s.delivery_address?.city}</div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex flex-col items-start gap-1">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      s.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' : 'bg-brand-primary/10 text-brand-primary'
                    }`}>{s.status}</span>
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest ml-1">{s.courier_name}</p>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <span className="font-black text-lg text-white">₹{(s.price_paise / 100).toFixed(2)}</span>
                </td>
                <td className="px-10 py-8">
                  <button 
                    onClick={() => navigate(`/tracking?awb=${s.awb}`)}
                    className="h-12 px-8 bg-white/5 text-white/50 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
            {shipments.length === 0 && (
              <tr><td colSpan={5} className="px-10 py-32 text-center font-display font-black text-white/20 text-3xl">No history found. <br /> Start your first shipment!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProfileView({ user, shipmentsCount, onUpdate, onDelete, onUpdatePassword }: { user: any; shipmentsCount: number; onUpdate: (data: any) => void; onDelete: () => void; onUpdatePassword: (p: any) => Promise<boolean> }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || ''
    })
  }, [user])

  const handleSave = () => {
    onUpdate(formData)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    setIsUpdating(true)
    const success = await onUpdatePassword({ 
      currentPassword: passwords.currentPassword, 
      newPassword: passwords.newPassword 
    })
    setIsUpdating(false)
    if (success) {
      setShowPasswordModal(false)
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }
  }

  return (
    <div className="max-w-4xl text-left space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-4xl md:text-5xl font-['Lucida_Fax',_serif] font-black mb-10 text-white">Profile Settings</h2>
        
        <div className="flex items-center gap-8 mb-12">
          <div className="w-24 h-24 rounded-3xl bg-[#0A0D14] border-2 border-dashed border-blue-500/30 flex items-center justify-center text-3xl font-black text-blue-500 shadow-2xl">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-black text-white">{user?.name}</h3>
              <p className="text-white/40 font-medium">{user?.email}</p>
            </div>
            <button className="h-10 px-6 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-white/5">
              Change Avatar
            </button>
          </div>
        </div>

        <div className="w-full h-px bg-white/10 mb-12"></div>

        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-14 px-6 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-white/40 outline-none font-bold text-lg transition-all" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" 
                value={user?.email} 
                disabled
                className="w-full h-14 px-6 bg-white/[0.03] border border-white/10 rounded-2xl outline-none font-bold text-lg transition-all cursor-not-allowed opacity-40" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Phone Number</label>
              <input 
                type="tel" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-14 px-6 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-white/40 outline-none font-bold text-lg transition-all" 
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={handleSave}
              className="h-16 px-12 bg-white text-black rounded-2xl font-black text-base uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 w-full sm:w-auto"
            >
              Save Profile
            </button>
            <button 
              onClick={() => setFormData({ name: user?.name || '', phone: user?.phone || '' })}
              className="h-16 px-10 bg-white/5 text-white/50 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all w-full sm:w-auto"
            >
              Discard Changes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all cursor-pointer" onClick={() => setShowPasswordModal(true)}>
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                     <Lock className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="font-black text-lg">Change Password</h4>
                     <p className="text-sm font-medium text-white/40 uppercase tracking-widest">Update credentials</p>
                  </div>
               </div>
               <ChevronRight className="w-6 h-6 text-white/10 group-hover:text-white transition-colors" />
            </div>

            <div className="bg-red-500/[0.02] p-8 rounded-[2.5rem] border border-red-500/10 flex items-center justify-between group hover:border-red-500/20 transition-all cursor-pointer" onClick={onDelete}>
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                     <Shield className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="font-black text-lg text-red-500">Deactivate</h4>
                     <p className="text-sm font-medium text-red-500/40 uppercase tracking-widest">Remove account</p>
                  </div>
               </div>
               <ChevronRight className="w-6 h-6 text-red-500/10 group-hover:text-red-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black mb-8">Update Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Current Password</label>
                <input 
                  type="password"
                  required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-primary outline-none font-bold text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">New Password</label>
                <input 
                  type="password"
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-primary outline-none font-bold text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Confirm New Password</label>
                <input 
                  type="password"
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-primary outline-none font-bold text-white"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 h-16 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 h-16 bg-white/5 text-white/50 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsView({ settings, onUpdate, onUpdatePassword }: { settings: any; onUpdate: (data: any) => void; onUpdatePassword: (p: any) => Promise<boolean> }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [isUpdating, setIsUpdating] = useState(false)

  const toggleSetting = (key: string) => {
    onUpdate({ [key]: !settings?.[key] })
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    setIsUpdating(true)
    const success = await onUpdatePassword({ 
      currentPassword: passwords.currentPassword, 
      newPassword: passwords.newPassword 
    })
    setIsUpdating(false)
    if (success) {
      setShowPasswordModal(false)
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }
  }

  const items = [
    { key: 'notifications', title: 'Notifications', desc: 'Alerts for status updates & offers', icon: Bell },
    { key: 'biometric_login', title: 'Biometric Login', desc: 'Secure access with Fingerprint/FaceID', icon: Shield },
    { key: 'global_coverage', title: 'Global Coverage', desc: 'International shipping route updates', icon: Globe },
    { key: 'auto_fill_addresses', title: 'Auto-fill Addresses', desc: 'Save time with smart suggestions', icon: Sparkles }
  ]

  return (
    <div className="max-w-4xl text-left space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl md:text-5xl font-display font-black mb-2">Preferences</h2>
        <p className="text-white/60 font-medium text-lg">Customize your dashboard experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {items.map((item, i) => {
          const isActive = settings?.[item.key] ?? false
          return (
            <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all shadow-sm">
               <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isActive ? 'bg-brand-primary/10 text-brand-primary' : 'bg-white/5 text-white/20'}`}>
                     <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="font-black text-lg">{item.title}</h4>
                     <p className="text-sm font-medium text-white/40">{item.desc}</p>
                  </div>
               </div>
               <button 
                onClick={() => toggleSetting(item.key)}
                className={`w-14 h-8 rounded-full relative transition-colors ${isActive ? 'bg-brand-primary' : 'bg-white/10'}`}
               >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${isActive ? 'right-1' : 'left-1'}`}></div>
               </button>
            </div>
          )
        })}
      </div>

      <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/10 space-y-10">
         <h4 className="font-display font-black text-2xl flex items-center gap-4">
            <Lock className="w-6 h-6 text-brand-primary" /> Security & Access
         </h4>
         
         <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 gap-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                     <Lock className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="font-bold text-base">Change Password</p>
                     <p className="text-xs text-white/40 font-medium uppercase tracking-widest">Update your account credentials</p>
                  </div>
               </div>
               <button 
                onClick={() => setShowPasswordModal(true)}
                className="h-12 px-6 bg-white/5 text-white/50 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
               >
                Update
               </button>
            </div>
         </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black mb-8">Update Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Current Password</label>
                <input 
                  type="password"
                  required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-primary outline-none font-bold text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">New Password</label>
                <input 
                  type="password"
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-primary outline-none font-bold text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Confirm New Password</label>
                <input 
                  type="password"
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-primary outline-none font-bold text-white"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 h-16 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 h-16 bg-white/5 text-white/50 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-white/30 px-6">
         <div className="flex items-center gap-6">
            <button className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-2">
               <HelpCircle className="w-3.5 h-3.5" /> Support
            </button>
            <button className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors">Privacy Policy</button>
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.2em]">Version 2.4.1-alpha</p>
      </div>
    </div>
  )
}
