import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  MapPin, 
  Truck, 
  Clock, 
  CreditCard, 
  User, 
  Phone, 
  ArrowLeft, 
  CheckCircle2, 
  FileText,
  AlertCircle,
  Activity,
  ChevronRight
} from "lucide-react";
import { getShipmentDetail } from "@/lib/api";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AnimatedTimeline } from "@/components/features/AnimatedTimeline";

export default function ShipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getShipmentDetail(id!);
      setShipment(data);
    } catch (err: any) {
      setError(err.message || "Shipment not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-5xl">
         <LoadingState message="Loading shipment details..." />
         <div className="mt-8 space-y-6 opacity-40">
           <Skeleton className="h-32 w-full rounded-3xl" />
           <div className="grid md:grid-cols-3 gap-6">
             <Skeleton className="h-96 md:col-span-2 rounded-3xl" />
             <Skeleton className="h-64 rounded-3xl" />
           </div>
         </div>
      </main>
    </div>
  );

  if (error || !shipment) return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <ErrorState message={error || "Order not found"} onRetry={fetchDetail} title="Detail Error" />
        <Button onClick={() => navigate('/dashboard')} variant="ghost" className="mt-4 font-bold text-muted-foreground">
          ← Back to Dashboard
        </Button>
      </main>
    </div>
  );

  const statusLabel = shipment.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate('/dashboard')} variant="outline" size="icon" className="w-10 h-10 rounded-xl bg-white border-border shadow-sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-heading font-extrabold text-foreground flex items-center gap-2 uppercase tracking-tight">
                  <Package className="w-6 h-6 text-primary" /> Order #{shipment.awb || shipment.id.slice(0,8)}
                </h1>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Booked on {new Date(shipment.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <Badge className={cn(
              "self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest",
              shipment.status === 'delivered' ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
              shipment.status === 'in_transit' ? "bg-blue-100 text-blue-700 border-blue-200" :
              "bg-orange-100 text-orange-700 border-orange-200"
            )}>
              {statusLabel}
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Left Col: Timeline & Addresses */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Timeline Section */}
              <AnimatedTimeline currentStatus={statusLabel} className="bg-white border-border shadow-sm rounded-3xl" />

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Pickup Card */}
                <Card className="p-6 bg-white border-border shadow-sm rounded-2xl">
                  <div className="flex items-center gap-2 mb-4 text-tertiary font-bold uppercase tracking-wider text-[10px]">
                    <div className="w-6 h-6 bg-tertiary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    Pickup
                  </div>
                  <h4 className="font-bold text-foreground text-lg mb-1">{shipment.pickup_address.name}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{shipment.pickup_address.address}</p>
                  <p className="text-xs font-bold text-foreground mt-2">{shipment.pickup_address.city}, {shipment.pickup_address.pincode}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 font-medium italic">
                    <Phone className="w-3 h-3" /> {shipment.pickup_address.phone}
                  </div>
                </Card>

                {/* Delivery Card */}
                <Card className="p-6 bg-white border-border shadow-sm rounded-2xl">
                  <div className="flex items-center gap-2 mb-4 text-primary font-bold uppercase tracking-wider text-[10px]">
                    <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    Delivery
                  </div>
                  <h4 className="font-bold text-foreground text-lg mb-1">{shipment.delivery_address.name}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{shipment.delivery_address.address}</p>
                  <p className="text-xs font-bold text-foreground mt-2">{shipment.delivery_address.city}, {shipment.delivery_address.pincode}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 font-medium italic">
                    <Phone className="w-3 h-3" /> {shipment.delivery_address.phone}
                  </div>
                </Card>
              </div>

              {/* Item Details */}
              <Card className="p-6 bg-white border-border shadow-sm rounded-2xl">
                 <h3 className="font-heading font-bold text-xl mb-6 flex items-center gap-2">
                   <FileText className="w-5 h-5 text-primary" /> Item Information
                 </h3>
                 <div className="grid sm:grid-cols-3 gap-8">
                   <div className="space-y-1">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">Item Content</p>
                     <p className="text-lg font-bold text-foreground">{shipment.content_type || "General Package"}</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">Weight & Vol</p>
                     <p className="text-lg font-bold text-foreground">{shipment.weight >= 1000 ? `${(shipment.weight/1000).toFixed(1)} kg` : `${shipment.weight} g`}</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">Insurance</p>
                     <p className="text-lg font-bold text-emerald-600">₹{shipment.insured_value || "0"} (Full Cover)</p>
                   </div>
                 </div>
              </Card>
            </div>

            {/* Right Col: Payment & Sidebar */}
            <div className="space-y-6">
              
              <Card className="p-6 bg-white border-border shadow-sm rounded-2xl">
                 <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                   <CreditCard className="w-5 h-5 text-primary" /> Payment Info
                 </h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Shipping Fee</span>
                      <span className="font-bold">₹{shipment.total_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Insurance Fee</span>
                      <span className="font-bold">₹0.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Tax (GST 18%)</span>
                      <span className="font-bold">₹{(shipment.total_price * 0.18).toFixed(2)}</span>
                    </div>
                    <div className="pt-4 border-t border-border/60 flex justify-between items-end">
                      <span className="text-xs font-bold uppercase text-muted-foreground italic mb-1">Total Paid</span>
                      <span className="text-2xl font-heading font-extrabold text-primary">₹{(shipment.total_price * 1.18).toFixed(2)}</span>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-2 border border-emerald-100">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                       <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Paid via Wallet</span>
                    </div>
                 </div>
              </Card>

              <Card className="p-6 bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 rounded-2xl group cursor-pointer overflow-hidden relative" onClick={() => navigate(`/track/${shipment.awb}`)}>
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-[20px] group-hover:scale-150 transition-transform"></div>
                 <div className="flex items-center justify-between relative z-10">
                   <div>
                     <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Live Tracking</p>
                     <h4 className="font-heading font-bold text-xl">TRACK LIVE</h4>
                   </div>
                   <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-all">
                      <Activity className="w-6 h-6 animate-pulse" />
                   </div>
                 </div>
              </Card>

              <div className="bg-white border border-border/80 rounded-2xl p-5">
                 <p className="text-sm font-bold text-foreground mb-4">Facing an issue?</p>
                 <div className="space-y-3">
                   <Button variant="outline" className="w-full justify-between font-bold text-xs h-10 border-border/60 rounded-xl">
                     Report Problem <ChevronRight className="w-4 h-4" />
                   </Button>
                   <Button variant="outline" className="w-full justify-between font-bold text-xs h-10 border-border/60 rounded-xl">
                     Request Invoice <ChevronRight className="w-4 h-4" />
                   </Button>
                 </div>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
