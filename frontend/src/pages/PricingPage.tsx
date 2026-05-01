import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Globe, Package, ArrowRight } from "lucide-react";

export function PricingPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"domestic" | "international" | "both">("both");

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-5xl sm:text-7xl font-black text-text-main mb-8 leading-[1.05] tracking-tight">
          Transparent pricing.<br />
          <span className="text-brand-primary">Zero hidden fees.</span>
        </h1>
        <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-medium">
          We aggregate rates from India's top couriers to give you enterprise-grade shipping discounts from day one.
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="bg-bg-soft p-1.5 rounded-2xl border border-border-main flex gap-2">
          <button 
            onClick={() => setView("domestic")}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "domestic" ? "bg-brand-primary text-white shadow-lg" : "text-text-muted hover:text-text-main"}`}
          >
            Domestic
          </button>
          <button 
            onClick={() => setView("international")}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "international" ? "bg-brand-accent text-white shadow-lg" : "text-text-muted hover:text-text-main"}`}
          >
            International
          </button>
          <button 
            onClick={() => setView("both")}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "both" ? "bg-text-main text-bg-main shadow-lg" : "text-text-muted hover:text-text-main"}`}
          >
            Both
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20 text-left">
        {/* Domestic Card */}
        {(view === "domestic" || view === "both") && (
          <div className="relative p-10 rounded-[3rem] border border-border-main shadow-2xl bg-bg-main overflow-hidden group glass">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary opacity-50"></div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="inline-flex items-center gap-2 text-brand-primary font-black text-xs uppercase tracking-widest mb-4">
                  <Package className="w-5 h-5" /> Domestic Shipping
                </div>
                <div className="text-5xl font-black">From ₹45 <span className="text-sm text-text-muted font-bold uppercase tracking-widest">/ 500g</span></div>
              </div>
            </div>

            <ul className="space-y-5 mb-10">
              {["Standard (3-5 days)", "Express (1-2 days)", "Same Day Delivery (Metro)", "Heavy / LTL Surface Cargo"].map((feature, i) => (
                <li key={i} className="flex items-center gap-4 text-text-muted font-bold text-sm">
                  <div className="w-6 h-6 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  {feature}
                </li>
              ))}
              <li className="flex items-center gap-4 text-text-muted font-bold text-xs pt-4 border-t border-border-main/50">
                <span className="font-black text-text-main uppercase tracking-widest">Partners:</span> Delhivery, DTDC, XpressBees
              </li>
            </ul>

            <button onClick={() => navigate('/calculator')} className="w-full h-16 bg-brand-primary text-white text-lg font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/25 hover:-translate-y-1">
              Calculate Rates <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* International Card */}
        {(view === "international" || view === "both") && (
          <div className="relative p-10 rounded-[3rem] border border-border-main shadow-2xl bg-bg-main overflow-hidden group glass">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-accent opacity-50"></div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="inline-flex items-center gap-2 text-brand-accent font-black text-xs uppercase tracking-widest mb-4">
                  <Globe className="w-5 h-5" /> International Shipping
                </div>
                <div className="text-5xl font-black">From ₹750 <span className="text-sm text-text-muted font-bold uppercase tracking-widest">/ docs</span></div>
              </div>
            </div>

            <ul className="space-y-5 mb-10">
              {["Economy (5-10 days)", "Standard (3-5 days)", "Express (1-3 days)", "Customs Clearance Included"].map((feature, i) => (
                <li key={i} className="flex items-center gap-4 text-text-muted font-bold text-sm">
                  <div className="w-6 h-6 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  {feature}
                </li>
              ))}
              <li className="flex items-center gap-4 text-text-muted font-bold text-xs pt-4 border-t border-border-main/50">
                <span className="font-black text-text-main uppercase tracking-widest">Partners:</span> DHL, FedEx, UPS, Aramex
              </li>
            </ul>

            <button onClick={() => navigate('/calculator')} className="w-full h-16 bg-brand-accent text-white text-lg font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-purple-700 transition-all shadow-xl shadow-brand-accent/25 hover:-translate-y-1">
              Calculate Rates <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24 text-left">
        <div className="p-10 bg-brand-primary/5 border border-brand-primary/20 rounded-[2.5rem] glass">
          <h3 className="text-2xl font-black mb-4 tracking-tight">Expanding in India?</h3>
          <p className="text-text-muted font-medium leading-relaxed">Open your business to 27,000+ pincodes instantly. We handle RTOs and fast COD remittance so you can focus on growth.</p>
        </div>
        <div className="p-10 bg-brand-accent/5 border border-brand-accent/20 rounded-[2.5rem] glass">
          <h3 className="text-2xl font-black mb-4 tracking-tight">Going Global?</h3>
          <p className="text-text-muted font-medium leading-relaxed">Ship to 220 countries seamlessly. Generate commercial invoices automatically and get enterprise rates on air freight.</p>
        </div>
      </div>
    </div>
  );
}
