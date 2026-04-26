import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Package, Mail, Loader2, AlertCircle, ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";
import { loginUser, loginWithGoogle } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { GoogleLogin } from '@react-oauth/google';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    if (!val) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Enter a valid email address";
    return null;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await loginUser(email);
      sessionStorage.setItem('pending_email', email);
      showToast("Verification code sent to your email", "success");
      navigate('/verify-otp');
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
      showToast("Failed to send code", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      login(data.access_token);
      showToast("Logged in successfully", "success");
      navigate('/');
    } catch (err: any) {
      showToast(err.message || "Failed to log in with Google", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleError = () => {
    showToast("Google login failed", "error");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Left Pane: Branding & Value Prop */}
      <div className="hidden md:flex flex-col w-[40%] bg-slate-950 text-white p-12 justify-between relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(163,57,0,0.15),transparent)] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http=\'//www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 rotate-3">
            <Package className="w-7 h-7 text-white" />
          </div>
          <span className="font-heading font-extrabold text-3xl tracking-tight text-white">
            PARCEL<span className="text-primary">.</span>
          </span>
        </Link>
        
        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-headline font-black text-5xl leading-[0.95] tracking-tighter uppercase italic mb-6">
              Accelerate <br/>
              <span className="text-primary">Your Reach.</span>
            </h2>
            <p className="text-white/60 text-lg font-medium leading-relaxed max-w-sm">
              The unified logistics protocol for modern commerce. Compare, ship, and scale with AI-driven intelligence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 pt-8 border-t border-white/10">
            {[
              { icon: Zap, text: "Instant Spot Rates" },
              { icon: ShieldCheck, text: "Evidence-Backed Security" },
              { icon: Globe, text: "Global Network Coverage" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/50 transition-all">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-bold tracking-wide text-white/80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
          SwiftRoute Protocol © 2024
        </div>
      </div>

      {/* Right Pane: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 bg-background relative overflow-hidden">
        {/* Mobile Logo */}
        <div className="md:hidden absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
           <Package className="w-8 h-8 text-primary" />
           <span className="font-heading font-extrabold text-2xl tracking-tight">PARCEL<span className="text-primary">.</span></span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="text-center md:text-left space-y-3">
            <h1 className="font-headline font-black text-4xl tracking-tighter text-foreground uppercase">Welcome Back</h1>
            <p className="text-muted-foreground font-medium">Log in to access your shipping control center.</p>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    className={cn(
                      "w-full h-14 pl-12 pr-4 bg-surface-container-low border border-border/50 rounded-2xl font-bold text-foreground placeholder:text-muted-foreground/30",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                      error && "border-rose-500 ring-rose-500/20"
                    )}
                    required
                  />
                </div>
                {error && (
                  <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {error}
                  </p>
                )}
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all uppercase tracking-widest italic group"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-background px-4 text-muted-foreground">Neural Auth Engine</span>
              </div>
            </div>

            <div className="flex justify-center w-full">
              <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:border-primary/30 transition-all">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={onGoogleError}
                  useOneTap
                  theme="outline"
                  shape="rectangular"
                  size="large"
                  width="100%"
                />
              </div>
            </div>
          </div>

          <p className="text-center text-sm font-medium text-muted-foreground">
            Don't have a protocol account?{" "}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Initialize Account
            </Link>
          </p>
        </motion.div>
        
        {/* Background Glow */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      </div>
    </div>
  );
}
