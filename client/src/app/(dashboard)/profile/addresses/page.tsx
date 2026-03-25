import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Plus, 
  Search, 
  MoreVertical, 
  Home, 
  Briefcase, 
  Heart, 
  Edit2, 
  Trash2, 
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAddresses, deleteAddress } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

export default function AddressBookPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses();
      setAddresses(data || []);
    } catch (err) {
      showToast("Failed to load addresses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this address?")) return;
    
    try {
      await deleteAddress(id);
      showToast("Address deleted successfully", "success");
      fetchAddresses();
    } catch (err) {
      showToast("Failed to delete address", "error");
    }
  };

  const filteredAddresses = addresses.filter(addr => 
    addr.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'home': return <Home className="w-5 h-5 text-primary" />;
      case 'office': return <Briefcase className="w-5 h-5 text-amber-600" />;
      case 'parents': return <Heart className="w-5 h-5 text-rose-500" />;
      default: return <MapPin className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold text-xs uppercase tracking-wider">Back to Profile</span>
              </button>
              <h1 className="text-4xl font-heading font-extrabold text-foreground tracking-tight">
                Address Book
              </h1>
              <p className="text-muted-foreground font-medium mt-1">
                Manage your pickup and delivery locations
              </p>
            </div>
            
            <Button 
              onClick={() => navigate('/profile/addresses/add')}
              className="h-12 px-6 bg-foreground text-white hover:bg-foreground/90 rounded-2xl shadow-lg shadow-foreground/10 font-bold transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add New Address
            </Button>
          </div>

          {/* Search & Stats */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search by name, address or label..." 
                className="h-14 pl-12 bg-white border-border/60 rounded-2xl shadow-sm focus:ring-primary/20"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20">
              <LoadingState message="Fetching your addresses..." />
            </div>
          ) : filteredAddresses.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAddresses.map((addr) => (
                <Card 
                  key={addr.id} 
                  className="group relative bg-white border-border/50 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/profile/addresses/edit/${addr.id}`)}
                >
                  {/* Glass Background Decor */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-border/40 group-hover:scale-110 transition-transform">
                        {getIcon(addr.type)}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg text-foreground">{addr.type}</h3>
                        {addr.isDefault && (
                          <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Default</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/addresses/edit/${addr.id}`);
                        }}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(addr.id, e)}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Recipient</p>
                      <p className="font-bold text-foreground">{addr.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Contact</p>
                      <p className="font-medium text-foreground">{addr.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Address</p>
                      <p className="text-sm font-medium text-foreground/80 leading-relaxed line-clamp-2">
                        {addr.address}, {addr.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border/40 flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> VERIFIED LOCATION
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-border/80 rounded-[3rem] p-16 text-center">
              <EmptyState 
                title={searchQuery ? "No matches found" : "Your Address Book is empty"} 
                description={searchQuery ? "Try searching with different keywords" : "Save frequently used addresses for faster bookings."} 
              />
              {!searchQuery && (
                <Button 
                  onClick={() => navigate('/profile/addresses/add')}
                  variant="outline"
                  className="mt-8 h-12 px-8 rounded-xl font-bold border-primary text-primary hover:bg-primary/5"
                >
                  Add Your First Address
                </Button>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
