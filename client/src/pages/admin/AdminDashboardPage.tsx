import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User, Package, Search, Eye, ShieldCheck,
  Truck, DollarSign, RefreshCw, XCircle,
  FileDown, Loader2, Users
} from "lucide-react";
import { 
  getAdminRevenueStats, 
  getCourierConfigs, 
  updateCourierConfig, 
  getAdminUsers,
  updateAdminUserKyc,
  downloadAdminReport,
  getAdminShipments
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [recentShipments, setRecentShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, courierData, usersData, shipmentsData] = await Promise.all([
        getAdminRevenueStats(),
        getCourierConfigs(),
        getAdminUsers('PENDING'),
        getAdminShipments(10, 0)
      ]);
      setStats(statsData);
      setCouriers(courierData);
      setPendingUsers(usersData);
      setRecentShipments(shipmentsData.shipments);
    } catch (err) {
      console.error("Admin data fetch error:", err);
      showToast("Failed to fetch administrative data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleCourier = async (id: string, currentStatus: boolean) => {
    try {
      setUpdatingId(id);
      await updateCourierConfig(id, { is_active: !currentStatus });
      setCouriers(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
      showToast(`Courier ${!currentStatus ? 'enabled' : 'disabled'} successfully.`, "success");
    } catch (err) {
      showToast("Failed to update courier status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleKycAction = async (userId: string, action: 'VERIFIED' | 'REJECTED') => {
    try {
      setUpdatingId(userId);
      await updateAdminUserKyc(userId, action);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      showToast(`KYC ${action === 'VERIFIED' ? 'approved' : 'rejected'} successfully.`, "success");
    } catch (err) {
      showToast("Failed to process KYC action.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await downloadAdminReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SwiftRoute_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      showToast("Report generated.", "success");
    } catch (err) {
      showToast("Export failed.", "error");
    } finally {
      setExporting(false);
    }
  };

  const kpis = [
    { label: "Total Shipments", value: stats?.metrics?.total_shipments || "0", change: "+12%", up: true, icon: Package, color: "bg-blue-500/10 text-blue-500" },
    { label: "Active Partners", value: couriers.filter(c => c.is_active).length.toString(), change: "Stable", up: true, icon: Truck, color: "bg-purple-500/10 text-purple-500" },
    { label: "Revenue (30d)", value: `₹${((stats?.metrics?.total_gmv_paise || 0) / 100).toLocaleString()}`, change: "+18%", up: true, icon: DollarSign, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Total Users", value: stats?.metrics?.total_users || "0", change: "Growing", up: true, icon: Users, color: "bg-rose-500/10 text-rose-500" },
  ];

  const filteredShipments = recentShipments.filter(s =>
    !search || s.awb_number?.toLowerCase().includes(search.toLowerCase()) || s.id?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Loading metrics...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">System Overview</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Real-time performance and operational status.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleExport}
              disabled={exporting}
              className="bg-card border-border hover:bg-muted text-foreground font-bold flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              {exporting ? "Exporting..." : "Download Report"}
            </Button>
            <Button onClick={fetchData} variant="outline" size="icon" className="h-11 w-11 rounded-xl border-border/40 hover:bg-muted">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => (
            <Card key={idx} className="bg-card border-border/50 shadow-sm rounded-2xl overflow-hidden glass-card p-5 flex items-center gap-4 hover:border-primary/20 transition-all">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-border/10", kpi.color)}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</div>
                <div className="text-2xl font-heading font-extrabold text-foreground tracking-tight">{kpi.value}</div>
                <div className={cn("text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full inline-block", kpi.up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500")}>
                  {kpi.change}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Courier Partner Status */}
          <Card className="bg-card border-border/50 shadow-sm rounded-2xl overflow-hidden glass-card h-fit">
            <div className="p-5 border-b border-border/60">
              <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> 
                Courier Partners
              </h3>
            </div>
            <div className="divide-y divide-border/60">
              {couriers.map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                  <div>
                    <div className="font-bold text-sm text-foreground">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold tracking-tighter">{c.code}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={updatingId === c.id}
                    onClick={() => handleToggleCourier(c.id, c.is_active)}
                    className={cn(
                      "h-8 px-3 text-[10px] font-extrabold uppercase rounded-lg transition-all",
                      c.is_active 
                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                    )}
                  >
                    {updatingId === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (c.is_active ? "Active" : "Disabled")}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Shipments & KYC */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card border-border/50 shadow-sm rounded-2xl overflow-hidden glass-card">
              <div className="p-5 border-b border-border/60 flex items-center justify-between gap-4">
                <h3 className="font-heading font-bold text-lg shrink-0">Live Shipments</h3>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search AWB..." className="pl-9 h-9 bg-muted/30 border-border/40 text-sm" />
                </div>
              </div>
              <div className="divide-y divide-border/60">
                {filteredShipments.length > 0 ? filteredShipments.map(ship => (
                  <div key={ship.id} className="flex items-center justify-between p-4 hover:bg-muted/20 group transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-sm text-foreground tracking-tighter">{ship.awb_number || 'DRAFT: ' + ship.id.substring(0,8)}</div>
                        <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{ship.status} · {ship.courier_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn("text-[9px] font-extrabold uppercase px-2 py-0.5",
                        ship.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        ship.status === "CANCELLED" || ship.status === "RTO" ? "bg-rose-50 text-rose-700 border-rose-200" :
                        "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {ship.status}
                      </Badge>
                      <Button onClick={() => navigate(`/track/${ship.awb_number}`)} variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center text-muted-foreground italic text-sm">No recent shipments found.</div>
                )}
              </div>
            </Card>

            <Card className="bg-card border-border/50 shadow-sm rounded-2xl overflow-hidden glass-card">
              <div className="p-5 border-b border-border/40">
                <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> 
                  KYC Verification Queue
                </h3>
              </div>
              <div className="divide-y divide-border/60">
                {pendingUsers.length > 0 ? pendingUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted/40 rounded-xl flex items-center justify-center text-muted-foreground">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">{user.name || user.email}</div>
                        <div className="text-[10px] text-muted-foreground font-bold tracking-tight">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        disabled={updatingId === user.id}
                        onClick={() => handleKycAction(user.id, 'VERIFIED')}
                        className="h-8 text-[10px] font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-md px-4"
                      >
                        {updatingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={updatingId === user.id}
                        onClick={() => handleKycAction(user.id, 'REJECTED')}
                        className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center text-muted-foreground italic text-sm">Verification queue is empty.</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
