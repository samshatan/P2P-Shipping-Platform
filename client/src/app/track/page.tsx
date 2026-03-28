import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Package, ArrowRight } from "lucide-react";

export default function TrackLandingPage() {
  const navigate = useNavigate();
  const [awb, setAwb] = useState("");
  const [touched, setTouched] = useState(false);

  const validateAwb = (val: string) => {
    if (!val.trim()) return "Please enter a tracking number";
    return null;
  };

  const error = touched ? validateAwb(awb) : null;

  const handleTrack = () => {
    setTouched(true);
    const trimmed = awb.trim();
    if (!trimmed) return;
    navigate(`/track/${trimmed}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleTrack();
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-24 pb-16 px-4">
        <div className="w-full max-w-xl text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-heading font-extrabold text-foreground mb-2">
            Track Your Shipment
          </h1>
          <p className="text-muted-foreground font-medium mb-8">
            Enter your AWB or tracking number to get real-time updates.
          </p>

          <Card className="p-6 bg-white border-border shadow-sm rounded-2xl">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={awb}
                    onChange={(e) => { setAwb(e.target.value); setTouched(false); }}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. SR2024031500123"
                    className={`pl-10 h-14 text-base rounded-xl bg-gray-50/50 ${error ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-500 font-semibold text-left ml-1">{error}</p>
                )}
              </div>

              <Button
                onClick={handleTrack}
                className="w-full h-14 bg-foreground hover:bg-foreground/90 text-white font-semibold text-base rounded-xl shadow-lg transition-all active:scale-95 group"
              >
                Track Now <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>

          <p className="text-sm text-muted-foreground mt-6">
            Your tracking number can be found in your booking confirmation email.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
