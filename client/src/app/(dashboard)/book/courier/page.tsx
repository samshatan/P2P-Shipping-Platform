import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, Truck, MapPin, Search, ArrowRight, Activity, Clock, CheckCircle2, Info, RefreshCw, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { AiRecommendationCard } from "@/components/features/AiRecommendationCard";
import { SavingsBanner } from "@/components/features/SavingsBanner";
import { useToast } from "@/context/ToastContext";
import { getCourierRates } from "@/lib/api";
import { useBooking } from "@/context/BookingContext";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourierSelection() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { selectedCourier, setCourier, pickup: bPickup, delivery: bDelivery, packageDetails: bPackage } = useBooking();
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("PRICE");

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = {
        pickup: bPickup.pincode || "110001",
        delivery: bDelivery.pincode || "400001",
        weight: Math.round(parseFloat(bPackage.weight || "1.5") * 1000), // weight in grams
        is_cod: false
      };
      const data = await getCourierRates(payload);
      
      if (!data.couriers || data.couriers.length === 0) {
        setRates([]);
        return;
      }

      const adaptedRates = data.couriers.map((c: any) => ({
        id: c.courier_id,
        name: c.courier_name,
        logo: c.logo_url,
        price: c.price_paise / 100, // paise to rupees
        etaDays: c.official_eta_days,
        actualAvgDays: c.ai_eta_days,
        pickupWindow: `Within ${c.pickup_sla_hours} hours`,
        codAvailable: c.cod_available,
        rating: c.rating,
        tags: c.tags || []
      }));

      setRates(adaptedRates);
      const cheapest = [...adaptedRates].sort((a, b) => a.price - b.price)[0];
      if (cheapest && !selectedCourier) setCourier(cheapest);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedRateId = selectedCourier?.id || null;

  useEffect(() => {
    fetchRates();
  }, []);

  const filters = ["ALL", "COD AVAILABLE", "SAME DAY", "UNDER ₹100"];
  const sorts = ["PRICE", "SPEED", "RATING"];

  const getFilteredAndSorted = () => {
    let result = [...rates];
    if (filter === "COD AVAILABLE") result = result.filter(r => r.codAvailable);
    if (filter === "SAME DAY") result = result.filter(r => r.tags.includes("SAME DAY"));
    if (filter === "UNDER ₹100") result = result.filter(r => r.price < 100);

    return result.sort((a, b) => {
      if (sort === "PRICE") return a.price - b.price;
      if (sort === "SPEED") return a.etaDays - b.etaDays;
      if (sort === "RATING") return b.rating - a.rating;
      return 0;
    });
  };

  const finalRates = getFilteredAndSorted();
  const selectedRate = rates.find(r => r.id === selectedRateId);

  const cheapestId = rates.length > 0 ? [...rates].sort((a, b) => a.price - b.price)[0]?.id : null;
  const fastestId = rates.length > 0 ? [...rates].sort((a, b) => a.etaDays - b.etaDays)[0]?.id : null;
  const recommendedId = rates.length > 0 ? [...rates].sort((a, b) => b.rating - a.rating)[0]?.id : null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-32">
      
      {/* Left: Rate Engine */}
      <div className="flex-1 max-w-4xl space-y-6 mt-8">
        
        {!loading && !error && rates.length > 0 && (
          <>
            <AiRecommendationCard rates={rates} />
            <SavingsBanner selectedPrice={selectedRate?.price} />
          </>
        )}

        {error && (
          <ErrorState onRetry={fetchRates} message={error} />
        )}

        {!error && (
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-5 rounded-2xl shadow-sm border border-border">
            <div className="flex flex-wrap gap-2 w-full">
              {filters.map(f => (
                <Badge 
                  key={f} 
                  variant={filter === f ? "default" : "outline"}
                  className={cn("cursor-pointer px-4 py-1.5 text-[10px] font-bold rounded-full uppercase transition-all whitespace-nowrap", filter === f ? "bg-foreground text-background" : "hover:bg-muted")}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </Badge>
              ))}
            </div>
            <div className="flex gap-4 items-center text-sm font-bold text-muted-foreground w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0">
              <span className="uppercase tracking-widest text-[10px]">Sort By:</span>
              <div className="flex gap-2">
                {sorts.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSort(s)}
                    className={cn("px-3 py-1 rounded-lg transition-colors text-xs whitespace-nowrap", sort === s ? "bg-primary/10 text-primary" : "hover:bg-muted")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4 relative min-h-[400px]">
            {[1,2,3].map(i => (
              <Card key={i} className="bg-white border-border rounded-2xl p-6 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="flex items-center gap-4 w-full sm:w-1/4">
                    <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                  <div className="w-full sm:w-auto mt-4 sm:mt-0">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                  </div>
                </div>
              </Card>
            ))}
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] z-10 rounded-2xl">
              <LoadingState message="Calculating Best Rates" />
            </div>
          </div>
        ) : !error && (
          <div className="space-y-4">
            {finalRates.length === 0 ? (
              <EmptyState 
                title="No couriers available" 
                description="We couldn't find any couriers for this route and criteria. Try a different pincode or weight."
                icon={Truck}
                actionText="Check different route"
                onAction={() => navigate('/book/address')}
              />
            ) : finalRates.map((rate, idx) => (
              <Card 
                key={rate.id} 
                onClick={() => setCourier(rate)}
                className={cn(
                  "bg-white border p-6 rounded-2xl transition-all duration-300 group cursor-pointer relative", 
                  selectedRateId === rate.id ? "border-primary ring-2 ring-primary/20 shadow-md scale-[1.01]" : "border-border shadow-sm hover:shadow-lg hover:border-primary/40 hover:scale-[1.01]",
                  rate.id === recommendedId ? "ring-1 ring-primary/40 shadow-primary/5" : ""
                )}
              >
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  
                  {/* Courier Identity */}
                  <div className="flex items-center gap-4 w-full sm:w-1/4">
                    <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center overflow-hidden border border-border shrink-0">
                      <Truck className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {rate.id === cheapestId && <Badge className="text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">💰 Cheapest</Badge>}
                        {rate.id === fastestId && <Badge className="text-[9px] px-1.5 py-0 bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">⚡ Fastest</Badge>}
                        {rate.id === recommendedId && <Badge className="text-[9px] px-1.5 py-0 bg-orange-100 text-orange-800 hover:bg-orange-200 border-none">⭐ Recommended</Badge>}
                      </div>
                      <h4 className="font-heading font-bold text-lg text-foreground leading-none mb-1">{rate.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                          {rate.rating} ★
                        </div>
                        <div className="text-[10px] text-muted-foreground font-semibold">
                          On-time: {90 + (rate.id % 8)}% • COD: {85 + (rate.id % 12)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI & ETA Insights */}
                  <div className="flex-1 grid grid-cols-2 gap-4 w-full border-t sm:border-t-0 sm:border-l sm:border-r border-border/60 py-4 sm:py-0 sm:px-6">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Official ETA
                      </div>
                      <div className="font-semibold text-foreground">{rate.etaDays} Days</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{rate.pickupWindow}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-tertiary tracking-wider mb-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> AI Reliability
                      </div>
                      <div className={cn("font-semibold", rate.actualAvgDays <= rate.etaDays ? "text-emerald-600" : "text-amber-500")}>
                        {rate.actualAvgDays} Days Avg
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Based on 12k past routes</div>
                    </div>
                  </div>

                  {/* CTA & Tags */}
                  <div className="flex flex-col sm:items-end justify-center w-full sm:w-auto gap-3">
                    <div className="flex flex-wrap gap-1">
                      {rate.tags.map((tag: string) => (
                        <Badge key={tag} className={cn("text-[10px] px-2 py-0 font-bold", tag === "SAME DAY" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-primary/10 text-primary hover:bg-primary/20")} variant="secondary">{tag}</Badge>
                      ))}
                      {rate.codAvailable && <Badge variant="outline" className="text-[10px] px-2 py-0 font-bold text-green-700 border-green-200 bg-green-50">COD ✓</Badge>}
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="text-right">
                        <div className="font-heading font-extrabold text-2xl text-foreground">₹{rate.price}</div>
                        <div className="text-[10px] font-semibold text-muted-foreground">+18% GST</div>
                      </div>
                      <Button disabled={isSelecting} onClick={async () => {
                        setIsSelecting(true);
                        showToast("Courier Selected", "success");
                        setCourier(rate);
                        // Small delay for UX feedback
                        await new Promise(r => setTimeout(r, 600));
                        navigate('/book/address');
                      }} className="bg-primary hover:bg-primary/90 text-white px-6 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 min-w-[100px]">
                        {isSelecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Select"}
                      </Button>
                    </div>
                  </div>
                  
                </div>

                {/* Quick Expand Details */}
                <AnimatePresence>
                  {selectedRateId === rate.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-5 mt-5 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-muted/30 p-3 rounded-xl flex items-start gap-3 border border-border/50">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Delivery Attempts</p>
                            <p className="text-sm font-semibold">3 Attempts included</p>
                          </div>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-xl flex items-start gap-3 border border-border/50">
                          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Support Quality</p>
                            <p className="text-sm font-semibold">{rate.rating >= 4.5 ? "Priority Contact" : "Standard Support"}</p>
                          </div>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-xl flex items-start gap-3 border border-border/50">
                          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Insurance</p>
                            <p className="text-sm font-semibold">Covered up to ₹5000</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar: Order Summary */}
      <div className="w-full lg:w-80 shrink-0 mt-8 lg:mt-0">
        <ScrollArea className="h-[calc(100vh-120px)] pb-10">
          <div className="space-y-6 pr-4">
            
            <Card className="p-6 bg-white border-border shadow-sm rounded-2xl sticky top-0">
              <h3 className="font-heading font-bold text-lg mb-4 border-b border-border/50 pb-2">Order Summary</h3>
              
              <div className="relative">
                <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-border"></div>
                
                <div className="flex gap-4 relative mb-6">
                  <div className="w-5 h-5 rounded-full bg-background border-2 border-tertiary flex-shrink-0 z-10 mt-0.5"></div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Pickup</p>
                    <p className="text-sm font-semibold text-foreground">{bPickup.pincode} • {bPickup.name || 'Mumbai'}</p>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="w-5 h-5 rounded-full bg-primary flex flex-shrink-0 z-10 mt-0.5"></div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Delivery</p>
                    <p className="text-sm font-semibold text-foreground">{bDelivery.pincode} • {bDelivery.name || 'New Delhi'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Weight</span>
                  <span className="font-semibold">{bPackage.weight} kg (Volumetric)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Parcel Type</span>
                  <span className="font-semibold">Standard Box</span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4 h-10 rounded-lg text-xs font-bold bg-muted/30 hover:bg-muted border-border">
                Edit Details
              </Button>
            </Card>

            {/* Evidence Vault Upsell */}
            <Card className="p-6 bg-gradient-to-br from-tertiary to-blue-900 text-white border-0 shadow-lg rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px]"></div>
              <ShieldCheck className="w-8 h-8 text-blue-300 mb-4 relative z-10" />
              <h3 className="font-heading font-bold text-lg mb-2 relative z-10">Protect this shipment</h3>
              <p className="text-sm text-blue-100/90 leading-relaxed mb-4 relative z-10 font-medium">
                Add Evidence Vault hash in the next step to prevent weight disputes. Used by 87% of sellers.
              </p>
              <div className="flex items-center text-xs font-bold text-blue-200 gap-1 uppercase tracking-wider">
                Included Free <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </Card>

          </div>
        </ScrollArea>
      </div>

      {/* Sticky Bottom Bar */}
      <AnimatePresence>
        {selectedRate && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 sm:p-5 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.15)] z-50 flex justify-center backdrop-blur-md bg-white/95"
          >
            <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-2 sm:px-6">
              
              <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Selected Courier</span>
                  <span className="text-base sm:text-xl font-heading font-extrabold text-foreground">{selectedRate.name}</span>
                </div>
                
                <div className="w-1 h-8 bg-border hidden sm:block rounded-full"></div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-right sm:text-left">
                  <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Price</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-extrabold text-primary">₹{selectedRate.price}</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">+ GST</span>
                  </div>
                </div>
              </div>

              <Button 
                disabled={isSelecting}
                onClick={async () => {
                  setIsSelecting(true);
                  showToast("Courier Selected", "success");
                  await new Promise(r => setTimeout(r, 600));
                  navigate('/book/address');
                }} 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-6 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-base sm:text-lg shrink-0 min-w-[180px]"
              >
                {isSelecting ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Proceeding...</> : <>Continue <ArrowRight className="w-5 h-5 ml-2" /></>}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
