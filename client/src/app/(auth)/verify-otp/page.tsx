import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { verifyOtp as verifyOtpApi, loginUser } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function VerifyOtpPage() {
  const { showToast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [timer, setTimer] = useState(300); // 5 minutes
  const [isExpired, setIsExpired] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResend = async () => {
    if (!phoneNumber) return;
    setIsResending(true);
    try {
      await loginUser(phoneNumber);
      setTimer(300);
      setIsExpired(false);
      showToast("A new OTP has been sent to your device.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to resend OTP", "error");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length < 6) {
      showToast("Please enter the full 6-digit OTP", "error");
      return;
    }

    setIsVerifying(true);
    try {
      const data = await verifyOtpApi(phoneNumber, otpString);
      login(data.access_token);
      showToast("Verification successful!", "success");
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || "Invalid OTP. Please try again.", "error");
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

  useEffect(() => {
    const stored = sessionStorage.getItem('pending_phone');
    if (stored) {
      setPhoneNumber(stored);
    }
  }, []);

  const maskPhone = (phone: string) => {
    if (!phone) return "+91 XXXXX XXXXX";
    const masked = phone.substring(0, 2) + "XXX XX" + phone.substring(7);
    return `+91 ${masked}`;
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center items-center px-4 pt-16">
        <div className="w-full max-w-md bg-white p-8 rounded-[2rem] border border-border shadow-sm text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          
          <h1 className="text-3xl font-heading font-extrabold text-foreground mb-2">Verify OTP</h1>
          <p className="text-muted-foreground font-medium mb-8">
            Enter the 6-digit code sent to <span className="text-foreground font-bold">{maskPhone(phoneNumber)}</span>
          </p>
          
          <div className="space-y-6">
            <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
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
                  className="w-10 h-12 bg-gray-50 border border-border rounded-xl flex items-center justify-center font-bold text-xl text-center focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              ))}
            </div>

            <div className="pt-4">
              {isExpired ? (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                  <p className="text-sm font-bold text-rose-500 bg-rose-50 py-2 px-4 rounded-lg inline-block">
                    This OTP has expired.
                  </p>
                  <Button 
                    onClick={handleResend} 
                    disabled={isResending}
                    className="w-full h-12 bg-foreground hover:bg-foreground/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Resend OTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm font-medium text-muted-foreground">
                    Code expires in <span className="text-primary font-extrabold font-mono">{formatTime(timer)}</span>
                  </p>
                  <Button 
                    onClick={handleVerify}
                    disabled={isVerifying || otp.join("").length < 6}
                    className="w-full h-12 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Verify & Continue
                  </Button>
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground font-medium pt-4">
              Didn't receive the code? Check your spam or try again in {formatTime(timer)}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
