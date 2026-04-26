import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Loader2, RefreshCw, ShieldCheck, Mail } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { verifyOtp as verifyOtpApi, loginUser } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

/**
 * BE3 — Day 11: Updated Verify OTP Page
 * Refactored to handle Email OTP verification.
 * Updated state from 'pending_phone' to 'pending_email'.
 */
export default function VerifyOtpPage() {
  const { showToast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [timer, setTimer] = useState(300); // 5 minutes
  const [isExpired, setIsExpired] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsExpired(true);
    }
  }, [timer]);

  useEffect(() => {
    const stored = sessionStorage.getItem('pending_email');
    if (stored) {
      setEmail(stored);
    } else {
      // If no pending email, redirect back to login
      navigate('/login');
    }
  }, [navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      await loginUser(email);
      setTimer(300);
      setIsExpired(false);
      showToast("A new verification code has been sent to your email.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to resend code", "error");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length < 6) {
      showToast("Please enter the full 6-digit code", "error");
      return;
    }

    setIsVerifying(true);
    try {
      const data = await verifyOtpApi(email, otpString);
      login(data.access_token);
      showToast("Verification successful!", "success");
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || "Invalid or expired code. Please try again.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center items-center px-4 pt-16">
        <div className="w-full max-w-md bg-card p-8 rounded-[2.5rem] border border-border shadow-xl text-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-8">
            <Mail className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl font-heading font-extrabold text-foreground mb-3">Check your email</h1>
          <p className="text-muted-foreground font-medium mb-10 px-4">
            We've sent a 6-digit verification code to <span className="text-foreground font-bold break-all">{email}</span>
          </p>
          
          <div className="space-y-8">
            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  className="w-12 h-14 bg-muted/50 border-2 border-border rounded-xl flex items-center justify-center font-bold text-2xl text-center focus:border-primary focus:bg-card outline-none transition-all"
                />
              ))}
            </div>

            <div className="pt-2">
              {isExpired ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="text-sm font-bold text-red-500 bg-red-500/10 py-2 px-4 rounded-lg inline-block border border-red-500/20">
                    This code has expired.
                  </p>
                  <Button 
                    onClick={handleResend} 
                    disabled={isResending}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                  >
                    {isResending ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                    Resend Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  <p className="text-sm font-medium text-muted-foreground">
                    Code expires in <span className="text-primary font-bold">{formatTime(timer)}</span>
                  </p>
                  <Button 
                    onClick={handleVerify}
                    disabled={isVerifying || otp.join("").length < 6}
                    className="w-full h-14 bg-primary text-white hover:bg-primary/90 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Log In"}
                  </Button>
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground font-medium">
              Didn't receive the code? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
