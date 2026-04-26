import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Truck, HelpCircle, 
  Loader2, Lock, ShieldCheck, ArrowLeft,
  ArrowRight, Zap, Database,
  Activity, Globe, Navigation,
  CheckCircle, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/context/BookingContext";
import { useToast } from "@/context/ToastContext";
import { BookingStepper } from "@/components/features/BookingStepper";
import { motion, AnimatePresence } from "framer-motion";

/**
 * BE3 — Day 11: Updated Review Page
 * Removed Wallet, Payment, and Evidence Vault logic.
 * Simplified to a "Review & Confirm" flow for order placement.
 */
export default function ReviewAndPay() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { selectedCourier, pickup, delivery, packageDetails, setLastAwb, resetBooking } = useBooking();
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!selectedCourier) {
      navigate('/book/courier');
    }
  }, [selectedCourier, navigate]);

  const baseShipping = selectedCourier?.price || 45.00;
  const fuelSurcharge = selectedCourier ? (selectedCourier.price * 0.1) : 12.50;
  const subtotal = baseShipping + fuelSurcharge;
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const handleConfirm = () => {
    setIsProcessing(true);
    const mockAwb = 'SR' + Math.random().toString(36).substring(2, 10).toUpperCase() + 'X';
    setTimeout(() => {
      showToast("Order Placed Successfully!", "success");
      setLastAwb(mockAwb);
      resetBooking();
      navigate(`/book/confirmed/${mockAwb}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 pb-32">
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-10">
        
        {/* MISSION HEADER */}
        <div className="mb-12 border-b border-border/10 pb-12">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                 <FileText className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Final Review 3.0</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-heading font-black text-foreground tracking-tighter uppercase italic">
             MISSION <span className="text-primary not-italic">COMMIT</span>
           </h1>
           <p className="text-muted-foreground font-medium text-lg mt-2 max-w-2xl">Final review of transmission protocols before node initialization.</p>
        </div>

        <BookingStepper />

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12">
          
          {/* Left: Manifest & Protocol (8 Cols) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* SHIPMENT MANIFEST */}
            <Card className="p-10 bg-card border-none rounded-[3.5rem] shadow-2xl ring-1 ring-border/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                 <Globe className="w-48 h-48" />
              </div>

              <div className="flex justify-between items-center mb-10 pb-8 border-b border-border/10">
                <div>
                  <h3 className="font-heading font-black text-3xl text-foreground uppercase tracking-tighter italic">FLIGHT <span className="text-primary not-italic">MANIFEST</span></h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">Routing & Logistics Verification</p>
                </div>
                <Link to="/book/address">
                  <Button variant="ghost" className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] border border-border/20 hover:bg-primary/5 hover:text-primary transition-all">Edit Parameters</Button>
                </Link>
              </div>

              <div className="space-y-12 relative">
                 <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-primary via-muted to-blue-500 opacity-20 hidden sm:block" />
                 
                 <div className="flex gap-8 items-start relative z-10">
                   <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-lg">
                     <MapPin className="w-7 h-7 text-primary" />
                   </div>
                   <div className="grow">
                     <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 font-mono">NODE_ORIGIN: {pickup?.pincode}</div>
                     <div className="font-black text-foreground text-2xl uppercase italic tracking-tight">{pickup?.name}</div>
                     <div className="text-sm text-muted-foreground font-medium mt-1 leading-relaxed italic opacity-60 max-w-lg">{pickup?.address}, {pickup?.pincode}</div>
                   </div>
                 </div>

                 <div className="flex gap-8 items-start relative z-10">
                   <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-lg">
                     <Navigation className="w-7 h-7 text-blue-500" />
                   </div>
                   <div className="grow">
                     <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 font-mono">NODE_DESTINATION: {delivery?.pincode}</div>
                     <div className="font-black text-foreground text-2xl uppercase italic tracking-tight">{delivery?.name}</div>
                     <div className="text-sm text-muted-foreground font-medium mt-1 leading-relaxed italic opacity-60 max-w-lg">{delivery?.address}, {delivery?.pincode}</div>
                   </div>
                 </div>
                 
                 <div className="flex gap-8 items-start pt-10 border-t border-border/10">
                   <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0 border border-border/20">
                     <Truck className="w-7 h-7 text-muted-foreground" />
                   </div>
                   <div className="w-full">
                     <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4">SELECTED_LOGISTICS_PROVIDER</div>
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted/20 p-8 rounded-[2.5rem] border border-border/10 group-hover:border-primary/20 transition-all gap-6">
                       <div className="flex items-center gap-6">
                           <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-border/10 shadow-sm">
                              <Database className="w-6 h-6 text-primary" />
                           </div>
                           <div>
                             <div className="font-black text-foreground text-xl uppercase italic">{selectedCourier?.name || "Global Transit"}</div>
                             <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Asset Mass: {packageDetails?.weight} KG • SLA Target: {selectedCourier?.etaDays || "3-5"} Days</div>
                           </div>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>
            </Card>

            <Card className="p-10 bg-emerald-500/[0.03] border-none rounded-[3rem] ring-1 ring-emerald-500/20 flex items-center gap-8 shadow-2xl relative overflow-hidden group">
               <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                 <ShieldCheck className="w-9 h-9" />
               </div>
               <div>
                 <h4 className="font-heading font-black text-2xl text-foreground uppercase tracking-tighter italic">PROTOCOL <span className="text-emerald-500 not-italic">VERIFIED</span></h4>
                 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 italic">Order details cross-checked with courier database.</p>
               </div>
            </Card>
          </div>

          {/* Right Sidebar: CONTRACT TOTAL (4 Cols) */}
          <div className="lg:col-span-4 space-y-12">
            
            <Card className="p-10 bg-card border-none rounded-[3.5rem] shadow-2xl ring-1 ring-border/5 relative overflow-hidden sticky top-28">
              <h3 className="font-heading font-black text-3xl mb-12 uppercase tracking-tighter italic">LEDGER <span className="text-primary not-italic">TOTAL</span></h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-muted/20 p-5 rounded-2xl border border-border/5">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic opacity-60">BASE_FREIGHT</span>
                  <span className="font-black text-foreground text-lg italic">₹{baseShipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-muted/20 p-5 rounded-2xl border border-border/5">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic opacity-60 flex items-center gap-2">FUEL_SURCHARGE</span>
                  <span className="font-black text-foreground text-lg italic">₹{fuelSurcharge.toFixed(2)}</span>
                </div>
              </div>

              <div className="my-10 border-t border-dashed border-border/20 pt-10 space-y-6">
                <div className="flex justify-between items-center bg-muted/40 p-6 rounded-3xl border border-border/10">
                  <span className="text-foreground font-black uppercase tracking-[0.2em] text-[11px] italic">SUBTOTAL_PROTOCOL</span>
                  <span className="font-heading font-black text-foreground text-2xl italic">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center px-6">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic opacity-40">TAX (GST 18%)</span>
                  <span className="font-black text-foreground text-lg italic">₹{gst.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-10 p-10 bg-primary/5 rounded-[3.5rem] border border-primary/10 text-center relative overflow-hidden group/total shadow-2xl ring-1 ring-primary/20">
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 relative z-10 italic">TOTAL ORDER VALUE</div>
                <div className="text-5xl font-heading font-black text-foreground relative z-10 tracking-tighter italic">₹{total.toFixed(2)}</div>
              </div>

              <Button 
                onClick={handleConfirm} 
                disabled={isProcessing} 
                className="w-full h-24 bg-primary text-white hover:bg-primary/95 disabled:opacity-50 font-black rounded-[2.5rem] text-2xl shadow-[0_25px_60px_rgba(255,87,34,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-6 uppercase italic tracking-tighter border-none"
              >
                {isProcessing ? (
                   <><Loader2 className="w-10 h-10 animate-spin" /> COMMITTING...</>
                ) : (
                   <><CheckCircle className="w-8 h-8 opacity-60" /> CONFIRM & BOOK</>
                )}
              </Button>
            </Card>

            <div className="text-center px-10">
               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-30 italic leading-loose text-center">
                 By clicking confirm, you agree to the courier's terms of service and shipping policies.
               </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
