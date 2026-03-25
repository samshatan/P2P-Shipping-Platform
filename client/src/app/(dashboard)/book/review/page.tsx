import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Truck, CheckCircle2, ShieldCheck, Tag, CreditCard, HelpCircle, Wallet, ArrowRight, Lock, Loader2 } from "lucide-react";
import { SavingsBanner } from "@/components/features/SavingsBanner";
import { useToast } from "@/context/ToastContext";
import { useBooking } from "@/context/BookingContext";

export default function ReviewAndPay() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { selectedCourier, pickup, delivery, packageDetails, setLastAwb, resetBooking } = useBooking();
  
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [walletApplied, setWalletApplied] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<false | "applied" | "invalid">(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!selectedCourier) {
      navigate('/book/courier');
    }
  }, [selectedCourier, navigate]);

  const baseShipping = selectedCourier?.price || 45.00;
  const fuelSurcharge = selectedCourier ? (selectedCourier.price * 0.1) : 12.50; // Dynamic surcharge if courier is selected
  const subtotal = baseShipping + fuelSurcharge;
  const gst = subtotal * 0.18;
  const total = subtotal + gst;
  
  const discountAmount = promoStatus === "applied" ? total * 0.10 : 0;
  const walletDeduction = walletApplied ? Math.min(20, total - discountAmount) : 0; // Use ₹20 from wallet
  const finalTotal = Math.max(0, total - discountAmount - walletDeduction);

  const handleApplyPromo = () => {
    if (promoInput === "PARCEL10") {
      setPromoStatus("applied");
      showToast("Discount Applied: 10% Off!", "success");
    } else {
      setPromoStatus("invalid");
      showToast("Invalid Promo Code", "error");
      setTimeout(() => setPromoStatus(false), 2000);
    }
  };

  const handlePay = () => {
    setIsProcessing(true);
    const mockAwb = 'AWB' + Math.random().toString(36).substring(2, 11).toUpperCase() + 'IN';
    setTimeout(() => {
      showToast("Payment Successful!", "success");
      setLastAwb(mockAwb);
      resetBooking();
      navigate(`/book/confirmed/${mockAwb}`);
    }, 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
      
      {/* Left: Summary & Payment Options */}
      <div className="flex-1 space-y-8">
        
        {/* Shipment Summary */}
        <Card className="p-6 bg-white border-border rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/50">
            <h3 className="font-heading font-bold text-xl text-foreground">Shipment Summary</h3>
            <Link to="/book/address" className="text-primary text-sm font-semibold hover:underline">Edit</Link>
          </div>

          <div className="space-y-6">
             <div className="flex gap-4 items-start">
               <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center shrink-0 mt-1">
                 <MapPin className="w-4 h-4 text-tertiary" />
               </div>
               <div>
                 <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Pickup From</div>
                 <div className="font-semibold text-foreground">{pickup.name} • {pickup.phone}</div>
                 <div className="text-sm text-muted-foreground mt-0.5">{pickup.address}, {pickup.pincode}</div>
               </div>
             </div>

             <div className="flex gap-4 items-start pt-4 border-t border-dashed border-border/60">
               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                 <MapPin className="w-4 h-4 text-primary" />
               </div>
               <div>
                 <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Deliver To</div>
                 <div className="font-semibold text-foreground">{delivery.name} • {delivery.phone}</div>
                 <div className="text-sm text-muted-foreground mt-0.5">{delivery.address}, {delivery.pincode}</div>
               </div>
             </div>
             
             <div className="flex gap-4 items-start pt-4 border-t border-dashed border-border/60">
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-1">
                 <Truck className="w-4 h-4 text-slate-600" />
               </div>
               <div className="w-full">
                 <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex justify-between">
                   <span>Courier details</span>
                   <Link to="/book/courier" className="text-primary hover:underline normal-case tracking-normal">Change</Link>
                 </div>
                 <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl mt-2 border border-border/50">
                   <div className="font-semibold text-foreground">{selectedCourier?.name || 'Standard Courier'}</div>
                   <div className="text-sm font-medium text-muted-foreground">{packageDetails.weight} kg • ETA: {selectedCourier?.etaDays || '3'} Days</div>
                 </div>
               </div>
             </div>
          </div>
        </Card>

        {/* Evidence Vault Status */}
        <Card className="p-4 bg-emerald-50 border-emerald-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <div>
               <h4 className="font-bold text-emerald-800">Evidence Vault Active</h4>
               <p className="text-xs text-emerald-600/80 font-medium">Packing proof verified via SHA-256 hash.</p>
             </div>
          </div>
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm border-0">PROTECTED</Badge>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6 bg-white border-border rounded-2xl shadow-sm">
          <h3 className="font-heading font-bold text-xl text-foreground mb-6">Payment Method</h3>
          
          <div className="space-y-3">
            <button 
              onClick={() => setPaymentMethod('wallet')}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${walletApplied ? 'border-primary' : 'border-muted-foreground'}`}>
                  {walletApplied && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <Wallet className="w-5 h-5 text-foreground" />
                <span className="font-semibold text-foreground">PARCEL Wallet</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-foreground">₹2,450.00</div>
                <div className="text-xs text-primary font-semibold hover:underline" onClick={(e) => { e.stopPropagation(); setWalletApplied(!walletApplied); }}>
                  {walletApplied ? "Remove" : "Apply ₹20"}
                </div>
              </div>
            </button>

            <button 
              onClick={() => setPaymentMethod('upi')}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-primary' : 'border-muted-foreground'}`}>
                  {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <span className="font-semibold text-foreground">UPI (GPay, PhonePe, Paytm)</span>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center font-bold text-[8px] text-gray-500">GPay</div>
                <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center font-bold text-[8px] text-purple-600" style={{lineHeight: 1}}>Phone<br/>Pe</div>
              </div>
            </button>

            {paymentMethod === 'upi' && (
              <div className="pl-12 pr-4 pb-4 animate-in slide-in-from-top-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Enter UPI ID</label>
                <div className="flex gap-2">
                  <Input placeholder="example@okhdfcbank" className="h-12 bg-white flex-1" />
                  <Button variant="secondary" className="h-12 font-semibold">Verify</Button>
                </div>
              </div>
            )}

            <button 
              onClick={() => setPaymentMethod('card')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-primary' : 'border-muted-foreground'}`}>
                {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <CreditCard className="w-5 h-5 text-foreground" />
              <span className="font-semibold text-foreground">Credit / Debit Card</span>
            </button>
          </div>
        </Card>

      </div>

      {/* Right Sidebar: Price Breakdown & Pay */}
      <div className="w-full lg:w-96 shrink-0 mt-8 lg:mt-0">
        <div className="space-y-6 sticky top-6">
          
          <SavingsBanner selectedPrice={selectedCourier?.price} className="bg-white" />

          <Card className="p-6 bg-white border-border shadow-sm rounded-2xl">
            <h3 className="font-heading font-bold text-lg mb-6">Price Breakdown</h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Base Shipping ({packageDetails.weight} kg)</span>
                <span className="font-semibold text-foreground">₹{baseShipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center group cursor-help">
                <span className="text-muted-foreground font-medium flex items-center gap-1 border-b border-dashed border-muted-foreground/50">Fuel Surcharge <HelpCircle className="w-3 h-3 text-muted-foreground" /></span>
                <span className="font-semibold text-foreground">₹{fuelSurcharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center group cursor-help">
                <span className="text-muted-foreground font-medium flex items-center gap-1 border-b border-dashed border-muted-foreground/50">Cod Fee</span>
                <span className="font-semibold text-foreground">₹0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Evidence Vault</span>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 uppercase text-[10px] tracking-wider px-2 py-0 border-0">FREE</Badge>
              </div>
            </div>

            <div className="my-6 border-t border-dashed border-border/80 pt-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground font-semibold">Subtotal</span>
                <span className="font-bold text-foreground">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">GST (18%)</span>
                <span className="font-semibold text-foreground">₹{gst.toFixed(2)}</span>
              </div>
              {promoStatus === "applied" && (
                <div className="flex justify-between items-center text-sm text-emerald-600">
                  <span className="font-semibold">Promo code (10% Off)</span>
                  <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {walletApplied && (
                <div className="flex justify-between items-center text-sm text-primary">
                  <span className="font-semibold">Wallet Deduction</span>
                  <span className="font-bold">-₹{walletDeduction.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="mb-6 p-4 bg-muted/20 rounded-xl border border-border/50">
               <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                 <Tag className="w-3 h-3" /> Available Offers
               </div>
               <div className="space-y-2">
                 {[
                   { code: "PARCEL10", desc: "10% off on all shipments" },
                   { code: "FIRST50", desc: "Flat ₹50 off on first booking" }
                 ].map(offer => (
                   <div key={offer.code} className="flex items-center justify-between group cursor-pointer" onClick={() => { setPromoInput(offer.code); setPromoStatus(false); }}>
                     <div className="bg-primary/5 text-primary border border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded uppercase group-hover:bg-primary group-hover:text-white transition-colors">{offer.code}</div>
                     <span className="text-[10px] text-muted-foreground font-medium">{offer.desc}</span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="flex items-center gap-2 mb-6 relative">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={promoInput} onChange={e => setPromoInput(e.target.value.toUpperCase())} placeholder="Promo code" className={`pl-9 h-10 bg-gray-50/50 ${promoStatus === 'invalid' ? 'border-red-500 ring-1 ring-red-500' : ''}`} disabled={promoStatus === 'applied'} />
              </div>
              <Button onClick={handleApplyPromo} variant={promoStatus === 'applied' ? "default" : "secondary"} className={`h-10 font-semibold ${promoStatus === 'applied' ? 'bg-emerald-600 hover:bg-emerald-600 text-white shadow-sm' : ''}`} disabled={promoStatus === 'applied'}>
                {promoStatus === 'applied' ? 'Applied' : 'Apply'}
              </Button>
              {promoStatus === 'invalid' && <span className="absolute -bottom-5 left-2 text-[10px] text-red-500 font-bold">Invalid promo code</span>}
            </div>

            <div className="mb-6 p-4 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-muted-foreground">Courier:</span>
                <span className="text-sm font-bold text-foreground">{selectedCourier?.name || 'Delhivery'}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-muted-foreground">Base Price:</span>
                <span className="text-sm font-bold text-foreground">₹{baseShipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-muted-foreground">GST:</span>
                <span className="text-sm font-bold text-foreground">₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border/50 mb-4">
                <span className="text-base font-bold text-foreground">Total:</span>
                <span className="text-base font-extrabold text-primary">₹{finalTotal.toFixed(2)}</span>
              </div>
              <div className="bg-emerald-50 text-emerald-700 text-center py-2.5 rounded-lg border border-emerald-200 shadow-sm font-bold text-sm">
                💰 You saved ₹18
              </div>
            </div>

            <Button onClick={handlePay} disabled={isProcessing} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-90 text-white font-semibold rounded-xl text-lg shadow-lg shadow-emerald-600/20 transition-transform active:scale-95 flex items-center justify-center gap-2">
              {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin mr-1" /> Processing...</> : <><Lock className="w-5 h-5 opacity-80" /> Pay ₹{finalTotal.toFixed(2)} Securely</>}
            </Button>
            
            <div className="mt-8 pt-6 border-t border-border/60 flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-2 text-sm text-foreground font-extrabold bg-muted/40 w-full py-3 rounded-lg border border-border/50">
                <span className="text-lg">🔒</span> Secure Payment
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-foreground font-extrabold bg-emerald-50 text-emerald-800 w-full py-3 rounded-lg border border-emerald-100">
                <span className="text-lg">🚚</span> Trusted by 10,000+ users
              </div>
              <div className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold mt-2">
                Powered by Razorpay
              </div>
            </div>

          </Card>

        </div>
      </div>

    </div>
  );
}
