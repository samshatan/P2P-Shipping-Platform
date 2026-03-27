import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function VerifyOtpPage() {
  const { showToast } = useToast();
  const [timer, setTimer] = useState(300); // 5 minutes
  const [isExpired, setIsExpired] = useState(false);
  const [isResending, setIsResending] = useState(false);

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
    setIsResending(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTimer(300);
    setIsExpired(false);
    setIsResending(false);
    showToast("A new OTP has been sent to your device.", "success");
  };

  const [phoneNumber, setPhoneNumber] = useState<string>("");

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
            {/* Input Placeholders (Simplified for UI task) */}
            <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-10 h-12 bg-gray-50 border border-border rounded-xl flex items-center justify-center font-bold text-xl">
                  {/* Mock input display */}
                </div>
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
                  <Button className="w-full h-12 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold transition-all active:scale-95">
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

