import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, IndianRupee, ExternalLink, Filter, Plus, FileText, RefreshCw, AlertCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getDashboardData } from "@/lib/api";

function getStatusColor(status: string) {
  switch (status) {
    case "Delivered": return "bg-green-100 text-green-700 border-green-200";
    case "In Transit": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Out for Delivery": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Failed": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export default function UserDashboard() {
  const [filter, setFilter] = useState("All");
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardData(1, 50, filter);
      
      const mappedShipments = (data.shipments || []).map((s: any) => {
        const formatStatus = (st: string) => {
          if (st === "cancelled") return "Failed";
          return st.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        };

        return {
          id: s.awb_number || s.shipment_id,
          courier: s.courier_name || s.courier_id,
          status: formatStatus(s.status),
          price: s.total_paise / 100,
          date: new Date(s.created_at || new Date()).toLocaleString('en-US', { day: '2-digit', month: 'short' })
        };
      });
      
      setShipments(mappedShipments);
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filter]);

  const filteredShipments = shipments;

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-heading font-extrabold text-foreground">👋 Welcome back, User</h1>
              <p className="text-muted-foreground mt-1 text-sm font-medium">Here’s your shipment overview</p>
            </div>

            <div className="flex items-center w-full md:w-auto">
              <Link to="/compare" className="w-full md:w-auto">
                <Button className="h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-sm w-full md:w-auto px-6">
                  <Plus className="w-4 h-4 mr-2" /> Book Parcel
                </Button>
              </Link>
            </div>
          </div>

          {/* STATS CARDS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-white border-border shadow-sm rounded-2xl flex flex-col justify-between group hover:border-slate-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-heading font-extrabold text-foreground">24</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mt-1">Total Shipments</div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-border shadow-sm rounded-2xl flex flex-col justify-between group hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5" />
             </div>
              </div>
              <div>
                <div className="text-3xl font-heading font-extrabold text-foreground">5</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mt-1">In Transit</div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-border shadow-sm rounded-2xl flex flex-col justify-between group hover:border-green-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-heading font-extrabold text-foreground">18</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mt-1">Delivered</div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-border shadow-sm rounded-2xl flex flex-col justify-between group hover:border-emerald-300 transition-colors">
               <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-heading font-extrabold text-emerald-600">₹540</div>
                <div className="text-sm font-bold text-emerald-700/80 uppercase tracking-wider mt-1">Total Savings</div>
              </div>
            </Card>
          </div>

          {/* MAIN SECTION: SHIPMENT LIST */}
          <Card className="bg-white shadow-sm border-border rounded-2xl overflow-hidden flex flex-col">
             
             {/* Header & Filters */}
             <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20">
                <h2 className="font-heading font-bold text-xl flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Active & Past Shipments</h2>
                
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                  {["All", "Delivered", "In Transit", "Failed"].map((f) => (
                    <Button
                      key={f}
                      onClick={() => setFilter(f)}
                      variant={filter === f ? "default" : "outline"}
                      className={cn(
                        "rounded-xl font-bold px-4 h-9 whitespace-nowrap shadow-sm",
                        filter === f ? "bg-foreground text-white" : "bg-white text-muted-foreground border-border/60 hover:text-foreground"
                      )}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
             </div>

             {/* Shipment Table/List */}
             <div className="flex-1 w-full overflow-x-auto relative">
               {loading && shipments.length === 0 ? (
                 <div className="divide-y divide-border/60">
                   {[1,2,3,4,5].map(i => (
                     <div key={i} className="px-6 py-5 flex items-center justify-between animate-pulse">
                        <div className="h-4 bg-muted rounded w-24" />
                        <div className="h-4 bg-muted rounded w-32" />
                        <div className="h-6 bg-muted rounded-full w-20" />
                        <div className="h-4 bg-muted rounded w-16" />
                        <div className="h-8 bg-muted rounded-lg w-20" />
                     </div>
                   ))}
                 </div>
               ) : null}
               
               {error ? (
                 <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                   <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100">
                     <AlertCircle className="w-8 h-8" />
                   </div>
                   <h3 className="font-heading font-bold text-xl text-foreground mb-2">{error}</h3>
                   <Button onClick={fetchDashboard} variant="outline" className="mt-4 border-primary text-primary hover:bg-primary/5 font-bold px-6 py-2 rounded-xl">
                      <RefreshCw className="w-4 h-4 mr-2" /> Retry
                   </Button>
                 </div>
               ) : shipments.length > 0 ? (
                 <table className="w-full text-left min-w-[700px]">
                   <thead className="bg-muted/30 border-b border-border/80">
                     <tr>
                       <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest w-[120px]">AWB</th>
                       <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest w-[150px]">Courier</th>
                       <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest w-[180px]">Status</th>
                       <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest w-[120px]">Price & Date</th>
                       <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border/60">
                     {filteredShipments.map((ship) => (
                       <tr key={ship.id} className="hover:bg-muted/10 transition-colors group">
                         <td className="px-6 py-5">
                             <div className="font-mono font-bold text-foreground text-sm tracking-tight">{ship.id}</div>
                         </td>
                         <td className="px-6 py-5">
                             <div className="font-semibold text-foreground text-sm">{ship.courier}</div>
                         </td>
                         <td className="px-6 py-5">
                             <Badge variant="outline" className={cn("uppercase text-xs tracking-wider font-extrabold shadow-sm px-2.5 py-1 w-fit", getStatusColor(ship.status))}>
                               {ship.status}
                             </Badge>
                         </td>
                         <td className="px-6 py-5">
                             <div className="font-bold text-foreground">₹{ship.price}</div>
                             <div className="text-[11px] font-semibold text-muted-foreground uppercase mt-0.5">{ship.date}</div>
                         </td>
                         <td className="px-6 py-5 text-right">
                             <div className="flex justify-end items-center gap-2">
                               <Button variant="ghost" size="sm" className="h-8 text-xs font-bold">View Details</Button>
                               <Link to={`/track/${ship.id}`}>
                                 <Button size="sm" className="h-8 text-xs font-bold bg-white text-foreground border border-border/80 hover:bg-muted/50 rounded-lg shadow-sm">
                                   Track <ExternalLink className="w-3 h-3 ml-1.5" />
                                 </Button>
                               </Link>
                             </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               ) : (
                 <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                   <div className="w-20 h-20 bg-muted/50 text-muted-foreground rounded-full flex items-center justify-center mb-6 border border-border">
                     <Search className="w-10 h-10 opacity-50" />
                   </div>
                   <h3 className="font-heading font-bold text-2xl text-foreground mb-2">No shipments found</h3>
                   <p className="text-muted-foreground mb-6 max-w-sm">You haven't booked any parcels {filter !== "All" && `that are ${filter.toLowerCase()}`} yet.</p>
                   {filter === "All" ? (
                     <Link to="/compare">
                       <Button className="h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8 shadow-sm transition-transform active:scale-95">
                         Book your first parcel
                       </Button>
                     </Link>
                   ) : (
                     <Button variant="outline" onClick={() => setFilter("All")} className="h-12 px-8 rounded-xl font-bold">
                       Clear Filters
                     </Button>
                   )}
                 </div>
               )}
             </div>

          </Card>

        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <Link to="/compare" className="md:hidden fixed bottom-6 right-6 z-50">
        <Button className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_10px_40px_rgba(255,87,34,0.4)] flex items-center justify-center active:scale-90 transition-transform">
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}
