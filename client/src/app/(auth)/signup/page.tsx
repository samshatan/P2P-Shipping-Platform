import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Package, ArrowRight, CheckCircle2, User, Building2, Smartphone, Mail, Lock, Eye, EyeOff, AtSign, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { loginUser, registerUser } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("USER");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; username?: string; fullName?: string; phone?: string }>({});
  const { showToast } = useToast();

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

  const validateStep2 = (): boolean => {
    const newErrors: { email?: string; username?: string; fullName?: string } = {};
    if (!fullName.trim()) {
      newErrors.fullName = role === "BUSINESS" ? "Company name is required" : "Full name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep2Next = () => {
    if (validateStep2()) {
      setStep(3);
    }
  };

  const getInputErrorStyle = (field: "email" | "username" | "fullName"): React.CSSProperties => {
    if (errors[field]) {
      return { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)" };
    }
    return {};
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Pane - Progress Sidebar */}
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
          
          {/* Step 1: Account Type */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h2 className="font-heading text-2xl font-bold">Welcome to PARCEL</h2>
                <p className="text-muted-foreground mt-1 text-sm">How are you planning to use the platform?</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <button 
                  onClick={() => setRole("USER")}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "20px",
                    borderRadius: "14px",
                    border: role === "USER" ? "2px solid #a33900" : "2px solid #e5e7eb",
                    backgroundColor: role === "USER" ? "rgba(163, 57, 0, 0.04)" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                  }}
                >
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: role === "USER" ? "linear-gradient(135deg, #a33900, #cc4900)" : "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <User style={{ width: 22, height: 22, color: role === "USER" ? "#fff" : "#6b7280" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>Individual Sender</h3>
                    <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>For personal shipping, occasional parcels, and gifting.</p>
                  </div>
                </button>

                <button 
                  onClick={() => setRole("BUSINESS")}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "20px",
                    borderRadius: "14px",
                    border: role === "BUSINESS" ? "2px solid #a33900" : "2px solid #e5e7eb",
                    backgroundColor: role === "BUSINESS" ? "rgba(163, 57, 0, 0.04)" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                  }}
                >
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: role === "BUSINESS" ? "linear-gradient(135deg, #a33900, #cc4900)" : "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Building2 style={{ width: 22, height: 22, color: role === "BUSINESS" ? "#fff" : "#6b7280" }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>Business / D2C Brand</h3>
                      <span style={{
                        background: "rgba(163, 57, 0, 0.08)",
                        color: "#a33900",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}>B2B Rates</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>For bulk shipping, COD remittance, and analytics.</p>
                  </div>
                </button>
              </div>

              <Button onClick={() => setStep(2)} className="w-full h-12 rounded-xl bg-foreground hover:bg-foreground/90 text-white font-semibold">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Log In
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Basic Details */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h2 className="font-heading text-2xl font-bold">Your Details</h2>
                <p className="text-muted-foreground mt-1 text-sm">Let's set up your profile.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                 <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <Label style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    {role === "BUSINESS" ? "Company Name" : "Full Name"} <span style={{ color: "#ef4444" }}>*</span>
                  </Label>
                  <div style={{ position: "relative", width: "100%" }}>
                    <User style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 18,
                      height: 18,
                      color: errors.fullName ? "#ef4444" : "#9ca3af",
                      pointerEvents: "none",
                    }} />
                    <input
                      placeholder={role === "BUSINESS" ? "Acme Corp" : "John Doe"}
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setErrors(prev => ({ ...prev, fullName: undefined })); }}
                      style={{ ...inputStyle, paddingLeft: "44px", ...getInputErrorStyle("fullName") }}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                      required
                    />
                  </div>
                  {errors.fullName && (
                    <p style={{ fontSize: "12px", color: "#ef4444", margin: 0 }}>{errors.fullName}</p>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <Label style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    Username <span style={{ color: "#ef4444" }}>*</span>
                  </Label>
                  <div style={{ position: "relative", width: "100%" }}>
                    <AtSign style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 18,
                      height: 18,
                      color: errors.username ? "#ef4444" : "#9ca3af",
                      pointerEvents: "none",
                    }} />
                    <input
                      placeholder="johndoe_42"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setErrors(prev => ({ ...prev, username: undefined })); }}
                      style={{ ...inputStyle, paddingLeft: "44px", ...getInputErrorStyle("username") }}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                      required
                    />
                  </div>
                  {errors.username && (
                    <p style={{ fontSize: "12px", color: "#ef4444", margin: 0 }}>{errors.username}</p>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <Label style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    Email Address <span style={{ color: "#ef4444" }}>*</span>
                  </Label>
                  <div style={{ position: "relative", width: "100%" }}>
                    <Mail style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 18,
                      height: 18,
                      color: errors.email ? "#ef4444" : "#9ca3af",
                      pointerEvents: "none",
                    }} />
                    <input
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                      style={{ ...inputStyle, paddingLeft: "44px", ...getInputErrorStyle("email") }}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p style={{ fontSize: "12px", color: "#ef4444", margin: 0 }}>{errors.email}</p>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <Label style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Password</Label>
                  <div style={{ position: "relative", width: "100%" }}>
                    <Lock style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 18,
                      height: 18,
                      color: "#9ca3af",
                      pointerEvents: "none",
                    }} />
                    <input
                      placeholder="Create a strong password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: "44px", paddingRight: "44px" }}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPassword 
                        ? <EyeOff style={{ width: 18, height: 18, color: "#9ca3af" }} />
                        : <Eye style={{ width: 18, height: 18, color: "#9ca3af" }} />
                      }
                    </button>
                  </div>
                  <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                    Must be at least 8 characters with a number and symbol
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <Button variant="outline" onClick={() => setStep(1)} className="h-12 rounded-xl flex-1">Back</Button>
                <Button onClick={handleStep2Next} className="h-12 rounded-xl flex-[2] bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shadow-primary/20">
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Phone Verification */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h2 className="font-heading text-2xl font-bold">Secure your account</h2>
                <p className="text-muted-foreground mt-1 text-sm">We'll send a 6-digit OTP to verify your mobile.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <Label style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Mobile Number</Label>
                  <div style={{ position: "relative", width: "100%" }}>
                    <Smartphone style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 18,
                      height: 18,
                      color: "#9ca3af",
                      pointerEvents: "none",
                    }} />
                    <span style={{
                      position: "absolute",
                      left: "40px",
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
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      style={{ ...inputStyle, paddingLeft: "76px" }}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                    />
                  </div>
                </div>

                <div style={{
                  backgroundColor: "#ecfdf5",
                  color: "#047857",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  lineHeight: 1.5,
                }}>
                  <CheckCircle2 style={{ width: 20, height: 20, flexShrink: 0, marginTop: "1px" }} />
                  <p style={{ margin: 0 }}>Your Aadhaar KYC will be linked to this number for seamless verification later.</p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <Button variant="outline" onClick={() => setStep(2)} className="h-12 rounded-xl flex-1">Back</Button>
                  <Button 
                    onClick={async () => {
                      if (phone.length === 10) {
                        setIsLoading(true);
                        try {
                          // 1. Call Register Backend
                          await registerUser({
                            name: fullName,
                            username: username,
                            email: email,
                            phone: phone,
                            password: password,
                          });
                          
                          // 2. Trigger OTP for Login
                          await loginUser(phone);
                          
                          sessionStorage.setItem('pending_phone', phone);
                          showToast("Registration successful! OTP sent.", "success");
                          navigate('/verify-otp');
                        } catch (err: any) {
                          showToast(err.message || "Registration failed", "error");
                        } finally {
                          setIsLoading(false);
                        }
                      } else {
                        setErrors(prev => ({ ...prev, phone: "Enter a valid 10-digit number" }));
                      }
                    }} 
                    disabled={isLoading}
                    className="h-12 rounded-xl flex-[2] bg-gradient-to-r from-[#a33900] to-[#cc4900] text-white font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-70"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Send OTP & Finish
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

