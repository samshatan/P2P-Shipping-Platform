import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";
import { MOCK_USER } from "@/lib/mockData";
import { Copy, Wallet, Share2, MessageCircle, Gift, Trophy, ShieldCheck, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { showToast } = useToast();
  const [walletBalance, setWalletBalance] = useState(MOCK_USER.wallet);
  const [rechargeAmt, setRechargeAmt] = useState("1000");
  const [isRecharging, setIsRecharging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile forms
  const [name, setName] = useState(MOCK_USER.name);
  const [phone, setPhone] = useState(MOCK_USER.phone);
  const [email, setEmail] = useState(MOCK_USER.email);

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast("Profile updated successfully!", "success");
    }, 1000);
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
    }, 2000);
  };

  const referralLink = "https://parcel.in/ref/RAHUL99";

  const handleCopyRef = () => {
    navigator.clipboard.writeText(referralLink);
    showToast("Referral link copied!", "success");
  };

  const handleShareRef = () => {
    window.open(`https://wa.me/?text=Get%20%E2%82%B9200%20shipping%20credit%20on%20PARCEL%3A%20${referralLink}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-extrabold text-foreground">Profile & Wallet</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Manage your personal details and account balance.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Col: Profile & Stats */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-white border-border shadow-sm rounded-2xl flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                     <Trophy className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-heading font-extrabold">{MOCK_USER.shipments}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Shipments</div>
                </Card>
                <Card className="p-4 bg-white border-border shadow-sm rounded-2xl flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-heading font-extrabold">₹{MOCK_USER.moneySaved}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Money Saved</div>
                </Card>
                <Card className="p-4 bg-white border-border shadow-sm rounded-2xl flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-2">
                     <Gift className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-heading font-extrabold">{MOCK_USER.referrals}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Referrals</div>
                </Card>
              </div>

              {/* Profile Editor */}
              <Card className="p-6 bg-white border-border shadow-sm rounded-2xl">
                <h3 className="font-heading font-bold text-xl mb-6 flex items-center justify-between border-b border-border/60 pb-4">
                  <span>Personal Details</span>
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
                      <Input value={phone} onChange={e => setPhone(e.target.value)} disabled className="h-12 bg-gray-100 rounded-xl text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground font-medium px-1">Phone number is tied to your identity.</p>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Email Address</Label>
                      <Input value={email} onChange={e => setEmail(e.target.value)} className="h-12 bg-gray-50/50 rounded-xl" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="h-12 px-8 bg-foreground hover:bg-foreground/90 text-white rounded-xl shadow-md transition-transform active:scale-95 font-semibold">
                      {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </Card>

            </div>

            {/* Right Col: Wallet & Referrals */}
            <div className="space-y-8">
              
              <Card className="p-6 bg-gradient-to-br from-tertiary to-[#8c3100] text-white border-0 shadow-lg shadow-tertiary/20 rounded-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[40px]"></div>
                 
                 <div className="flex items-center gap-2 mb-2 relative z-10 text-white/80 font-bold uppercase tracking-wider text-xs">
                   <Wallet className="w-4 h-4" /> PARCEL Wallet
                 </div>
                 
                 <div className="text-4xl font-heading font-extrabold relative z-10 mb-8">
                   ₹{walletBalance.toFixed(2)}
                 </div>

                 <div className="relative z-10 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                   <div className="text-sm font-semibold mb-3">Quick Top-up</div>
                   <div className="grid grid-cols-3 gap-2 mb-4">
                      {["500", "1000", "2000"].map(amt => (
                        <button 
                          key={amt} 
                          onClick={() => setRechargeAmt(amt)}
                          className={cn("py-2 rounded-lg text-sm font-bold border transition-colors", rechargeAmt === amt ? "bg-white text-tertiary border-white" : "border-white/30 hover:bg-white/10")}
                        >
                          ₹{amt}
                        </button>
                      ))}
                   </div>
                   <div className="flex relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-white/50">₹</span>
                     <Input 
                       type="number"
                       value={rechargeAmt}
                       onChange={e => setRechargeAmt(e.target.value)}
                       placeholder="Enter amount" 
                       className="pl-8 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-l-lg rounded-r-none focus-visible:ring-white/30" 
                     />
                     <Button onClick={handleRecharge} disabled={isRecharging || !rechargeAmt} className="h-12 rounded-l-none rounded-r-lg bg-white text-tertiary hover:bg-gray-100 font-bold px-6 shadow-sm">
                       {isRecharging ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                     </Button>
                   </div>
                 </div>
                 
                 <div className="flex justify-between items-center mt-4 relative z-10 text-[10px] font-bold uppercase tracking-wider text-white/50">
                   <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure</div>
                   <div className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> UPI/Card</div>
                 </div>
              </Card>

              {/* Refer and Earn */}
              <Card className="p-6 bg-white border-border shadow-sm rounded-2xl relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full blur-[20px]"></div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg">Refer & Earn</h3>
                    <p className="text-xs text-muted-foreground font-medium">Get ₹200 for every sign up.</p>
                  </div>
                </div>

                <div className="bg-muted/30 p-1 rounded-xl flex items-center border border-border/60">
                  <Input readOnly value={referralLink} className="h-10 bg-transparent border-0 text-xs font-mono font-medium focus-visible:ring-0 px-3 cursor-default" />
                  <Button onClick={handleCopyRef} variant="secondary" size="sm" className="h-8 shadow-none bg-white mr-1 text-xs">
                    Copy
                  </Button>
                </div>

                <Button onClick={handleShareRef} className="w-full h-12 mt-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Share via WhatsApp
                </Button>
              </Card>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
