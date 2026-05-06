import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Users, Truck, ShieldAlert, BarChart3, Settings, Search, Check, X, Building2, Package, Loader2, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { toast } from 'sonner'

import { API_BASE_URL } from '../../config/api'

export function AdminPortal() {
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState<'stats' | 'partners' | 'orders' | 'users'>('stats')
  const [stats, setStats] = useState<any>(null)
  const [partners, setPartners] = useState<any[]>([])
  const [usersList, setUsersList] = useState<any[]>([])
  const [ordersList, setOrdersList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      if (user?.role !== 'ADMIN' || !token) return
      setIsLoading(true)
      try {
        const [statsRes, partnersRes, usersRes, ordersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/admin/partners`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/admin/shipments`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])
        setStats(statsRes.data.data.stats)
        setPartners(partnersRes.data.data.partners)
        setUsersList(usersRes.data.data.users.filter((u: any) => u.role === 'USER' || u.role === 'PARTNER'))
        setOrdersList(ordersRes.data.data.shipments)
      } catch (error) {
        console.error('Admin fetch error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAdminData()
  }, [user, token, activeTab]) // Refetch on tab change to ensure data is fresh

  if (user?.role !== 'ADMIN') {
    return (
      <div className="py-20 text-center space-y-6">
        <ShieldAlert className="w-20 h-20 text-red-500 mx-auto animate-bounce" />
        <h2 className="text-4xl font-black">Access Denied</h2>
        <p className="text-text-muted font-medium">You do not have the required permissions to view this portal.</p>
        <button onClick={() => window.location.href = '/'} className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold">Return Home</button>
      </div>
    )
  }

  const renderContent = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
        <p className="text-sm font-bold text-text-muted">Syncing data...</p>
      </div>
    )

    switch (activeTab) {
      case 'partners':
        return <PartnerManagement partners={partners} onUpdate={() => window.location.reload()} />
      case 'orders':
        return <OrdersManagement orders={ordersList} />
      case 'users':
        return <UsersManagement users={usersList} />
      default:
        return <AdminStats stats={stats} />
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#050505] overflow-hidden glass animate-in fade-in slide-in-from-bottom-8 duration-700">
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 p-8 flex flex-col bg-white/[0.02]">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-blue-600 rounded-[1rem] flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-black text-xl block">Admin Center</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">System Override</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'stats', icon: BarChart3, label: 'Analytics', desc: 'Real-time Metrics' },
            { id: 'partners', icon: Building2, label: 'Partners', desc: 'Vendor Access' },
            { id: 'orders', icon: Package, label: 'Shipments', desc: 'Global Logistics' },
            { id: 'users', icon: Users, label: 'User Base', desc: 'Access Control' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] transition-all group ${activeTab === item.id
                  ? 'bg-white text-black shadow-2xl scale-[1.02]'
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-black' : 'text-brand-primary'}`} />
              <div className="text-left">
                <span className="font-black text-sm block">{item.label}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === item.id ? 'text-black/50' : 'text-white/20'}`}>{item.desc}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 px-2">
          <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-1">Server Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold text-white/60">Global Cluster Active</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto text-left bg-gradient-to-br from-transparent to-brand-primary/5">
        <div className="w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

function AdminStats({ stats }: { stats: any }) {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-['Lucida_Fax',_serif] font-black mb-4 text-white">Analytics</h2>
          <p className="text-white/40 font-medium text-xl max-w-2xl leading-relaxed">Detailed platform intelligence and distribution metrics.</p>
        </div>
        <div className="flex gap-4">
          <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 text-right">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Status</p>
            <p className="text-2xl font-black text-green-500 font-mono">OPERATIONAL</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Orders', value: stats?.total_shipments || '0', trend: 'Global', icon: Package, color: 'brand' },
          { label: 'Platform Revenue', value: stats?.total_revenue || '₹0.00', trend: 'Verified', icon: BarChart3, color: 'blue' },
          { label: 'Verified Users', value: stats?.active_users || '0', trend: 'Live', icon: Users, color: 'orange' },
          { label: 'Vendor Requests', value: stats?.pending_partners || '0', trend: 'Action Required', icon: ShieldAlert, color: 'red' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 p-6 rounded-[1.5rem] border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[60px] group-hover:bg-brand-primary/20 transition-all"></div>
            <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-6 h-6 text-brand-primary`} />
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-3xl font-black mb-3 text-white tracking-tight">{stat.value}</h4>
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl ${stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-brand-primary/10 text-brand-primary'}`}>
              {stat.trend}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-8 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white">System Architecture</h3>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-brand-primary animate-pulse"></div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Processing</span>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Main Database (MongoDB Atlas)', status: 'Connected', load: 'Healthy', color: 'green' },
              { label: 'Cache Layer (Redis Cloud)', status: 'Active', load: 'Optimal', color: 'green' },
              { label: 'Search Engine (ElasticSearch)', status: 'Ready', load: 'Active', color: 'blue' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-6">
                  <div className={`w-2 h-2 rounded-full ${item.color === 'green' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <span className="font-bold text-white/70">{item.label}</span>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{item.status}</span>
                  <span className="text-sm font-black text-white w-12 text-right">{item.load}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-primary p-8 rounded-[2rem] text-black space-y-6 relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/20 blur-[80px]"></div>
          <h3 className="text-2xl font-black relative">Compliance Scan</h3>
          <p className="text-sm font-bold opacity-70 relative leading-relaxed">All system nodes are running verified firmware. No intrusions detected in the last 24h cycle.</p>
          <div className="pt-4 space-y-3 relative">
            <div className="h-1 bg-black/10 rounded-full overflow-hidden">
              <div className="h-full bg-black w-[94%]"></div>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
              <span>Security Protocol</span>
              <span>TLS 1.3 Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PartnerManagement({ partners, onUpdate }: { partners: any[], onUpdate: () => void }) {
  const { token } = useAuth()
  const handleApprove = async (id: string) => {
    try {
      await axios.post(`${API_BASE_URL}/admin/partners/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Partner approved successfully!')
      onUpdate()
    } catch (error) {
      console.error('Approval error:', error)
      toast.error('Failed to approve partner')
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl md:text-4xl font-['Lucida_Fax',_serif] font-black mb-4 text-white">Partners</h2>
        <p className="text-white/40 font-medium text-xl leading-relaxed">Review and verify professional courier networks.</p>
      </div>

      <div className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Organization</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Verification</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {partners.map((p) => (
                <tr key={p._id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <h4 className="font-bold text-sm text-white mb-1">{p.company_name}</h4>
                    <p className="text-xs text-white/30 font-medium">{p.email}</p>
                  </td>
                  <td className="p-6">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${p.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                      }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    {p.status === 'PENDING' ? (
                      <button
                        onClick={() => handleApprove(p._id)}
                        className="h-10 px-6 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5"
                      >
                        Authorize
                      </button>
                    ) : (
                      <div className="flex justify-end">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {partners.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-20 text-center">
                    <div className="space-y-4">
                      <Building2 className="w-12 h-12 text-white/10 mx-auto" />
                      <p className="font-black text-[10px] text-white/20 uppercase tracking-[0.2em]">No pending verifications</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function OrdersManagement({ orders }: { orders: any[] }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-['Lucida_Fax',_serif] font-black mb-4 text-white">Shipments</h2>
          <p className="text-white/40 font-medium text-lg leading-relaxed">Global logistics monitoring and intercept.</p>
        </div>
        <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Total Active</p>
          <p className="text-xl font-black text-white">{orders.length}</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Tracking</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Route</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Price</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order, i) => (
                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <p className="font-bold text-sm text-white mb-1">#{order.tracking_number}</p>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{order.service_type}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white/60">{order.origin_pincode}</span>
                      <ArrowRight className="w-3 h-3 text-white/20" />
                      <span className="text-xs font-bold text-white/60">{order.destination_pincode}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-black text-brand-primary uppercase">₹{(order.price_paise / 100).toFixed(2)}</span>
                  </td>
                  <td className="p-6 text-right">
                    <span className="text-[10px] font-black px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg uppercase tracking-widest border border-brand-primary/20">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <Package className="w-12 h-12 text-white/10 mx-auto" />
            <p className="font-black text-[10px] text-white/20 uppercase tracking-[0.2em]">No active shipments found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function UsersManagement({ users }: { users: any[] }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl md:text-4xl font-['Lucida_Fax',_serif] font-black mb-4 text-white">Users</h2>
        <p className="text-white/40 font-medium text-lg leading-relaxed">Identity management and authority control.</p>
      </div>

      <div className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">User</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Role</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u, i) => (
                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-xs font-black text-brand-primary uppercase">
                        {u.name?.[0] || 'U'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{u.name}</h4>
                        <p className="text-xs text-white/30">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] font-black px-2.5 py-1 bg-white/5 text-white/40 rounded-lg uppercase tracking-widest border border-white/5">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{u.is_active ? 'Active' : 'Locked'}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-white transition-colors">
                      {u.is_active ? 'Lock Account' : 'Unlock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <Users className="w-12 h-12 text-white/10 mx-auto" />
            <p className="font-black text-[10px] text-white/20 uppercase tracking-[0.2em]">User database is empty</p>
          </div>
        )}
      </div>
    </div>
  )
}
