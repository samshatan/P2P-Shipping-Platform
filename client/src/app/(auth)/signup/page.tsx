import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, ArrowRight, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("USER"); // USER or BUSINESS

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Pane */}
      <div className="hidden md:flex flex-col w-1/3 bg-white border-r border-border p-8 justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#a33900] to-[#cc4900] rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-foreground">
            PARCEL<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Wizard Steps */}
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors", step >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : 1}
              </div>
              <div className="w-0.5 h-full bg-border mt-2"></div>
            </div>
            <div className="pb-8">
              <h4 className="font-semibold text-foreground">Account Type</h4>
              <p className="text-sm text-muted-foreground">Select how you'll use PARCEL</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors", step >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : 2}
              </div>
              <div className="w-0.5 h-full bg-border mt-2"></div>
            </div>
            <div className="pb-8">
              <h4 className="font-semibold text-foreground">Basic Details</h4>
              <p className="text-sm text-muted-foreground">Name, Email, and Password</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors", step >= 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                3
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Phone Verification</h4>
              <p className="text-sm text-muted-foreground">Quick OTP verification</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} PARCEL Intelligence.
        </p>
      </div>

      {/* Right Form Pane */}
      <div className="flex-1 flex flex-col items-center p-6 justify-center bg-[#f7f9fb]">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-border/60">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="font-heading text-2xl font-bold">Welcome to PARCEL</h2>
                <p className="text-muted-foreground mt-1 text-sm">How are you planning to use the platform?</p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setRole("USER")}
                  className={clsx("w-full text-left p-4 rounded-xl border-2 transition-all", role === "USER" ? "border-primary bg-primary/5" : "border-border hover:border-border/80")}
                >
                  <h3 className="font-semibold text-foreground">Individual Sender</h3>
                  <p className="text-sm text-muted-foreground mt-1">For personal shipping, occasional parcels, and gifting.</p>
                </button>
                <button 
                  onClick={() => setRole("BUSINESS")}
                  className={clsx("w-full text-left p-4 rounded-xl border-2 transition-all", role === "BUSINESS" ? "border-primary bg-primary/5" : "border-border hover:border-border/80")}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-foreground">Business / D2C Brand</h3>
                    <span className="bg-tertiary/10 text-tertiary text-[10px] font-bold px-2 py-0.5 rounded uppercase">B2B Rates</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">For bulk shipping, COD remittance, and analytics.</p>
                </button>
              </div>

              <Button onClick={() => setStep(2)} className="w-full h-12 rounded-xl bg-foreground hover:bg-foreground/90 text-white font-semibold">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="font-heading text-2xl font-bold">Your Details</h2>
                <p className="text-muted-foreground mt-1 text-sm">Let's set up your profile.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name / Company Name</Label>
                  <Input placeholder="John Doe" className="h-12 bg-gray-50/50 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input placeholder="name@example.com" type="email" className="h-12 bg-gray-50/50 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input placeholder="••••••••" type="password" className="h-12 bg-gray-50/50 rounded-xl" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="h-12 rounded-xl flex-1">Back</Button>
                <Button onClick={() => setStep(3)} className="h-12 rounded-xl flex-[2] bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shadow-primary/20">
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="font-heading text-2xl font-bold">Secure your account</h2>
                <p className="text-muted-foreground mt-1 text-sm">We'll send a 6-digit OTP to verify your mobile.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <div className="flex relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">+91</span>
                    <Input placeholder="98765 43210" className="pl-12 h-12 bg-gray-50/50 rounded-xl" type="tel" maxLength={10} />
                  </div>
                </div>

                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm flex gap-2 items-start">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p>Your Aadhaar KYC will be linked to this number for seamless verification later.</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="h-12 rounded-xl flex-1 ">Back</Button>
                  <Button onClick={() => navigate('/dashboard')} className="h-12 rounded-xl flex-[2] bg-gradient-to-r from-[#a33900] to-[#cc4900] text-white font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                    Send OTP & Finish
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
             <p className="text-center text-sm text-muted-foreground mt-8">
               Already have an account?{" "}
               <Link to="/login" className="text-primary font-semibold hover:underline">
                 Log In
               </Link>
             </p>
          )}

        </div>
      </div>
    </div>
  );
}
