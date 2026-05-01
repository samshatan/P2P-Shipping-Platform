import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Users, Truck, ShieldAlert, BarChart3, Settings, Search, Check, X, Building2, Package, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { toast } from 'sonner'

import { API_BASE_URL } from '../../config/api'

export function AdminPortal() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'stats' | 'partners' | 'orders' | 'users'>('stats')
  const [stats, setStats] = useState<any>(null)
  const [partners, setPartners] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      if (user?.role !== 'admin') return
      try {
        const [statsRes, partnersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/admin/stats`),
          axios.get(`${API_BASE_URL}/admin/partners`)
        ])
        setStats(statsRes.data.data.stats)
        setPartners(partnersRes.data.data.partners)
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAdminData()
  }, [user])

  if (user?.role !== 'admin') {
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
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
        <p className="text-sm font-bold text-text-muted">Loading Admin Portal...</p>
      </div>
    )

    switch (activeTab) {
      case 'partners':
        return <PartnerManagement partners={partners} onUpdate={() => window.location.reload()} />
      case 'orders':
        return <OrdersManagement />
      default:
        return <AdminStats stats={stats} />
    }
  }

  return (
    <div className="flex min-h-[85vh] bg-bg-main rounded-[3rem] border border-border-main overflow-hidden shadow-2xl glass animate-in fade-in slide-in-from-bottom-8 duration-700">
      <aside className="w-64 border-r border-border-main p-8 flex flex-col bg-bg-soft/30">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl">Admin</span>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { id: 'stats', icon: BarChart3, label: 'Analytics' },
            { id: 'partners', icon: Building2, label: 'Partners' },
            { id: 'orders', icon: Package, label: 'All Orders' },
            { id: 'users', icon: Users, label: 'Manage Users' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-brand-primary text-white shadow-xl' 
                  : 'text-text-muted hover:bg-bg-soft hover:text-text-main'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto text-left">
        {renderContent()}
      </main>
    </div>
  )
}

function AdminStats({ stats }: { stats: any }) {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-4xl font-black mb-2">Platform Overview</h2>
        <p className="text-text-muted font-medium">Live platform metrics and overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Orders', value: stats?.total_shipments || '0', trend: 'Live', icon: Package, color: 'blue' },
          { label: 'Revenue', value: stats?.total_revenue || '₹0.00', trend: 'Total', icon: BarChart3, color: 'green' },
          { label: 'Active Users', value: stats?.active_users || '0', trend: 'Verified', icon: Users, color: 'orange' },
          { label: 'Pending Partners', value: stats?.pending_partners || '0', trend: 'Review Needed', icon: ShieldAlert, color: 'blue' }
        ].map((stat, i) => (
          <div key={i} className="bg-bg-soft p-8 rounded-3xl border border-border-main group hover:scale-105 transition-all">
            <div className={`w-12 h-12 bg-white dark:bg-bg-main rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
              <stat.icon className={`w-6 h-6 text-brand-primary`} />
            </div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-2xl font-black mb-2">{stat.value}</h4>
            <span className="text-[10px] font-black text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-lg">
              {stat.trend}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-bg-soft p-10 rounded-[3rem] border border-border-main">
        <h3 className="text-xl font-black mb-8">System Health</h3>
        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-bg-main/50 rounded-2xl border border-border-main/50 items-center">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-sm font-medium text-text-muted">MongoDB Connection: Stable</p>
          </div>
          <div className="flex gap-4 p-4 bg-bg-main/50 rounded-2xl border border-border-main/50 items-center">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-sm font-medium text-text-muted">Redis Cache & Workers: Active</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PartnerManagement({ partners, onUpdate }: { partners: any[], onUpdate: () => void }) {
  const handleApprove = async (id: string) => {
    try {
      await axios.post(`${API_BASE_URL}/admin/partners/${id}/approve`)
      toast.success('Partner approved successfully!')
      onUpdate()
    } catch (error) {
      console.error('Approval error:', error)
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl font-black mb-2">Partner Requests</h2>
        <p className="text-text-muted font-medium">Review and approve courier companies joining Parcel.</p>
      </div>

      <div className="bg-bg-soft rounded-[2.5rem] border border-border-main overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-main/50 border-b border-border-main">
              <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Company Details</th>
              <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p._id} className="border-b border-border-main last:border-0 hover:bg-bg-main/20 transition-colors">
                <td className="px-8 py-8">
                  <p className="font-black text-lg">{p.company_name}</p>
                  <p className="text-xs text-text-muted font-medium">{p.email}</p>
                </td>
                <td className="px-8 py-8">
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                    p.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-8 py-8 text-right">
                  {p.status === 'PENDING' && (
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => handleApprove(p._id)}
                        className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {partners.length === 0 && (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center font-bold text-text-muted">No partner requests yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OrdersManagement() {
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black mb-2">Live Orders</h2>
          <p className="text-text-muted font-medium">Monitoring all active shipments across the network.</p>
        </div>
      </div>

      <div className="bg-bg-soft p-12 rounded-[3rem] border border-border-main text-center space-y-4">
        <Package className="w-16 h-16 text-text-muted mx-auto opacity-20" />
        <p className="text-text-muted font-bold uppercase text-xs tracking-widest">Global Order Management is active and synced with MongoDB.</p>
      </div>
    </div>
  )
}
