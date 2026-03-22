import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Package, TrendingUp, AlertCircle, Plus, Wallet, ExternalLink, Filter, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserDashboard() {
  const activeShipments = [
    { id: "AWB123456789IN", status: "IN_TRANSIT", courier: "Delhivery", from: "Mumbai", to: "Delhi", date: "Today, 10:30 AM", eta: "27th Oct", color: "blue", step: 3 },
    { id: "AWB987654321IN", status: "PICKUP_PENDING", courier: "Blue Dart", from: "Mumbai", to: "Bangalore", date: "Tomorrow, 2:00 PM", eta: "29th Oct", color: "amber", step: 1 },
    { id: "AWB456789123IN", status: "DELIVERED", courier: "XpressBees", from: "Pune", to: "Chennai", date: "21st Oct", eta: "Delivered", color: "emerald", step: 5 },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-heading font-extrabold text-foreground">Overview</h1>
              <p className="text-muted-foreground mt-1 text-sm font-medium">Welcome back, Rahul. Here's what's happening today.</p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search AWB or Name" className="pl-10 h-10 bg-white shadow-sm border-border rounded-lg" />
              </div>
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search AWB or Name" className="pl-10 h-10 bg-white shadow-sm border-border rounded-lg" />
              </div>
              <Link to="/compare">
                <Button className="h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-sm w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" /> Book New
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-white border-border shadow-sm rounded-2xl flex flex-col justify-between group hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-bold border-0">+12%</Badge>
              </div>
              <div>
                <div className="text-3xl font-heading font-extrabold text-foreground">42</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mt-1">Total Shipments</div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-border shadow-sm rounded-2xl flex flex-col justify-between group hover:border-amber-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-heading font-extrabold text-foreground">3</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mt-1">Active Deliveries</div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-border shadow-sm rounded-2xl flex flex-col justify-between group hover:border-rose-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-heading font-extrabold text-foreground">1</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mt-1">Action Required</div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-tertiary to-[#8c3100] text-white border-0 shadow-lg shadow-tertiary/20 rounded-2xl flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[30px]"></div>
               <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Wallet className="w-5 h-5" />
                </div>
                <Link to="/profile">
                  <button className="text-[10px] font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full backdrop-blur-sm transition-colors">Recharge</button>
                </Link>
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-heading font-extrabold">₹2,450.00</div>
                <div className="text-sm font-bold text-white/80 uppercase tracking-wider mt-1">Wallet Balance</div>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Active Shipments */}
            <div className="lg:col-span-2 space-y-6">
               <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-border shadow-sm">
                 <h2 className="font-heading font-bold text-lg text-foreground">Active Shipments</h2>
                 <Button variant="ghost" size="sm" className="text-primary font-bold"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
               </div>

               <div className="space-y-4">
                 {activeShipments.map(ship => (
                   <Card key={ship.id} className="p-0 bg-white border-border shadow-sm rounded-2xl overflow-hidden group hover:border-primary/40 transition-colors">
                     <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border">
                       
                       <div className="p-6 flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                               <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{ship.courier}</div>
                               <div className="font-mono font-bold text-lg text-foreground">{ship.id}</div>
                            </div>
                            <Badge variant="outline" className={cn(
                              "uppercase text-[10px] tracking-wider font-bold border",
                              ship.color === "blue" ? "text-blue-700 bg-blue-50 border-blue-200" :
                              ship.color === "amber" ? "text-amber-700 bg-amber-50 border-amber-200" :
                              "text-emerald-700 bg-emerald-50 border-emerald-200"
                            )}>
                              {ship.status.replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <div className="font-semibold text-foreground">{ship.from}</div>
                              <div className="text-xs font-medium text-muted-foreground mt-0.5">{ship.date}</div>
                            </div>
                            <div className="flex-1 px-4 relative flex items-center justify-center">
                              <div className="w-full h-0.5 bg-muted rounded-full overflow-hidden">
                                <div className={cn("h-full bg-primary", `w-[${(ship.step / 5) * 100}%]`)}></div>
                              </div>
                              <ArrowRight className="absolute text-muted-foreground bg-white w-4 h-4 shrink-0 px-0.5" />
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-foreground">{ship.to}</div>
                              <div className="text-xs font-medium text-muted-foreground mt-0.5">ETA: {ship.eta}</div>
                            </div>
                          </div>
                       </div>

                       <div className="p-4 sm:p-6 sm:w-48 bg-muted/20 flex flex-col justify-center gap-2 border-l border-border/50">
                          <Link to={`/track/${ship.id}`}>
                            <Button className="w-full h-10 bg-white hover:bg-gray-50 text-foreground border border-border shadow-sm font-semibold rounded-xl text-sm justify-between">
                              Track <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                       </div>

                     </div>
                   </Card>
                 ))}
               </div>
            </div>

            {/* Sidebar Alerts & Transactions */}
            <div className="space-y-6">
               <Card className="p-6 bg-white border-border shadow-sm rounded-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                 <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-rose-500" /> Action Required</h3>
                 <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-sm">
                   <p className="font-semibold text-rose-800 mb-1">Weight Discrepancy (AWB4567812)</p>
                   <p className="text-rose-700/80 mb-3">Courier claims 2.5 kg. You declared 1.5 kg.</p>
                   <Button size="sm" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-9">Resolve Dispute</Button>
                 </div>
               </Card>

               <Card className="p-6 bg-white border-border shadow-sm rounded-2xl">
                 <h3 className="font-heading font-bold text-lg mb-4">Recent Transactions</h3>
                 <div className="space-y-4">
                   {[
                     { id: 1, type: "Booking #AWB123", amount: -67.85, date: "Today, 10:30 AM", status: "Success" },
                     { id: 2, type: "Wallet Recharge", amount: +2500, date: "Yesterday", status: "Success" },
                     { id: 3, type: "Booking #AWB987", amount: -125.00, date: "21st Oct", status: "Success" },
                   ].map(txn => (
                     <div key={txn.id} className="flex justify-between items-center text-sm py-2 border-b border-border/50 last:border-0 last:pb-0">
                       <div>
                         <div className="font-semibold text-foreground">{txn.type}</div>
                         <div className="text-xs text-muted-foreground mt-0.5">{txn.date}</div>
                       </div>
                       <div className="text-right">
                         <div className={cn("font-bold text-base", txn.amount > 0 ? "text-emerald-600" : "text-foreground")}>
                           {txn.amount > 0 ? "+" : ""}₹{Math.abs(txn.amount).toFixed(2)}
                         </div>
                       </div>
                     </div>
                   ))}
                  </div>
                  <Link to="/shipments" className="block mt-4">
                    <Button variant="ghost" className="w-full text-xs font-bold text-primary">View All History</Button>
                  </Link>
                </Card>
            </div>

          </div>

        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <Link to="/compare" className="md:hidden fixed bottom-6 right-6 z-50">
        <Button className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_10px_40px_rgba(255,87,34,0.4)] flex items-center justify-center">
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}
