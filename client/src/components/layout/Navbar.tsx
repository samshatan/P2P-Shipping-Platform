import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, User, LayoutDashboard, LogOut, Bell } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-2xl border-b border-border/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-foreground">
                PARCEL<span className="text-primary">.</span>
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
            <Link to="/track" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Track Shipment</Link>
            <Link to="/international" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">International</Link>
            <Link to="/partner" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Couriers</Link>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                <Button onClick={() => navigate('/notifications')} variant="ghost" size="icon" className="relative group">
                  <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
                </Button>
                <Button onClick={() => navigate('/dashboard')} variant="ghost" size="sm" className="items-center gap-2 text-sm font-medium">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
                <Button onClick={() => navigate('/profile')} variant="ghost" size="sm" className="items-center gap-2 text-sm font-medium border border-border/40 bg-white/50 shadow-sm">
                  <User className="w-4 h-4" />
                  Profile
                </Button>
              </div>
            ) : (
              <Button onClick={() => navigate('/login')} variant="ghost" size="sm" className="hidden sm:inline-flex text-sm font-medium">Log in</Button>
            )}
            
            <Button onClick={() => navigate('/compare')} className="hidden sm:inline-flex bg-gradient-to-r from-primary to-primary-container hover:opacity-90 text-white shadow-lg shadow-primary/25 border-0 font-semibold rounded-lg px-6 transition-all hover:scale-105">
              Book Parcel
            </Button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-muted-foreground hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {isMenuOpen && (
          <div className="lg:hidden pb-6 pt-2 border-t border-white/10 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
            <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
            <Link to="/track" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors">Track Shipment</Link>
            <Link to="/international" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors">International</Link>
            <Link to="/partner" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors">Couriers</Link>
            <hr className="border-white/10 mx-4" />
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors">Profile</Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="px-4 py-2 text-left text-base font-medium text-red-400 hover:text-red-300 transition-colors">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors">Log in</Link>
            )}
            <Link to="/compare" onClick={() => setIsMenuOpen(false)} className="mx-4 mt-2 py-3 bg-primary text-white text-center font-bold rounded-xl shadow-lg">Book Parcel</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
