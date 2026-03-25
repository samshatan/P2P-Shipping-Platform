import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Package, 
  Wallet, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  MoreVertical,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "shipment",
    title: "Shipment Out for Delivery",
    message: "Your shipment #AWB829103IN is out for delivery in Mumbai.",
    time: "2 hours ago",
    read: false,
    icon: Package,
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: 2,
    type: "wallet",
    title: "Wallet Recharged",
    message: "₹500.00 successfully added to your PARCEL wallet.",
    time: "5 hours ago",
    read: true,
    icon: Wallet,
    color: "bg-emerald-100 text-emerald-600"
  },
  {
    id: 3,
    type: "kyc",
    title: "KYC Verified",
    message: "Congratulations! Your identity verification is complete. Limits upgraded.",
    time: "1 day ago",
    read: true,
    icon: ShieldCheck,
    color: "bg-purple-100 text-purple-600"
  },
  {
    id: 4,
    type: "shipment",
    title: "Shipment Delayed",
    message: "Shipment #AWB716254IN is delayed due to weather conditions.",
    time: "2 days ago",
    read: true,
    icon: Clock,
    color: "bg-orange-100 text-orange-600"
  }
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-extrabold text-foreground flex items-center gap-3">
                <Bell className="w-8 h-8 text-primary" /> Notifications
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Stay updated with your shipments and account activities.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={markAllRead}
              className="h-10 px-4 rounded-xl border-border bg-white font-bold text-xs uppercase tracking-wider hover:bg-muted"
            >
              Mark all read
            </Button>
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <Card className="p-12 text-center flex flex-col items-center justify-center bg-white border-border rounded-[2rem]">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6 opacity-40">
                   <Bell className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">All caught up!</h3>
                <p className="text-muted-foreground font-medium italic">You don't have any new notifications.</p>
              </Card>
            ) : (
              notifications.map((notif) => (
                <Card 
                  key={notif.id} 
                  className={cn(
                    "p-5 bg-white border-border rounded-2xl shadow-sm hover:shadow-md transition-all flex items-start gap-4 group relative overflow-hidden",
                    !notif.read && "border-primary/30 ring-1 ring-primary/5 shadow-primary/5"
                  )}
                >
                  {!notif.read && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  )}
                  
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", notif.color)}>
                    <notif.icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn("font-bold text-base transition-colors", !notif.read ? "text-foreground" : "text-muted-foreground")}>
                        {notif.title}
                      </h4>
                      {!notif.read && <Badge className="bg-primary text-white text-[9px] px-1.5 py-0 border-0 h-4">NEW</Badge>}
                    </div>
                    <p className={cn("text-sm leading-relaxed mb-2 truncate md:whitespace-normal", !notif.read ? "text-foreground/80 font-medium" : "text-muted-foreground")}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                       {notif.time} • {notif.type}
                    </div>
                  </div>

                  <div className="absolute top-5 right-5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteNotification(notif.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-border flex justify-center">
             <Button 
               variant="ghost" 
               onClick={() => navigate("/dashboard")}
               className="text-muted-foreground font-bold hover:text-foreground"
             >
               Back to Dashboard
             </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
