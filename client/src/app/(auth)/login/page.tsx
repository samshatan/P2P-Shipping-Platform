import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Smartphone, Mail } from "lucide-react";

import { useNavigate } from "react-router-dom";
export default function LoginPage() {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(45);
  const [otpSent, setOtpSent] = useState(false);

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
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/10 border-2 border-secondary flex items-center justify-center text-xs font-bold backdrop-blur-sm">
                  User
                </div>
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

          <Tabs defaultValue="mobile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="mobile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Smartphone className="w-4 h-4 mr-2" /> Phone
              </TabsTrigger>
              <TabsTrigger value="email" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Mail className="w-4 h-4 mr-2" /> Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mobile" className="space-y-6">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label>Mobile Number</Label>
                    <div className="flex relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">+91</span>
                      <Input placeholder="98765 43210" className="pl-12 h-12 bg-white outline-variant border-border/80 focus-visible:ring-primary/20 transition-all rounded-xl" type="tel" maxLength={10} />
                    </div>
                  </div>
                  <Button className="w-full h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 text-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5" onClick={() => setOtpSent(true)}>
                    Send OTP
                  </Button>
                </>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Enter 6-digit OTP</Label>
                      <button onClick={() => setOtpSent(false)} className="text-xs text-primary font-semibold hover:underline">Change Number</button>
                    </div>
                    <div className="flex justify-between gap-2">
                      {[1,2,3,4,5,6].map(i => (
                        <Input key={i} className="h-14 w-12 text-center text-lg font-bold rounded-xl border-border/80 bg-white shadow-sm focus-visible:ring-primary focus-visible:border-primary" maxLength={1} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Resend code in <span className="font-semibold text-foreground">00:{timer < 10 ? `0${timer}` : timer}</span>
                    </p>
                  </div>
                  <Button onClick={() => navigate('/dashboard')} className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 transition-all">
                    Verify & Log In
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input placeholder="name@company.com" className="h-12 bg-white rounded-xl" type="email" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Password</Label>
                    <Link to="#" className="text-xs text-primary font-semibold hover:underline">Forgot password?</Link>
                  </div>
                  <Input placeholder="••••••••" className="h-12 bg-white rounded-xl" type="password" />
                </div>
                <Button onClick={() => navigate('/dashboard')} className="w-full h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 text-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5">
                  Log In
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-semibold">Or continue with</span>
            </div>
          </div>

          <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full h-12 bg-white rounded-xl font-medium border-border/80 text-foreground hover:bg-muted/50 transition-colors">
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
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
