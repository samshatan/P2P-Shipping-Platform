import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Download, Plus, Eye, Package, AlertCircle, CheckCircle2, Navigation, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { MOCK_SHIPMENTS } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function ShipmentsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");

  // Filters
  const tabs = ["ALL", "IN TRANSIT", "EXCEPTIONS", "DELIVERED"];

  const filteredShipments = MOCK_SHIPMENTS.filter((ship) => {
    // Tab filter
    if (tab === "IN TRANSIT" && ship.status !== "In Transit" && ship.status !== "Out for Delivery") return false;
    if (tab === "EXCEPTIONS" && ship.status !== "Exception" && ship.status !== "Return Pending") return false;
    if (tab === "DELIVERED" && ship.status !== "Delivered") return false;

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      if (!ship.awb.toLowerCase().includes(q) && !ship.toCity.toLowerCase().includes(q) && !ship.fromCity.toLowerCase().includes(q) && !ship.courier.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleExportCSV = () => {
    showToast("CSV Exported successfully!", "success");
  };

  const getStatusIcon = (status: string) => {
    if (status === "Delivered") return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (status === "Exception" || status === "Return Pending") return <AlertCircle className="w-4 h-4 text-rose-500" />;
    return <Navigation className="w-4 h-4 text-blue-600" />;
  };

  const getStatusColor = (status: string) => {
    if (status === "Delivered") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "Exception" || status === "Return Pending") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-heading font-extrabold text-foreground">My Shipments</h1>
              <p className="text-muted-foreground mt-1 text-sm font-medium">Manage and track all your recent orders.</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button onClick={handleExportCSV} variant="outline" className="h-10 bg-white hover:bg-muted font-semibold rounded-lg shadow-sm border-border">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
              <Link to="/compare">
                <Button className="h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-sm">
                  <Plus className="w-4 h-4 mr-2" /> New Shipment
                </Button>
              </Link>
            </div>
          </div>

          <Card className="p-0 bg-white border-border shadow-sm rounded-2xl overflow-hidden">
            
            {/* Header / Filters row */}
            <div className="p-4 border-b border-border/60 flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/10">
              
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {tabs.map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "px-4 py-2 text-xs font-bold rounded-lg transition-colors uppercase tracking-wide",
                      tab === t ? "bg-foreground text-background" : "bg-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Search AWB or Location..." 
                  className="pl-9 h-10 bg-white rounded-lg" 
                />
              </div>

            </div>

            {/* List */}
            <div className="divide-y divide-border/60">
              {filteredShipments.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center text-muted-foreground">
                  <Package className="w-12 h-12 mb-4 opacity-50 text-slate-400" />
                  <p className="font-semibold text-foreground">No shipments found</p>
                  <p className="text-sm">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                filteredShipments.map((ship) => (
                  <div key={ship.awb} className="p-4 hover:bg-muted/30 transition-colors flex flex-col md:flex-row items-center justify-between gap-4 group">
                    
                    {/* Icon & AWB */}
                    <div className="flex items-center gap-4 w-full md:w-1/4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", getStatusColor(ship.status).replace("text-", "border-").replace("bg-", "bg-").replace("50", "100/50"))}>
                        {getStatusIcon(ship.status)}
                      </div>
                      <div>
                        <div className="font-mono font-bold text-foreground">{ship.awb}</div>
                        <div className="text-xs font-semibold text-muted-foreground pt-0.5">{new Date(ship.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex-1 w-full flex items-center gap-3 text-sm px-2">
                       <div className="font-semibold">{ship.fromCity}</div>
                       <ArrowRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                       <div className="font-semibold">{ship.toCity}</div>
                    </div>

                    {/* Status & Courier */}
                    <div className="w-full md:w-1/4 flex flex-col sm:flex-row md:flex-col lg:flex-row justify-between md:justify-center items-start lg:items-center gap-2 px-2">
                       <div className="text-xs font-bold text-muted-foreground uppercase">{ship.courier}</div>
                       <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5", getStatusColor(ship.status))}>
                         {ship.status}
                       </Badge>
                    </div>

                    {/* Amount & Actions */}
                    <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6 pl-2 mt-4 md:mt-0">
                       <div className="text-right border-r border-border/60 pr-6 mr-2 hidden sm:block">
                         <div className="font-bold text-foreground">₹{(ship.total_paise / 100).toFixed(2)}</div>
                         <div className="text-[10px] uppercase font-semibold text-muted-foreground">{ship.weight} • {ship.type}</div>
                       </div>
                       
                       <Button onClick={() => navigate(`/track/${ship.awb}`)} variant="outline" size="sm" className="h-10 w-10 p-0 rounded-lg group-hover:border-primary group-hover:text-primary transition-colors">
                         <Eye className="w-5 h-5" />
                       </Button>
                    </div>

                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-border/60 bg-muted/10 text-center text-xs font-semibold text-muted-foreground pt-4">
              Showing {filteredShipments.length} of {MOCK_SHIPMENTS.length} total shipments
            </div>

          </Card>
        </div>
      </main>

    </div>
  );
}
