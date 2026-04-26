import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  Settings, 
  LogOut, 
  Package, 
  ShieldCheck,
  ChevronRight,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Shipments", icon: Package, path: "/admin/shipments" },
    { label: "Users & KYC", icon: Users, path: "/admin/users" },
    { label: "Couriers", icon: Truck, path: "/admin/couriers" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border/50 hidden lg:flex flex-col shadow-sm">
        <div className="p-6 border-b border-border/50">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-foreground">
              Swift<span className="text-primary">Admin</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "group-hover:text-primary")} />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="bg-muted/50 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary text-xs font-extrabold uppercase">{user?.name?.[0] || 'A'}</span>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-foreground truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-tighter">Super Admin</p>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full justify-start gap-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl h-11"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-8 z-10">
          <div className="lg:hidden flex items-center gap-2">
             <ShieldCheck className="w-6 h-6 text-primary" />
             <span className="font-heading font-bold text-lg">SwiftAdmin</span>
          </div>
          
          <div className="hidden lg:block">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Platform Management / <span className="text-foreground">{menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 hover:bg-muted relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </Button>
            <div className="w-10 h-10 rounded-full bg-foreground text-white flex items-center justify-center font-bold shadow-lg">
              {user?.name?.[0] || 'A'}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
