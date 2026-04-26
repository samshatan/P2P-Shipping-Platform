import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Package, ArrowRight, CheckCircle2, User, Building2, Mail, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { loginUser, registerUser, loginWithGoogle } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useAuth();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("USER");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; fullName?: string }>({});

  const validateDetails = (): boolean => {
    const newErrors: { email?: string; fullName?: string } = {};
    if (!fullName.trim()) {
      newErrors.fullName = role === "BUSINESS" ? "Company name is required" : "Full name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateDetails()) return;

    setIsLoading(true);
    try {
      await registerUser({
        name: fullName,
        email: email
      });
      
      await loginUser(email);
      sessionStorage.setItem('pending_email', email);
      showToast("Account created! Verification code sent to email.", "success");
      navigate('/verify-otp');
    } catch (err: any) {
      showToast(err.message || "Registration failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      login(data.access_token);
      showToast("Signed up and logged in with Google", "success");
      navigate('/');
    } catch (err: any) {
      showToast(err.message || "Failed to sign up with Google", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "48px",
    padding: "0 16px",
    fontSize: "15px",
    borderRadius: "12px",
    border: "1.5px solid hsl(var(--border))",
    backgroundColor: "hsl(var(--card))",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    color: "hsl(var(--foreground))",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Pane */}
      <div className="hidden md:flex flex-col w-1/3 bg-slate-900 border-r border-border p-12 justify-between text-white">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight">
            PARCEL<span className="text-primary">.</span>
          </span>
        </Link>

        <div className="space-y-12">
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all", step >= 1 ? "bg-primary text-white" : "bg-white/10 text-white/40")}>
                {step > 1 ? <CheckCircle2 className="w-6 h-6" /> : 1}
              </div>
              <div className="w-0.5 h-12 bg-white/10 mt-2"></div>
            </div>
            <div>
              <h4 className="font-bold text-lg">Account Type</h4>
              <p className="text-sm text-white/50">Personal or Business shipping</p>
            </div>
          </div>
          
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all", step >= 2 ? "bg-primary text-white" : "bg-white/10 text-white/40")}>
                2
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg">Your Profile</h4>
              <p className="text-sm text-white/50">Basic identification details</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/30">© {new Date().getFullYear()} PARCEL Intelligence.</p>
      </div>

      {/* Right Form Pane */}
      <div className="flex-1 flex flex-col items-center p-6 justify-center bg-background">
        <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-3xl shadow-xl border border-border/60">
          
          {step === 1 ? (
            <div className="space-y-8">
              <div>
                <h2 className="font-heading text-3xl font-bold">Get Started</h2>
                <p className="text-muted-foreground mt-2">Choose your account type to continue.</p>
              </div>

              <div className="space-y-4">
                <button onClick={() => setRole("USER")} className={clsx("w-full text-left p-6 rounded-2xl border-2 transition-all flex items-start gap-4", role === "USER" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                  <div className={clsx("p-3 rounded-xl", role === "USER" ? "bg-primary text-white" : "bg-muted")}><User className="w-6 h-6" /></div>
                  <div><h3 className="font-bold">Individual</h3><p className="text-sm text-muted-foreground mt-1">Occasional shipping for personal use.</p></div>
                </button>
                <button onClick={() => setRole("BUSINESS")} className={clsx("w-full text-left p-6 rounded-2xl border-2 transition-all flex items-start gap-4", role === "BUSINESS" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                  <div className={clsx("p-3 rounded-xl", role === "BUSINESS" ? "bg-primary text-white" : "bg-muted")}><Building2 className="w-6 h-6" /></div>
                  <div><h3 className="font-bold">Business</h3><p className="text-sm text-muted-foreground mt-1">Bulk shipping and commercial features.</p></div>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-4 text-muted-foreground font-semibold">Or fast sign up with</span></div>
              </div>

              <div className="flex justify-center w-full">
                <GoogleLogin onSuccess={onGoogleSuccess} onError={() => showToast("Google signup failed", "error")} theme="outline" shape="pill" size="large" width="384px" />
              </div>

              <Button onClick={() => setStep(2)} className="w-full h-14 rounded-2xl bg-primary text-lg font-bold shadow-lg shadow-primary/20">
                Continue <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="font-heading text-3xl font-bold">Your Details</h2>
                <p className="text-muted-foreground mt-2">Almost there! Complete your profile.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{role === "BUSINESS" ? "Company Name" : "Full Name"}</Label>
                  <div className="relative">
                    <User className={clsx("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4", errors.fullName ? "text-red-500" : "text-muted-foreground")} />
                    <input
                      placeholder={role === "BUSINESS" ? "Acme Corp" : "John Doe"}
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setErrors(prev => ({ ...prev, fullName: undefined })); }}
                      style={{ ...inputStyle, paddingLeft: "44px", borderColor: errors.fullName ? "red" : "hsl(var(--border))" }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Email Address</Label>
                  <div className="relative">
                    <Mail className={clsx("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4", errors.email ? "text-red-500" : "text-muted-foreground")} />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                      style={{ ...inputStyle, paddingLeft: "44px", borderColor: errors.email ? "red" : "hsl(var(--border))" }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="h-14 rounded-2xl flex-1 font-bold">Back</Button>
                <Button onClick={handleRegister} disabled={isLoading} className="h-14 rounded-2xl flex-[2] bg-primary text-white font-bold shadow-lg shadow-primary/20">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
