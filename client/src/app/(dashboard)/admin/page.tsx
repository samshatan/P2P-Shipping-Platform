import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users, User, Package, TrendingUp, AlertCircle, Search, Eye, ShieldCheck,
  Truck, DollarSign, Activity, Settings, RefreshCw, CheckCircle2, XCircle
} from "lucide-react";
import { MOCK_SHIPMENTS } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const kpis = [
    { label: "Shipments Today", value: "1,284", change: "+12%", up: true, icon: Package, color: "bg-blue-100 text-blue-600" },
    { label: "Active Users", value: "8,923", change: "+5%", up: true, icon: Users, color: "bg-purple-100 text-purple-600" },
    { label: "Revenue (Today)", value: "₹3.2L", change: "+18%", up: true, icon: DollarSign, color: "bg-emerald-100 text-emerald-600" },
    { label: "Exceptions", value: "37", change: "-4%", up: false, icon: AlertCircle, color: "bg-rose-100 text-rose-600" },
  ];

  const couriers = [
    { name: "Delhivery", active: true, onTimeRate: "96%", coverage: "27,000+ pincodes", shipments: 542 },
    { name: "Blue Dart", active: true, onTimeRate: "98%", coverage: "18,000+ pincodes", shipments: 231 },
    { name: "XpressBees", active: true, onTimeRate: "91%", coverage: "22,000+ pincodes", shipments: 189 },
    { name: "DTDC", active: false, onTimeRate: "88%", coverage: "20,000+ pincodes", shipments: 0 },
    { name: "Ecom Express", active: true, onTimeRate: "93%", coverage: "15,000+ pincodes", shipments: 104 },
  ];

  const filteredShipments = MOCK_SHIPMENTS.filter(s =>
    !search || s.awb.toLowerCase().includes(search.toLowerCase()) || s.toCity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-foreground text-white rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h1 className="text-3xl font-heading font-extrabold text-foreground">Admin Control Panel</h1>
              </div>
              <p className="text-muted-foreground text-sm font-medium ml-13">Platform operations overview.</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-0 uppercase font-bold tracking-wider flex items-center gap-2 px-4 py-2">
              <Activity className="w-4 h-4 animate-pulse" /> All Systems Operational
            </Badge>
          </div>

          {/* KPI Row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {kpis.map(kpi => (
              <Card key={kpi.label} className="bg-white border-border shadow-sm rounded-2xl p-6 flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", kpi.color)}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</div>
                  <div className="text-2xl font-heading font-extrabold text-foreground">{kpi.value}</div>
                  <div className={cn("text-xs font-bold mt-1", kpi.up ? "text-emerald-600" : "text-rose-500")}>
                    {kpi.change} vs yesterday
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Courier Partner Status */}
            <Card className="bg-white border-border shadow-sm rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border/60 flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> Courier Partners</h3>
                <Button variant="ghost" size="sm" className="text-xs font-bold text-primary h-8">
                  <Settings className="w-4 h-4 mr-1" /> Manage
                </Button>
              </div>
              <div className="divide-y divide-border/60">
                {couriers.map(c => (
                  <div key={c.name} className="flex items-center justify-between p-4 hover:bg-muted/20">
                    <div>
                      <div className="font-bold text-sm">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{c.coverage} · {c.onTimeRate} on-time</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {c.active ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Shipments */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-border shadow-sm rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-border/60 flex items-center justify-between gap-4">
                  <h3 className="font-heading font-bold text-lg shrink-0">Live Shipments</h3>
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search AWB or city..." className="pl-9 h-9 bg-muted/30" />
                  </div>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="divide-y divide-border/60">
                  {filteredShipments.map(ship => (
                    <div key={ship.awb} className="flex items-center justify-between p-4 hover:bg-muted/20 group">
                      <div>
                        <div className="font-mono font-bold text-sm">{ship.awb}</div>
                        <div className="text-xs text-muted-foreground">{ship.fromCity} → {ship.toCity} via {ship.courier}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={cn("text-[10px] font-bold uppercase",
                          ship.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          ship.status === "Exception" || ship.status === "Return Pending" ? "bg-rose-50 text-rose-700 border-rose-200" :
                          "bg-blue-50 text-blue-700 border-blue-200"
                        )}>
                          {ship.status}
                        </Badge>
                        <Button onClick={() => navigate(`/track/${ship.awb}`)} variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Pending KYC Requests - NEW */}
              <Card className="bg-white border-border shadow-sm rounded-2xl overflow-hidden mt-8">
                <div className="p-5 border-b border-border/60 flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-600" /> Pending KYC Approvals
                  </h3>
                  <Badge className="bg-purple-100 text-purple-700 border-0 uppercase text-[10px] font-extrabold px-3 py-1">3 Pending</Badge>
                </div>
                <div className="divide-y divide-border/60">
                  {[
                    { name: "Rahul S.", phone: "+91 98XXX XX210", doc: "aadhaar_front.jpg", time: "2h ago" },
                    { name: "Anita K.", phone: "+91 99XXX XX345", doc: "pan_card.jpg", time: "5h ago" },
                    { name: "Vikram P.", phone: "+91 97XXX XX901", doc: "aadhaar_front.jpg", time: "1d ago" }
                  ].map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-muted/40 rounded-xl flex items-center justify-center text-muted-foreground">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">{req.name}</div>
                          <div className="text-[10px] text-muted-foreground font-medium italic">{req.phone} • {req.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase border-border hover:bg-gray-50">
                          View ID
                        </Button>
                        <Button size="sm" className="h-8 text-[10px] font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm">
                          Approve
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
