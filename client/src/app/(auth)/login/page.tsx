import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Package, Smartphone, Mail, Loader2, AlertCircle } from "lucide-react";
import { loginUser, verifyOtp as verifyOtpApi, loginWithGoogle } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  
  const [timer, setTimer] = useState(45);
  const [otpSent, setOtpSent] = useState(false);
  const [activeTab, setActiveTab] = useState<"mobile" | "email">("mobile");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTouched, setOtpTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePhone = (val: string) => {
    if (!val) return "Phone number is required";
    if (!/^\d{10}$/.test(val)) return "Enter valid 10-digit phone number";
    return null;
  };

  const validateOtp = (val: string[]) => {
    if (val.some(v => !v)) return "Enter valid OTP";
    if (val.join("").length !== 6) return "Enter valid OTP";
    return null;
  };

  const isPhoneValid = !validatePhone(phone);
  const isOtpValid = !validateOtp(otp);

  useEffect(() => {
    let interval: any;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSendOtp = async () => {
    setPhoneTouched(true);
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await loginUser(phone);
      setOtpSent(true);
      setTimer(45);
      showToast("OTP sent successfully", "success");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
      showToast("Failed to send OTP", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpTouched(true);
    const otpString = otp.join("");
    const otpError = validateOtp(otp);
    if (otpError) {
      setError(otpError);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await verifyOtpApi(phone, otpString);
      login(data.access_token);
      showToast("Logged in successfully", "success");
      navigate('/');
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
      showToast("Invalid OTP", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const data = await loginWithGoogle();
      login(data.access_token);
      showToast("Logged in successfully", "success");
      navigate('/');
    } catch (err: any) {
      showToast(err.message || "Failed to log in", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (error) setError(null);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleBlur = (field: 'phone' | 'otp') => {
    if (field === 'phone') {
      setPhoneTouched(true);
      setError(validatePhone(phone));
    } else {
      setOtpTouched(true);
      setError(validateOtp(otp));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "48px",
    padding: "0 16px",
    fontSize: "15px",
    borderRadius: "12px",
    border: "1.5px solid #d1d5db",
    backgroundColor: "#ffffff",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    color: "#1a1a1a",
  };

  const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#a33900";
    e.target.style.boxShadow = "0 0 0 3px rgba(163, 57, 0, 0.1)";
  };

  const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#d1d5db";
    e.target.style.boxShadow = "none";
  };

  const otpInputStyle: React.CSSProperties = {
    width: "48px",
    height: "56px",
    textAlign: "center" as const,
    fontSize: "20px",
    fontWeight: 700,
    borderRadius: "12px",
    border: "1.5px solid #d1d5db",
    backgroundColor: "#ffffff",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    color: "#1a1a1a",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Illustration Pane (Navy) */}
      <div className="hidden md:flex flex-col flex-1 bg-secondary text-white p-12 justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
        
        <Link to="/" className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
            PARCEL<span className="text-primary">.</span>
          </span>
        </Link>
        
        <div className="relative z-10 max-w-md">
          <h2 className="font-heading font-bold text-4xl mb-6 leading-tight">
            Start comparing rates from 10+ partners instantly.
          </h2>
          <p className="text-secondary-foreground/80 text-lg">
            Join 50,000+ businesses saving up to 40% on shipping costs using our AI-driven intelligence platform.
          </p>
          
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[
                "https://randomuser.me/api/portraits/men/32.jpg",
                "https://randomuser.me/api/portraits/women/44.jpg",
                "https://randomuser.me/api/portraits/men/68.jpg",
                "https://randomuser.me/api/portraits/women/65.jpg"
              ].map((imgSrc, i) => (
                <img 
                  key={i} 
                  src={imgSrc} 
                  alt="Trusted User" 
                  className="w-10 h-10 rounded-full border-2 border-secondary object-cover shadow-sm"
                />
              ))}
            </div>
            <div className="text-sm font-medium text-white/80">Trusted by top sellers</div>
          </div>
        </div>
      </div>

      {/* Right Form Pane */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center md:text-left">
            <h1 className="font-heading text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-2">Log in to your PARCEL dashboard</p>
          </div>

          {/* Custom Tab Switcher */}
          <div style={{ width: "100%" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px",
              padding: "4px",
              borderRadius: "12px",
              backgroundColor: "hsl(var(--muted) / 0.5)",
              marginBottom: "32px",
            }}>
              <button
                onClick={() => setActiveTab("mobile")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor: activeTab === "mobile" ? "#ffffff" : "transparent",
                  boxShadow: activeTab === "mobile" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  color: activeTab === "mobile" ? "#1a1a1a" : "#6b7280",
                }}
              >
                <Smartphone style={{ width: 16, height: 16 }} /> Phone
              </button>
              <button
                onClick={() => setActiveTab("email")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor: activeTab === "email" ? "#ffffff" : "transparent",
                  boxShadow: activeTab === "email" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  color: activeTab === "email" ? "#1a1a1a" : "#6b7280",
                }}
              >
                <Mail style={{ width: 16, height: 16 }} /> Email
              </button>
            </div>

            {/* Phone Tab Content */}
            {activeTab === "mobile" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {!otpSent ? (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {error && (
                        <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100 mb-2">
                          <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                      )}
                      <Label style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Mobile Number</Label>
                      <div style={{ position: "relative", width: "100%" }}>
                        <span style={{
                          position: "absolute",
                          left: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#6b7280",
                          fontSize: "15px",
                          fontWeight: 500,
                          pointerEvents: "none",
                        }}>+91</span>
                        <input
                          placeholder="98765 43210"
                          type="tel"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setPhone(val);
                            if (error) setError(null);
                          }}
                          style={{ 
                            ...inputStyle, 
                            paddingLeft: "52px",
                            borderColor: phoneTouched && validatePhone(phone) ? "#ef4444" : "#d1d5db"
                          }}
                          onFocus={inputFocusHandler}
                          onBlur={() => handleBlur('phone')}
                        />
                      </div>
                      {phoneTouched && validatePhone(phone) && (
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1">
                          {validatePhone(phone)}
                        </p>
                      )}
                    </div>
                    <Button
                      className="w-full h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 text-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSendOtp}
                      disabled={isLoading || (phoneTouched && !isPhoneValid)}
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
                    </Button>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Label style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Enter 6-digit OTP</Label>
                        <button onClick={() => { setOtpSent(false); setError(null); }} className="text-xs text-primary font-semibold hover:underline" style={{ background: "none", border: "none", cursor: "pointer" }}>Change Number</button>
                      </div>
                      
                      {error && (
                        <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100 mb-2">
                          <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            id={`otp-${i}`}
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            style={{
                              ...otpInputStyle,
                              borderColor: otpTouched && validateOtp(otp) ? "#ef4444" : "#d1d5db"
                            }}
                            onFocus={inputFocusHandler}
                            onBlur={() => i === 5 && handleBlur('otp')}
                            autoFocus={i === 0}
                          />
                        ))}
                      </div>
                      {otpTouched && validateOtp(otp) && (
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-center mt-2">
                          {validateOtp(otp)}
                        </p>
                      )}
                      <p style={{ fontSize: "14px", color: "#6b7280", textAlign: "center", marginTop: "12px" }}>
                        {timer > 0 ? (
                          <>Resend code in <span style={{ fontWeight: 600, color: "#1a1a1a" }}>00:{timer < 10 ? `0${timer}` : timer}</span></>
                        ) : (
                          <button onClick={handleSendOtp} className="text-primary font-bold hover:underline">Resend OTP Now</button>
                        )}
                      </p>
                    </div>
                    <Button 
                      onClick={handleVerifyOtp} 
                      disabled={isLoading || (otpTouched && !isOtpValid)}
                      className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Log In"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Email Tab Content */}
            {activeTab === "email" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Label style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Email Address</Label>
                  <input
                    placeholder="name@company.com"
                    type="email"
                    style={inputStyle}
                    onFocus={inputFocusHandler}
                    onBlur={inputBlurHandler}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Label style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Password</Label>
                    <Link to="#" className="text-xs text-primary font-semibold hover:underline">Forgot password?</Link>
                  </div>
                  <input
                    placeholder="••••••••"
                    type="password"
                    style={inputStyle}
                    onFocus={inputFocusHandler}
                    onBlur={inputBlurHandler}
                  />
                </div>
                <Button onClick={handleGoogleLogin} disabled={isLoading} className="w-full h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 text-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
                </Button>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-semibold">Or continue with</span>
            </div>
          </div>

          <Button onClick={handleGoogleLogin} disabled={isLoading} variant="outline" className="w-full h-12 bg-white rounded-xl font-medium border-border/80 text-foreground hover:bg-muted/50 transition-colors">
            {isLoading ? <Loader2 className="w-5 h-5 mr-3 animate-spin text-muted-foreground" /> : (
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            )}
            Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
