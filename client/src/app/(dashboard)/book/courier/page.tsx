import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, Truck, MapPin, Search, ArrowRight, Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { MOCK_COURIERS } from "@/lib/mockData";
import { AiRecommendationCard } from "@/components/features/AiRecommendationCard";
import { SavingsBanner } from "@/components/features/SavingsBanner";
import { useToast } from "@/context/ToastContext";

export default function CourierSelection() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("PRICE");
  const [selectedRateId, setSelectedRateId] = useState<number | string | null>(null);

  useEffect(() => {
    // Adapt MOCK_COURIERS to the expected structure
    const adaptedRates = MOCK_COURIERS.map(c => ({
      ...c,
      etaDays: parseInt(c.days.split('-')[0]) || 3, // Extract first day from "3-4"
      actualAvgDays: parseInt(c.actual.replace('~', '').split(' ')[0]) || 5, // Extract from "~5 days"
      pickupWindow: "Today, 4 PM - 6 PM",
      codAvailable: c.cod,
      tags: c.tag ? [c.tag] : []
    }));

    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setRates(adaptedRates);
      // Set cheapest as default selected
      const cheapest = [...adaptedRates].sort((a, b) => a.price - b.price)[0];
      if (cheapest) setSelectedRateId(cheapest.id);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
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

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Left: Rate Engine */}
      <div className="flex-1 max-w-4xl space-y-6 mt-8">
        
        {!loading && rates.length > 0 && (
          <>
            <AiRecommendationCard rates={rates} />
            <SavingsBanner selectedPrice={selectedRate?.price} />
          </>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-border">
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <Badge 
                key={f} 
                variant={filter === f ? "default" : "outline"}
                className={cn("cursor-pointer px-3 py-1 text-xs font-semibold rounded-full uppercase transition-all", filter === f ? "bg-foreground text-background" : "hover:bg-muted")}
                onClick={() => setFilter(f)}
              >
                {f}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 items-center text-sm font-semibold text-muted-foreground w-full sm:w-auto">
            <span className="uppercase tracking-wider text-xs">Sort:</span>
            {sorts.map(s => (
              <button 
                key={s} 
                onClick={() => setSort(s)}
                className={cn("px-2 py-1 rounded-md transition-colors", sort === s ? "bg-primary/10 text-primary" : "hover:bg-muted")}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <Card key={i} className="h-32 bg-white/50 animate-pulse border-border rounded-2xl p-6 relative overflow-hidden" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {finalRates.map((rate, idx) => (
              <Card 
                key={rate.id} 
                onClick={() => setSelectedRateId(rate.id)}
                className={cn(
                  "bg-white border p-6 rounded-2xl transition-all group hover:shadow-lg hover:border-primary/40 cursor-pointer relative", 
                  selectedRateId === rate.id ? "border-primary ring-2 ring-primary/10 shadow-md" : "border-border shadow-sm",
                  idx === 0 && sort === "PRICE" ? "before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:ring-1 before:ring-primary/20" : ""
                )}
              >
                
                {idx === 0 && sort==="PRICE" && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-xl">
                    Cheapest Choice
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  
                  {/* Courier Identity */}
                  <div className="flex items-center gap-4 w-full sm:w-1/4">
                    <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center overflow-hidden border border-border">
                      <Truck className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-lg text-foreground">{rate.name}</h4>
                      <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                        {rate.rating} ★
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
                      <Button onClick={() => {
                        showToast("Courier Selected", "success");
                        localStorage.setItem('selectedCourier', JSON.stringify(rate));
                        navigate('/book/address');
                      }} className="bg-primary hover:bg-primary/90 text-white px-6 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                        Select
                      </Button>
                    </div>
                  </div>

                </div>
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
                    <p className="text-sm font-semibold text-foreground">400001 • Mumbai</p>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="w-5 h-5 rounded-full bg-primary flex flex-shrink-0 z-10 mt-0.5"></div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Delivery</p>
                    <p className="text-sm font-semibold text-foreground">110001 • New Delhi</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Weight</span>
                  <span className="font-semibold">1.5 kg (Volumetric)</span>
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

    </div>
  );
}
