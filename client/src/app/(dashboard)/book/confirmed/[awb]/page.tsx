import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Copy, MapPin, HelpCircle, FileText, Download, Share2, ShieldCheck, Calendar, Package, MessageCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/Toast";

export default function ConfirmedPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const awb = params.awb || "AWB1234567890IN";

  const handleCopy = () => {
    navigator.clipboard.writeText(awb);
    showToast("AWB Copied to clipboard!", "success");
  };

  const handleShare = () => {
    window.open(`https://wa.me/?text=Track%20my%20parcel%3A%20https%3A%2F%2Fparcel.in%2Ftrack%2F${awb}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] pt-32 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        
        {/* Success Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-in zoom-in-50 duration-500">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="font-heading font-extrabold text-4xl text-foreground mb-3">Shipment Booked Successfully!</h1>
          <p className="text-lg text-muted-foreground font-medium max-w-lg">
            Your parcel is confirmed. A pickup partner from Delhivery will arrive during the scheduled slot.
          </p>
        </div>

        {/* Main Ticket */}
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-border/60 overflow-hidden relative">
          
          {/* Top Banner section */}
          <div className="bg-gradient-to-r from-secondary to-slate-800 p-8 text-white relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10">
              <div className="text-sm font-semibold text-white/60 tracking-wider uppercase mb-1">Tracking Number (AWB)</div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-3xl md:text-4xl font-bold tracking-tight">{awb}</span>
                <button onClick={handleCopy} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer" title="Copy AWB">
                  <Copy className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="relative z-10 flex gap-3 w-full md:w-auto">
              <Link to={`/track/${awb}`} className="w-full md:w-auto">
                <Button className="w-full bg-white text-secondary hover:bg-white/90 font-bold rounded-xl h-12 shadow-lg">
                  Track Live
                </Button>
              </Link>
              <Button variant="outline" className="w-12 px-0 bg-transparent border-white/20 hover:bg-white/10 text-white rounded-xl h-12">
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/60">
            
            {/* Left Col - Routes */}
            <div className="p-8 md:col-span-2 space-y-8">
               <div className="relative">
                 <div className="absolute left-[11px] top-6 bottom-6 border-l-2 border-dashed border-border" />
                 
                 <div className="flex gap-4 relative mb-6">
                   <div className="w-6 h-6 rounded-full bg-white border-4 border-tertiary flex items-center justify-center shrink-0 mt-0.5 shadow-sm z-10" />
                   <div>
                     <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Pickup From</div>
                     <div className="font-semibold text-lg text-foreground mb-1">Rahul Sharma</div>
                     <div className="text-sm text-muted-foreground">Flat 4B, Hill View Apartments, Linking Road<br/>Mumbai 400001, Maharashtra</div>
                   </div>
                 </div>

                 <div className="flex gap-4 relative">
                   <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5 shadow-sm z-10">
                     <MapPin className="w-3 h-3 text-white" />
                   </div>
                   <div>
                     <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Deliver To</div>
                     <div className="font-semibold text-lg text-foreground mb-1">Jane Doe</div>
                     <div className="text-sm text-muted-foreground">Building 7, Cyber City, Phase 2<br/>New Delhi 110001, Delhi</div>
                   </div>
                 </div>
               </div>

               {/* Evidence vault chip */}
               <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 inline-flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-emerald-600" />
                 <span className="text-sm font-semibold text-emerald-800">Evidence Vault Protected</span>
               </div>
            </div>

            {/* Right Col - Details */}
            <div className="p-8 bg-muted/20 space-y-6">
              
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
                  <Calendar className="w-4 h-4" /> Pickup Scheduled
                </div>
                <div className="font-semibold text-foreground">Today, 24th Oct</div>
                <div className="text-sm text-muted-foreground">2:00 PM – 6:00 PM</div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-tertiary font-bold text-xs uppercase tracking-wider mb-2">
                  <Package className="w-4 h-4" /> Expected Delivery
                </div>
                <div className="font-semibold text-foreground">Sun, 27th Oct</div>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] px-1.5 py-0 border-0">AI PREDICTED</Badge>
                  <span className="text-xs font-semibold text-muted-foreground">Sat, 26th Oct</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/60">
                <div className="text-sm font-medium text-muted-foreground mb-1">Amount Paid</div>
                <div className="font-heading font-extrabold text-2xl text-foreground mb-1">₹67.85</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid via UPI</div>
              </div>

            </div>
          </div>

          <div className="bg-white border-t border-border/60 p-4 px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
               Notifications sent to: <strong className="text-foreground">98765 43210</strong> (SMS & WhatsApp)
             </div>
             
             <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                   <Input readOnly value={`https://parcel.in/track/${awb}`} className="h-10 pr-20 bg-muted/50 text-xs font-mono" />
                   <Button onClick={handleCopy} variant="ghost" className="absolute right-0 top-0 h-10 text-xs font-bold text-primary hover:bg-transparent hover:text-primary/80">Copy Link</Button>
                </div>
                <Button onClick={handleShare} className="h-10 w-10 p-0 rounded-lg bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm shrink-0">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </Button>
             </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/compare">
             <Button variant="outline" className="font-semibold h-12 px-8 rounded-xl border-border/80 text-foreground shadow-sm bg-white hover:bg-muted/50">
               Book Another Parcel
             </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
