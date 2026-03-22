import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, MapPin, Truck, CheckCircle2, Map, Calendar, Phone, Activity, Search, Mail, MessageCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function TrackingPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [trackInput, setTrackInput] = useState("");
  const awb = params.awb || "AWB123456789IN";

  const handleCopy = () => {
    navigator.clipboard.writeText(awb);
    showToast("AWB Copied to clipboard!", "success");
  };

  const events = [
    { id: 1, title: "Order Booked", location: "Kolkata Hub", date: "24 Oct, 10:30 AM", status: "completed", past: true },
    { id: 2, title: "Picked Up by Courier", location: "Mumbai", date: "24 Oct, 02:45 PM", status: "completed", past: true },
    { id: 3, title: "In Transit", location: "Mumbai Hub", date: "25 Oct, 06:10 AM", status: "active", past: false },
    { id: 4, title: "Out for Delivery", location: "Delhi Delivery Center", date: "Pending", status: "upcoming", past: false },
    { id: 5, title: "Delivered", location: "Delhi", date: "Pending", status: "upcoming", past: false },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">{awb}</h1>
                <Button onClick={handleCopy} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Copy className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2 ml-4">
                   <Input value={trackInput} onChange={e => setTrackInput(e.target.value.toUpperCase())} placeholder="Track another AWB" className="h-9 text-sm w-48 bg-white" />
                   <Button onClick={() => trackInput && navigate(`/track/${trackInput}`)} size="sm" className="h-9 px-3 bg-foreground">
                      <Search className="w-4 h-4" />
                   </Button>
                   <Button onClick={() => window.open(`https://wa.me/?text=Track%20my%20parcel%3A%20https%3A%2F%2Fparcel.in%2Ftrack%2F${awb}`, '_blank')} size="sm" className="h-9 bg-[#25D366] hover:bg-[#128C7E] text-white p-2">
                      <MessageCircle className="w-4 h-4" />
                   </Button>
                </div>
              </div>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                Shipped via <Badge variant="outline" className="font-bold border-border bg-white text-[10px] uppercase">Delhivery</Badge>
              </p>
            </div>

             <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 px-4 py-1.5 text-sm uppercase tracking-wider font-extrabold shadow-sm w-fit self-start sm:self-auto">
                IN TRANSIT
             </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Left: Timeline */}
            <div className="md:col-span-2 space-y-6">
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
                <h3 className="font-heading font-bold text-lg mb-4">Journey Summary</h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Map className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">From</div>
                      <div className="font-semibold text-foreground">Mumbai (400001)</div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">Rahul S.</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">To</div>
                      <div className="font-semibold text-foreground">New Delhi (110001)</div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">Jane D.</div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-tr from-emerald-50 to-emerald-100/50 border-emerald-200 shadow-sm rounded-2xl p-6">
                <h3 className="font-heading font-bold text-lg mb-2 text-emerald-900 border-b border-emerald-200/50 pb-2">AI Delivery Insight</h3>
                <div className="flex items-start gap-3 mt-4">
                   <Calendar className="w-5 h-5 text-emerald-600 mt-0.5" />
                   <div>
                     <p className="text-sm font-semibold text-emerald-800">Delivery expected on Sat, 26th Oct</p>
                     <p className="text-xs text-emerald-700 mt-1">100% on-time performance for this route by Delhivery this week.</p>
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
