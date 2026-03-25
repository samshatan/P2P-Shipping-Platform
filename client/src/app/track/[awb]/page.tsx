import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, MapPin, Truck, CheckCircle2, Map, Calendar, Phone, Activity, Search, Mail, MessageCircle, RefreshCw, AlertCircle, Package } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { getTracking } from "@/lib/api";

import { AnimatedTimeline } from "@/components/features/AnimatedTimeline";

export default function TrackingPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const awb = params.awb || "AWB123456789IN";

  const fetchTracking = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const data = await getTracking(awb);
      setTrackingData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid Tracking ID");
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [awb]);

  const handleCopy = () => {
    navigator.clipboard.writeText(awb);
    showToast("AWB Copied to clipboard!", "success");
  };

  const handleRefresh = async () => {
    await fetchTracking();
    showToast("Tracking status updated!", "success");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-4">
        <Navbar />
        <div className="flex flex-col items-center gap-4 bg-white p-10 rounded-3xl border border-border/60 shadow-sm">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Activity className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="text-xl font-heading font-bold text-foreground">Fetching tracking data...</div>
          <p className="text-muted-foreground text-sm font-medium">Connecting to courier servers</p>
        </div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 flex flex-col items-center max-w-md w-full text-center">
             <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-100">
                <AlertCircle className="w-10 h-10" />
             </div>
             <h1 className="font-heading font-bold text-2xl mb-2 text-foreground">Invalid AWB number</h1>
             <p className="text-muted-foreground mb-8 font-medium">{error || "Please check your AWB number and try again."}</p>
             <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full h-12 border-primary text-primary hover:bg-primary/5 rounded-xl font-bold transition-all active:scale-95">Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  const currentStatus = trackingData.current_status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  
  // Map API events to UI events
  const events = trackingData.events.map((ev: any, index: number) => {
    const isCompleted = new Date(ev.timestamp) < new Date();
    const isActive = index === 0; // Assuming newest event is first
    
    return {
      id: index,
      title: ev.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      location: ev.location,
      date: new Date(ev.timestamp).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      status: isCompleted ? "completed" : (isActive ? "active" : "upcoming"),
      past: isCompleted && !isActive
    };
  });
  
  // Format dates
  const officialEtaObj = new Date(trackingData.official_eta);
  const aiEtaObj = trackingData.ai_eta ? new Date(trackingData.ai_eta) : officialEtaObj;
  const etaFormatted = officialEtaObj.toLocaleString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          
          <div className="flex flex-col md:flex-row justify-between md:items-start mb-8 gap-6 border-b border-border/60 pb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground tracking-tight uppercase">
                    🚚 {currentStatus}
                  </h1>
                  <p className="text-lg text-primary font-bold mt-1">Expected {etaFormatted}</p>
                </div>
              </div>
            </div>

             <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
                <Button onClick={handleCopy} variant="outline" className="h-10 px-4 bg-white border-border/80 text-foreground font-semibold hover:bg-muted/50 rounded-xl shadow-sm transition-all hover:-translate-y-0.5">
                  📋 Copy AWB
                </Button>
                <Button onClick={() => window.open('tel:18001234567')} variant="outline" className="h-10 px-4 bg-white border-border/80 text-foreground font-semibold hover:bg-muted/50 rounded-xl shadow-sm transition-all hover:-translate-y-0.5">
                  📞 Contact Support
                </Button>
                <Button onClick={handleRefresh} variant="outline" className="h-10 px-4 bg-foreground text-white border-foreground font-semibold hover:bg-foreground/90 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 group">
                  <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} /> 🔁 Refresh Status
                </Button>
             </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Left: Timeline */}
            <div className="md:col-span-2 space-y-6">
               
               {/* Live Location Block */}
               <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-5 flex items-start gap-4 shadow-sm animate-in fade-in duration-500">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">📍 Current Location</p>
                     <h3 className="font-heading font-bold text-lg text-blue-950 mb-0.5">{trackingData.current_location}</h3>
                     <p className="text-sm font-medium text-blue-700/70">Last updated: {events[0]?.date.split(",")[1] || "Just now"}</p>
                  </div>
               </div>

               <AnimatedTimeline currentStatus={currentStatus} className="bg-white border-border shadow-sm rounded-3xl mb-0 transition-all" />
               
               <Card className="bg-white border-border shadow-sm rounded-3xl p-6 sm:p-10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-[60px]"></div>
                 
                 <h2 className="font-heading font-bold text-xl mb-8 flex items-center gap-2 relative z-10">
                   <Activity className="w-5 h-5 text-primary" /> Live Status
                 </h2>

                 <div className="relative z-10 pl-4 sm:pl-8">
                   {/* Continuous Line */}
                   <div className="absolute left-[31px] sm:left-[47px] top-6 bottom-16 w-0.5 bg-muted"></div>
                   <div className="absolute left-[31px] sm:left-[47px] top-6 h-1/2 w-0.5 bg-primary"></div>

                   <div className="space-y-8">
                     {events.map((ev, i) => (
                       <div key={ev.id} className="relative flex items-start gap-6">
                         <div className={cn(
                           "w-8 h-8 rounded-full border-4 flex items-center justify-center shrink-0 mt-1 shadow-sm relative z-10",
                           ev.status === "completed" ? "bg-primary border-primary/20 text-white" :
                           ev.status === "active" ? "bg-white border-primary border-[3px]" :
                           "bg-white border-muted"
                         )}>
                           {ev.status === "completed" && <CheckCircle2 className="w-4 h-4 text-white" />}
                           {ev.status === "active" && <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />}
                         </div>

                         <div className="flex-1 pb-2">
                           <div className="flex justify-between items-start gap-4">
                             <div>
                               <h3 className={cn("font-bold text-lg mb-1", ev.past || ev.status === "active" ? "text-foreground" : "text-muted-foreground")}>{ev.title}</h3>
                               <p className="text-sm font-medium text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ev.location}</p>
                             </div>
                             <div className="text-right whitespace-nowrap">
                               <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{ev.date.split(",")[0]}</div>
                               <div className="text-sm font-semibold text-foreground">{ev.date.split(",")[1]}</div>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </Card>
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-6">
              
              <Card className="bg-white border-border shadow-sm rounded-2xl p-6">
                <h3 className="font-heading font-bold text-lg mb-4">Delivery Details</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-sm font-medium text-muted-foreground">Courier</span>
                    <span className="text-sm font-bold text-foreground">{trackingData.courier}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-sm font-medium text-muted-foreground">AWB</span>
                    <span className="text-sm font-bold text-foreground font-mono">{trackingData.awb}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-sm font-medium text-muted-foreground">Pickup Date</span>
                    <span className="text-sm font-bold text-foreground">{events[events.length - 1]?.date.split(",")[0] || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-muted-foreground">Estimated Delivery</span>
                    <span className="text-sm font-bold text-primary">{etaFormatted}</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-tr from-emerald-50 to-emerald-100/50 border-emerald-200 shadow-sm rounded-2xl p-6">
                <h3 className="font-heading font-bold text-lg mb-2 text-emerald-900 border-b border-emerald-200/50 pb-2">AI Delivery Insight</h3>
                <div className="flex items-start gap-3 mt-4">
                   <Calendar className="w-5 h-5 text-emerald-600 mt-0.5" />
                   <div>
                     <p className="text-sm font-semibold text-emerald-800">Delivery expected on {aiEtaObj.toLocaleString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                     <p className="text-xs text-emerald-700 mt-1">Based on AI prediction from {trackingData.courier} historical shipments.</p>
                   </div>
                </div>
              </Card>

              <div className="bg-white border border-border/80 rounded-2xl p-4 text-center">
                 <p className="text-sm font-semibold text-muted-foreground mb-3">Facing an issue?</p>
                 <div className="flex gap-2">
                   <Button onClick={() => window.open('tel:18001234567')} variant="outline" className="flex-1 text-foreground hover:bg-muted font-bold h-10 border-border/80 shadow-sm px-0">
                     <Phone className="w-4 h-4 mr-1.5" /> Call
                   </Button>
                   <Button onClick={() => window.open('mailto:support@parcel.in')} variant="outline" className="flex-1 text-foreground hover:bg-muted font-bold h-10 border-border/80 shadow-sm px-0">
                     <Mail className="w-4 h-4 mr-1.5" /> Raise Issue
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
