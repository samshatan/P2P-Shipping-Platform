import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#a33900] to-[#cc4900] rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-foreground">
                PARCEL<span className="text-primary">.</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
            <Link to="/track" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Track Shipment</Link>
            <Link to="/international" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">International</Link>
            <Link to="/partner" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Couriers</Link>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/login')} variant="ghost" className="hidden sm:inline-flex text-sm font-medium">Log in</Button>
            <Button onClick={() => navigate('/compare')} className="hidden sm:inline-flex bg-gradient-to-r from-[#a33900] to-[#cc4900] hover:from-[#8c3100] hover:to-[#a33900] text-white shadow-lg shadow-primary/25 border-0 font-semibold rounded-lg px-6 transition-all hover:scale-105">
              Book Parcel
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
