import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";
import { getUserProfile, updateUserProfile, getAddresses, addAddress, deleteAddress } from "@/lib/api";
import { Copy, Wallet, Share2, MessageCircle, Gift, Trophy, ShieldCheck, CreditCard, Loader2, MapPin, Plus, Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Profile state
  const [profile, setProfile] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Address state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: "", phone: "", address: "", pincode: "", city: "", state: "" });

  // Wallet state (Internal for UI, though usually API driven)
  const [walletBalance, setWalletBalance] = useState(1240.50);
  const [rechargeAmt, setRechargeAmt] = useState("1000");
  const [isRecharging, setIsRecharging] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [uProfile, uAddresses] = await Promise.all([
        getUserProfile(),
        getAddresses()
      ]);
      setProfile(uProfile);
      setName(uProfile.name || "");
      setEmail(uProfile.email || "");
      setAddresses(uAddresses || []);
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await updateUserProfile({ name, email });
      showToast("Profile updated successfully!", "success");
      setProfile({ ...profile, name, email });
    } catch (err: any) {
      showToast(err.message || "Update failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddr.name || !newAddr.phone || !newAddr.address || !newAddr.pincode) {
      showToast("Please fill all required fields", "error");
      return;
    }
    try {
      setIsAddingAddress(true);
      const added = await addAddress({ ...newAddr, is_default: addresses.length === 0 });
      setAddresses([added, ...addresses]);
      setNewAddr({ name: "", phone: "", address: "", pincode: "", city: "", state: "" });
      showToast("Address added successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to add address", "error");
    } finally {
      setIsAddingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      showToast("Address removed", "success");
    } catch (err: any) {
      showToast("Failed to delete address", "error");
    }
  };

  const handleRecharge = () => {
    const amt = parseInt(rechargeAmt) || 0;
    if (amt < 100) {
      showToast("Minimum recharge is ₹100", "error");
      return;
    }
    setIsRecharging(true);
    setTimeout(() => {
      setIsRecharging(false);
      setWalletBalance(prev => prev + amt);
      setRechargeAmt("");
      showToast(`Wallet Recharged! ₹${amt} added.`, "success");
    }, 1500);
  };

  const referralLink = "https://parcel.in/ref/RAHUL99";

  if (loading) return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <LoadingState message="Fetching your profile..." />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <ErrorState message={error} onRetry={fetchData} title="Profile Error" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-extrabold text-foreground">Account Settings</h1>
              <p className="text-muted-foreground mt-1 text-sm font-medium">Manage your personal details, addresses, and wallet balance.</p>
            </div>
            <div className="flex p-1 bg-white border border-border shadow-sm rounded-xl">
              <button 
                onClick={() => setActiveTab('profile')}
                className={cn("px-4 py-2 text-sm font-bold rounded-lg transition-all", activeTab === 'profile' ? "bg-foreground text-white shadow-md" : "text-muted-foreground hover:bg-muted")}
              >
                Profile & Wallet
              </button>
              <button 
                onClick={() => setActiveTab('addresses')}
                className={cn("px-4 py-2 text-sm font-bold rounded-lg transition-all", activeTab === 'addresses' ? "bg-foreground text-white shadow-md" : "text-muted-foreground hover:bg-muted")}
              >
                Address Book
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Col: Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {activeTab === 'profile' ? (
                <>
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-white border-border shadow-sm rounded-2xl flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                         <Trophy className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-heading font-extrabold">{profile?.shipments_count || 0}</div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Shipments</div>
                    </Card>
                    <Card className="p-4 bg-white border-border shadow-sm rounded-2xl flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                         <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-heading font-extrabold">₹{(profile?.money_saved || 0).toFixed(0)}</div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Money Saved</div>
                    </Card>
                    <Card className="p-4 bg-white border-border shadow-sm rounded-2xl flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
                      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-2">
                         <Gift className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-heading font-extrabold">12</div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Referrals</div>
                    </Card>
                  </div>

                  {/* Profile Editor */}
                  <Card className="p-6 bg-white border-border shadow-sm rounded-2xl">
                    <h3 className="font-heading font-bold text-xl mb-6 flex items-center justify-between border-b border-border/60 pb-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <User className="w-5 h-5 text-primary" />
                        <span>Personal Details</span>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 uppercase text-[10px] px-2 py-0 border-0">KYC Verified</Badge>
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input value={name} onChange={e => setName(e.target.value)} className="h-12 bg-gray-50/50 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <Input value={profile?.phone || ""} disabled className="h-12 bg-gray-100 rounded-xl text-muted-foreground" />
                          <p className="text-[10px] text-muted-foreground font-medium px-1 uppercase tracking-tight">Verified & Locked to Profile</p>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Email Address</Label>
                          <Input value={email} onChange={e => setEmail(e.target.value)} className="h-12 bg-gray-50/50 rounded-xl" />
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4 border-t border-border/40 mt-6">
                        <Button onClick={handleSaveProfile} disabled={isSaving} className="h-12 px-8 bg-foreground hover:bg-foreground/90 text-white rounded-xl shadow-md transition-all active:scale-95 font-semibold">
                          {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="p-6 bg-white border-border shadow-sm rounded-2xl">
                    <div className="flex items-center justify-between mb-8 border-b border-border/60 pb-4">
                      <h3 className="font-heading font-bold text-xl flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" /> Saved Addresses
                      </h3>
                      <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">{addresses.length} Saved</Badge>
                    </div>

                    <div className="space-y-6">
                      {/* Add New Address Form */}
                      <div className="bg-[#f7f9fb] p-6 rounded-[1.5rem] border border-dashed border-primary/30 relative">
                        <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-primary">Add New Address</h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Input placeholder="Full Name" value={newAddr.name} onChange={e => setNewAddr({...newAddr, name: e.target.value})} className="h-11 bg-white" />
                          <Input placeholder="Mobile" value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone: e.target.value})} className="h-11 bg-white" />
                          <Input placeholder="Flat, Area, Landmark" value={newAddr.address} onChange={e => setNewAddr({...newAddr, address: e.target.value})} className="h-11 bg-white sm:col-span-2" />
                          <Input placeholder="Pincode" value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode: e.target.value})} className="h-11 bg-white" />
                          <Button onClick={handleAddAddress} disabled={isAddingAddress} className="h-11 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold">
                            {isAddingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Save Address</>}
                          </Button>
                        </div>
                      </div>

                      {/* Address List */}
                      <div className="space-y-4">
                        {addresses.length === 0 ? (
                          <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4 opacity-40">
                              <MapPin className="w-8 h-8" />
                            </div>
                            <p className="text-muted-foreground font-medium italic">No saved addresses yet.</p>
                          </div>
                        ) : (
                          addresses.map(addr => (
                            <div key={addr.id} className="group p-5 bg-white border border-border/80 rounded-2xl shadow-sm hover:border-primary/30 transition-all flex items-start gap-4 hover:shadow-md">
                              <div className="w-10 h-10 bg-muted/40 text-muted-foreground rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                <MapPin className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-foreground">{addr.name}</h4>
                                  {addr.is_default && <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-[10px] py-0 border-0 h-4">Default</Badge>}
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed truncate">{addr.address}</p>
                                <p className="text-[11px] font-bold text-muted-foreground mt-1 uppercase tracking-wide">
                                  {addr.city}, {addr.state} • {addr.pincode} • {addr.phone}
                                </p>
                              </div>
                              <button onClick={() => handleDeleteAddress(addr.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </Card>
                </>
              )}

            </div>

            {/* Right Col: Wallet & Referrals */}
            <div className="space-y-8">
              
              <Card className="p-6 bg-gradient-to-br from-tertiary to-[#8c3100] text-white border-0 shadow-lg shadow-tertiary/20 rounded-[1.8rem] relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[40px]"></div>
                 
                 <div className="flex items-center gap-2 mb-2 relative z-10 text-white/80 font-bold uppercase tracking-wider text-[10px]">
                   <Wallet className="w-4 h-4" /> PARCEL Wallet
                 </div>
                 
                 <div className="text-5xl font-heading font-extrabold relative z-10 mb-8 tracking-tighter">
                   ₹{walletBalance.toFixed(2)}
                 </div>

                 <div className="relative z-10 bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/20">
                   <div className="text-sm font-semibold mb-4">Quick Top-up</div>
                   <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 mb-5">
                      {["500", "1000", "2000"].map(amt => (
                        <button 
                          key={amt} 
                          onClick={() => setRechargeAmt(amt)}
                          className={cn("py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all active:scale-95", rechargeAmt === amt ? "bg-white text-tertiary border-white" : "border-white/30 hover:bg-white/10")}
                        >
                          ₹{amt}
                        </button>
                      ))}
                   </div>
                   <div className="flex relative items-center gap-2">
                     <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-white/50 text-sm">₹</span>
                        <Input 
                          type="number"
                          value={rechargeAmt}
                          onChange={e => setRechargeAmt(e.target.value)}
                          placeholder="Amount" 
                          className="pl-8 h-12 bg-white/15 border-white/20 text-white placeholder:text-white/40 rounded-xl focus-visible:ring-white/30 font-bold" 
                        />
                     </div>
                     <Button onClick={handleRecharge} disabled={isRecharging || !rechargeAmt} className="h-12 rounded-xl bg-white text-tertiary hover:bg-gray-100 font-bold px-6 shadow-md transition-all active:scale-95">
                       {isRecharging ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fuel"}
                     </Button>
                   </div>
                 </div>
                 
                 <div className="flex justify-between items-center mt-5 relative z-10 text-[9px] font-bold uppercase tracking-widest text-white/50">
                   <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Encrypted</div>
                   <div className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> UPI/Direct</div>
                 </div>
              </Card>

              {/* Refer and Earn */}
              <Card className="p-6 bg-white border-border shadow-sm rounded-3xl relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full blur-[20px]"></div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg leading-tight">Refer & Win</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Get ₹200 for every signup.</p>
                  </div>
                </div>

                <div className="bg-muted/30 p-1 rounded-xl flex items-center border border-border/60">
                  <Input readOnly value={referralLink} className="h-10 bg-transparent border-0 text-[10px] font-mono font-bold focus-visible:ring-0 px-3 cursor-default" />
                  <Button onClick={() => { navigator.clipboard.writeText(referralLink); showToast("Copied!", "success"); }} variant="secondary" size="sm" className="h-8 shadow-sm bg-white mr-1 text-[10px] font-bold">
                    Copy
                  </Button>
                </div>

                <Button onClick={() => window.open(`https://wa.me/?text=Shipping%20made%20easy.%20Use%20PARCEL%20to%20get%20best%20rates!%20${referralLink}`)} className="w-full h-12 mt-5 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95">
                  <MessageCircle className="w-5 h-5" /> Share WhatsApp
                </Button>
              </Card>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
