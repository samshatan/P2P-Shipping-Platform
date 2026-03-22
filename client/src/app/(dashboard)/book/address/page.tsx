import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Truck, Package, ArrowRightLeft, Home, Briefcase, Heart, Search, ArrowUpDown, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function AddressInput() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("400001");
  const [delivery, setDelivery] = useState("110001");
  const savedAddresses = [
    { id: 1, type: "Home", name: "Rahul Sharma", address: "B-402, Seawoods, Mumbai 400001", icon: <Home className="w-5 h-5 text-primary" />, isDefault: true },
    { id: 2, type: "Office", name: "Rahul Sharma", address: "Tech Park, Andheri, Mumbai 400053", icon: <Briefcase className="w-5 h-5 text-yellow-600" />, isDefault: false },
    { id: 3, type: "Parents", name: "Suresh Sharma", address: "Vijay Nagar, Indore 452010", icon: <Heart className="w-5 h-5 text-rose-500" />, isDefault: false }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
      
      {/* Forms Area */}
      <div className="flex-1 space-y-8">
        
        {/* Saved Addresses Strip */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Saved Addresses</h3>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
            {savedAddresses.map(addr => (
              <button key={addr.id} className={cn("snap-start shrink-0 w-64 p-4 rounded-xl border text-left transition-all hover:border-primary/50 relative overflow-hidden group", addr.isDefault ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-border")}>
                {addr.isDefault && <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">DEFAULT</div>}
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white rounded-lg p-2 shadow-sm border border-border/50 group-hover:scale-110 transition-transform">{addr.icon}</div>
                  <div className="font-heading font-bold">{addr.type}</div>
                </div>
                
                <div className="text-sm font-semibold text-foreground">{addr.name}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate">{addr.address}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pickup Form */}
        <Card className="p-6 bg-white border-border rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-tertiary"></div>
          <div className="flex items-center gap-3 border-b border-border/50 pb-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
               <MapPin className="w-5 h-5 text-tertiary" />
            </div>
            <h3 className="font-heading font-bold text-xl text-foreground">Pickup Address</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2 sm:col-span-2 relative">
              <Label>Search Pincode / Area</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={pickup} onChange={e => setPickup(e.target.value)} placeholder="Start typing pincode e.g 400001" className="pl-10 h-12 bg-gray-50/50 rounded-xl" />
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Complete Address (House, Building, Street)</Label>
              <Input placeholder="Eg. Flat 4B, Hill View Apartments, Linking Road" className="h-12 bg-gray-50/50 rounded-xl" defaultValue="Flat 4B, Hill View" />
            </div>

            <div className="space-y-2">
              <Label>Sender Name</Label>
              <Input placeholder="John Doe" className="h-12 bg-gray-50/50 rounded-xl" defaultValue="Rahul Sharma" />
            </div>

            <div className="space-y-2">
              <Label>Sender Phone</Label>
              <Input placeholder="98765 43210" className="h-12 bg-gray-50/50 rounded-xl" defaultValue="98765 43210" />
            </div>
          </div>
        </Card>

        {/* Swap Button */}
        <div className="relative flex justify-center -my-2 z-10">
          <Button onClick={() => {
            setPickup(delivery);
            setDelivery(pickup);
          }} variant="outline" className="w-10 h-10 rounded-full bg-white shadow-md border-border/60 hover:border-primary hover:text-primary transition-all p-0 absolute -top-5">
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>

        {/* Delivery Form */}
        <Card className="p-6 bg-white border-border rounded-2xl shadow-sm relative overflow-hidden mt-0">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
          <div className="flex items-center gap-3 border-b border-border/50 pb-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
               <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-xl text-foreground">Delivery Address</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2 sm:col-span-2 relative">
              <Label>Search Pincode / Area</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={delivery} onChange={e => setDelivery(e.target.value)} placeholder="Start typing pincode e.g 110001" className="pl-10 h-12 bg-gray-50/50 rounded-xl" />
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Complete Address (House, Building, Street)</Label>
              <Input placeholder="Eg. Flat 4B, Hill View Apartments, Linking Road" className="h-12 bg-gray-50/50 rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Receiver Name</Label>
              <Input placeholder="Jane Doe" className="h-12 bg-gray-50/50 rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Receiver Phone</Label>
              <Input placeholder="98765 43210" className="h-12 bg-gray-50/50 rounded-xl" />
            </div>
          </div>
        </Card>

        {/* Parcel Details */}
        <Card className="p-6 bg-white border-border rounded-2xl shadow-sm relative overflow-hidden">
           <div className="flex items-center gap-3 border-b border-border/50 pb-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
               <Package className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="font-heading font-bold text-xl text-foreground">Parcel Metrics</h3>
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <div className="space-y-2 sm:col-span-1">
              <Label>Weight (kg)</Label>
              <Input type="number" step="0.1" defaultValue={1.5} className="h-12 bg-gray-50/50 rounded-xl" />
            </div>
            <div className="space-y-2 sm:col-span-3">
              <Label>Dimensions L × W × H (cm) <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <div className="flex gap-2">
                <Input placeholder="L" type="number" className="h-12 bg-gray-50/50 rounded-xl" />
                <div className="flex items-center text-muted-foreground">×</div>
                <Input placeholder="W" type="number" className="h-12 bg-gray-50/50 rounded-xl" />
                <div className="flex items-center text-muted-foreground">×</div>
                <Input placeholder="H" type="number" className="h-12 bg-gray-50/50 rounded-xl" />
              </div>
            </div>
          </div>
        </Card>
        
        <div className="flex justify-between items-center pt-4 gap-4">
          <Button onClick={() => navigate('/compare')} variant="outline" className="h-14 px-8 rounded-xl font-semibold border-border">
            Back
          </Button>
          <Link to="/book/courier" className="flex-1 sm:w-auto">
            <Button className="w-full h-14 px-8 bg-foreground hover:bg-foreground/90 text-white font-semibold rounded-xl text-lg shadow-lg shadow-foreground/20 transition-transform active:scale-95 group">
              Continue to Courier <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

      </div>
      
    </div>
  );
}
